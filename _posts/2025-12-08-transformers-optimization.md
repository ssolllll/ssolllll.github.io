---
layout: post
title: "[Transformers] LLM 성능의 시작점, Tokenizer 최적화 및 활용 전략"
date: 2025-12-07 18:00:00
description: Hugging Face Tokenizer의 Rust 기반 가속, Dynamic Padding을 통한 연산량 절감, 그리고 Chat Template을 활용한 프롬프트 엔지니어링 표준화 가이드.
tags: python transformers llm optimization nlp
categories: engineering
---

LLM 엔지니어링에서 모델(Model) 아키텍처나 양자화(Quantization)에는 많은 관심을 갖지만, 정작 데이터가 모델로 들어가는 첫 관문인 **Tokenizer**의 효율성은 간과하는 경우가 많다.

하지만 수십 기가바이트의 텍스트를 처리하는 Pre-training/Fine-tuning 단계나, 실시간으로 요청을 처리하는 Serving 단계에서 비효율적인 Tokenizer 사용은 전체 파이프라인의 **심각한 병목(Bottleneck)**이 될 수 있다.

이번 포스트에서는 `transformers` 라이브러리의 Tokenizer를 엔지니어링 관점에서 100% 활용하는 세 가지 핵심 전략을 다룬다.

---

## 1. Fast Tokenizer: Rust의 속도를 빌려라

Hugging Face의 `transformers`는 두 가지 타입의 토크나이저를 제공한다.
1. **Python Tokenizer:** 순수 파이썬 구현체. 느리다.
2. **Fast Tokenizer:** Rust로 구현된 `tokenizers` 라이브러리 래퍼(Wrapper). 매우 빠르다.

대부분 `AutoTokenizer.from_pretrained()`를 호출하면 자동으로 Fast 버전을 가져오지만, 명시적으로 확인하고 사용하는 습관이 중요하다.

### ⚡ 성능 차이 벤치마크
수백만 건의 데이터를 전처리할 때, 이 속도 차이는 데이터 로딩 시간(Data Loading Time)을 몇 시간에서 몇 분으로 줄여준다.

```python
from transformers import AutoTokenizer
import time

model_id = "gpt2"
text = "The quick brown fox jumps over the lazy dog." * 1000

# 1. Slow Tokenizer (Python)
slow_tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False)
start = time.time()
for _ in range(100):
    slow_tokenizer(text)
print(f"Slow: {time.time() - start:.4f} sec")

# 2. Fast Tokenizer (Rust)
fast_tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
start = time.time()
for _ in range(100):
    fast_tokenizer(text)
print(f"Fast: {time.time() - start:.4f} sec")

# 결과 예시:
# Slow: 1.2031 sec
# Fast: 0.1054 sec (약 10배 이상 빠름)
```

> **Tip:** `FastTokenizer`는 병렬 처리(Parallelism) 기능도 내장하고 있어, `batched=True` 옵션과 함께 사용 시 CPU 코어를 최대한 활용한다.

---

## 2. Dynamic Padding: 불필요한 연산량 줄이기

LLM은 배처(Batch) 처리를 위해 입력 시퀀스의 길이를 통일해야 한다. 이때 부족한 부분을 채우는 것이 **Padding**이다.

### 🔴 Bad Practice: 고정 길이 Padding
모든 데이터를 모델의 `max_length`(예: 2048)에 맞춰 패딩하면, "Hello" 같은 짧은 문장도 2043개의 패딩 토큰(`pad_token`)을 계산해야 한다. 이는 GPU 메모리와 연산력의 낭비다.

```python
# 비효율적인 방식: 무조건 max_length까지 늘림
tokenized = tokenizer(
    ["Hello", "Hi"], 
    padding="max_length", 
    max_length=2048, 
    truncation=True
)
# 결과: [Hello, PAD, PAD, ..., PAD] -> 불필요한 연산 발생
```

### 🟢 Best Practice: Dynamic Padding (DataCollator)
배치(Batch) 내에서 **가장 긴 문장의 길이에 맞춰서** 패딩하는 방식이다. 데이터셋 전체가 아닌, 미니 배치 단위로 길이를 맞추므로 연산량이 획기적으로 줄어든다.



```python
from transformers import DataCollatorWithPadding

# 데이터셋 단계에서는 패딩하지 않음 (truncation만 적용)
def preprocess_function(examples):
    return tokenizer(examples["text"], truncation=True)

# DataLoader가 배치를 만들 때 패딩 수행
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# Trainer나 DataLoader에 collator 전달
# trainer = Trainer(..., data_collator=data_collator)
```

이 방식을 적용하면 학습 속도가 데이터 길이에 따라 **20~30% 이상 향상**될 수 있다.

---

## 3. Chat Template: 프롬프트 엔지니어링의 표준화

LLM마다 요구하는 프롬프트 포맷이 다르다. (Llama-2의 `[INST]`, ChatML의 `<|im_start|>`, Alpha의 `Human:` 등)
이를 하드코딩으로 문자열을 합치는 방식은 모델 교체 시 코드를 전면 수정해야 하는 리스크가 있다.

### `apply_chat_template` 활용
`transformers` 4.34.0부터 도입된 이 기능은 모델의 `tokenizer_config.json`에 정의된 템플릿을 자동으로 적용해준다.

```python
messages = [
    {"role": "user", "content": "RAG 시스템의 장점은?"},
    {"role": "assistant", "content": "최신 정보를 반영할 수 있다는 점입니다."},
    {"role": "user", "content": "단점은?"}
]

# 모델에 맞는 포맷으로 자동 변환
prompt = tokenizer.apply_chat_template(
    messages, 
    tokenize=False, 
    add_generation_prompt=True
)

print(prompt)
# Llama-2인 경우: <s>[INST] RAG 시스템의 장점은? [/INST] 최신 정보를 ... </s><s>[INST] 단점은? [/INST]
# Mistral인 경우: ... (해당 모델 포맷 자동 적용)
```

이 기능을 사용하면 **모델 의존성(Model Dependency)을 코드에서 분리**할 수 있어, 여러 모델을 실험하거나 A/B 테스트를 진행할 때 유지보수성이 극대화된다.

---

## 결론

Tokenizer는 단순히 자연어 처리를 위한 전처리 도구가 아니다. 
* **Rust 기반 Fast Tokenizer**로 CPU 병목을 해소하고,
* **Dynamic Padding**으로 GPU 연산 효율을 높이며,
* **Chat Template**으로 코드의 유연성을 확보하는 것.

이것이 LLM 엔지니어가 갖춰야 할 "입력 파이프라인 최적화"의 기본기다. 다음 포스트에서는 이렇게 처리된 데이터를 거대 모델에 효율적으로 적재하는 **Model Loading 전략**에 대해 다루겠다.