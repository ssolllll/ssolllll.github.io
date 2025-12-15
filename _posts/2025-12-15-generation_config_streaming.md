---
layout: post
title: "[Transformers] LLM 추론 제어: GenerationConfig와 실시간 Streaming 구현"
date: 2025-12-07 10:00:00
description: 하드코딩된 파라미터를 GenerationConfig로 분리하여 관리하는 MLOps 노하우와 TextIteratorStreamer를 활용한 ChatGPT 스타일의 실시간 토큰 스트리밍 구현법.
tags: python transformers llm streaming inference backend
categories: engineering
---

LLM을 서비스에 도입할 때 사용자들이 가장 먼저 체감하는 성능 지표는 무엇일까?
전체 답변이 완성되는 시간(Total Latency)보다, **첫 번째 글자가 화면에 찍히는 시간(TTFT, Time To First Token)**이다.

`model.generate()` 함수는 기본적으로 모든 생성이 끝날 때까지 블로킹(Blocking)된다. 챗봇 서비스에서 사용자에게 10초 동안 로딩 바만 보여주는 것은 최악의 경험이다.

이번 포스트에서는 `transformers` 라이브러리를 사용해 **ChatGPT처럼 글자가 타닥타닥 찍히는 스트리밍**을 구현하는 방법과, 복잡한 생성 하이퍼파라미터를 코드가 아닌 설정 파일로 관리하는 **GenerationConfig** 활용법을 다룬다.

---

## 1. GenerationConfig: 파라미터 하드코딩 멈춰!

`temperature`, `top_p`, `repetition_penalty` 등 LLM의 답변 품질을 결정하는 수많은 파라미터들이 있다. 이를 함수 인자에 하드코딩하는 것은 유지보수 측면에서 좋지 않다.

### 🔴 Bad Practice: 하드코딩
```python
# 코드를 수정해야만 답변 스타일을 바꿀 수 있음
output = model.generate(
    input_ids, 
    max_new_tokens=512, 
    temperature=0.7, 
    top_p=0.9, 
    do_sample=True
)
```

### 🟢 Best Practice: GenerationConfig 객체 사용
`GenerationConfig`를 사용하면 파라미터를 객체로 관리할 수 있으며, JSON으로 저장하거나 불러오기가 쉬워 **MLOps(실험 관리)** 관점에서 유리하다.

```python
from transformers import GenerationConfig

# 1. 설정 생성 및 저장
config = GenerationConfig(
    max_new_tokens=512,
    temperature=0.7,
    top_p=0.9,
    do_sample=True,
    repetition_penalty=1.1
)
config.save_pretrained("./my_chat_config")

# 2. 로드 및 사용 (코드는 그대로 두고 설정 파일만 바꿔서 배포 가능)
loaded_config = GenerationConfig.from_pretrained("./my_chat_config")
output = model.generate(input_ids, generation_config=loaded_config)
```

> **Tip:** 모델마다 "창의적인 모드", "정확한 모드" 등 여러 프리셋을 미리 만들어두고 `config`만 교체하여 요청을 처리할 수 있다.

---

## 2. Streamer: 실시간 토큰 출력 (Feat. Thread)

사용자 경험(UX)을 혁신적으로 개선하는 스트리밍은 `TextIteratorStreamer`를 통해 구현한다.
핵심은 `model.generate()`가 메인 스레드를 점유하지 않도록 **별도 스레드(Thread)**에서 실행해야 한다는 점이다.



### 구현 패턴 (Standard Pattern)

```python
from threading import Thread
from transformers import TextIteratorStreamer

# 1. Streamer 준비
# skip_prompt=True: 입력했던 질문은 다시 출력하지 않음
streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

# 2. Generate 함수에 전달할 인자 준비
generate_kwargs = dict(
    input_ids=inputs["input_ids"],
    streamer=streamer,
    generation_config=loaded_config
)

# 3. 별도 스레드에서 생성 시작 (Non-blocking)
# thread를 쓰지 않으면 generate가 끝날 때까지 아래 for문이 실행되지 않음
thread = Thread(target=model.generate, kwargs=generate_kwargs)
thread.start()

# 4. 메인 스레드에서는 Streamer에서 나오는 토큰을 실시간으로 소비
print("Assistant: ", end="")
for new_text in streamer:
    # 여기서 WebSocket이나 Server-Sent Events(SSE)로 클라이언트에 전송
    print(new_text, end="", flush=True)

# 스레드 종료 대기
thread.join()
```

이 코드는 `FastAPI`나 `Flask` 같은 백엔드 프레임워크와 결합하여 **SSE(Server-Sent Events)** 엔드포인트를 구축할 때 그대로 사용되는 핵심 로직이다.

---

## 3. StoppingCriteria: 생성을 강제로 멈추는 안전장치

가끔 LLM이 문장을 끝맺지 못하고 `\n\nUser: \n\nUser:` 처럼 무한 루프에 빠지거나, 특정 단어가 나오면 즉시 생성을 멈춰야 할 때가 있다. `EOS(End of Sentence)` 토큰만 믿기에는 불안하다.

이때 `StoppingCriteria`를 사용한다.

```python
from transformers import StoppingCriteria, StoppingCriteriaList
import torch

class StopOnWord(StoppingCriteria):
    def __init__(self, stop_word_id):
        self.stop_word_id = stop_word_id

    def __call__(self, input_ids, scores, **kwargs):
        # 방금 생성된 토큰이 금지어(stop_word)와 같으면 True 반환 -> 생성 중단
        return input_ids[0, -1] == self.stop_word_id

# 예: "###" 이라는 토큰이 나오면 즉시 멈춤
stop_criteria = StoppingCriteriaList([StopOnWord(tokenizer.encode("###")[0])])

model.generate(
    input_ids, 
    stopping_criteria=stop_criteria
)
```

이 기능은 프롬프트 인젝션을 방어하거나, 멀티턴 대화에서 모델이 사용자 역할까지 연기하는 것을 방지하는 데 필수적이다.

---

## 결론

LLM 추론 제어 기술은 단순히 텍스트를 생성하는 것을 넘어, **사용자가 기다릴 수 있는 속도**와 **의도된 대로만 행동하게 하는 통제권**을 확보하는 것이다.

* **GenerationConfig:** 하이퍼파라미터의 버전 관리와 디커플링.
* **Streamer + Thread:** TTFT를 줄이고 체감 속도를 높이는 UX의 핵심.
* **StoppingCriteria:** 모델의 폭주를 막는 안전장치.

이제 모델을 로드하고(`Model Loading`), 입력을 최적화하고(`Tokenizer`), 출력을 제어(`Inference Control`)하는 방법까지 익혔다. 다음 포스트에서는 이 모델을 우리 데이터에 맞게 튜닝하는 **Training Loop와 Trainer API 활용법**에 대해 다루겠다.