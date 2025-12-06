---
layout: post
title: '[Python] LLM 추론 최적화를 위한 collections 모듈 심층 분석'
date: 2025-12-05 10:00:00
description: 단순한 문법 소개가 아닌, LLM 서빙 및 데이터 파이프라인에서 Latency와 메모리를 절약하는 Engineering Technique으로서의 collections 모듈 분석.
tags: python llm optimization backend
categories: engineering
---

LLM(Large Language Model) 서비스를 개발하다 보면 모델 자체의 추론 속도(Inference Latency)뿐만 아니라, 전후처리 파이프라인(Pre/Post-processing Pipeline)의 효율성이 전체 시스템 성능을 좌우하는 경우를 자주 마주한다.

특히 Python의 기본 자료구조(`list`, `dict`)는 범용적이지만, **실시간 스트리밍 처리가 필요한 Chat Completions API**나 **수십만 개의 Vector Search 결과를 다루는 RAG(Retrieval-Augmented Generation)** 과정에서는 미세한 성능 저하와 불필요한 메모리 점유의 원인이 된다.

본 포스트에서는 `collections` 모듈을 단순한 편의 도구가 아닌, **엔지니어링 관점의 최적화 도구**로 재해석하고 LLM 실무 적용 사례를 기록한다.

---

## 1. deque: Context Window 관리와 Streaming Buffer

LLM은 입력 가능한 토큰 길이(Context Window)에 물리적 한계가 있다. 챗봇 구현 시 가장 오래된 대화를 삭제하고 새 대화를 넣는 **Sliding Window** 전략이 필수적이다. 또한, SSE(Server-Sent Events) 스트리밍 시 문장 단위 처리를 위한 버퍼링에도 큐 구조가 필요하다.

### 🔴 Bad Practice: `list` 사용
Python의 `list`는 동적 배열(Dynamic Array)이다. `pop(0)` 연산은 첫 번째 요소를 제거한 뒤, 나머지 **모든 요소의 인덱스를 한 칸씩 당겨오는(Shift)** 작업을 수행한다.
* **시간 복잡도:** $O(N)$
* **문제점:** 대화 턴(Turn)이 길어질수록, 동시 접속자가 늘어날수록 CPU 사이클을 낭비하며, GC(Garbage Collection) 압력을 높인다.

### 🟢 Best Practice: `deque` (Circular Buffer)
`collections.deque`는 Linked List 기반의 양방향 큐다. 양 끝단에서의 삽입/삭제가 메모리 이동 없이 포인터 변경만으로 이루어진다.

![Deque vs List Memory Structure](/assets/img/deque_vs_list_memory.png)

```python
from collections import deque

class ContextManager:
    def __init__(self, max_turns=10):
        # maxlen을 지정하면 꽉 찼을 때 append 시 
        # 자동으로 반대편 데이터가 O(1)로 삭제됨 (Memory Allocation 발생 안 함)
        self.buffer = deque(maxlen=max_turns)

    def add_dialogue(self, user, assistant):
        # 튜플로 저장하여 불변성(Immutability) 보장 및 메모리 절약
        self.buffer.append(("user", user))
        self.buffer.append(("assistant", assistant))

    def get_prompt_context(self):
        # LLM API 요청 직전에만 list로 변환 (변환 비용은 무시할 수준)
        return [{"role": r, "content": c} for r, c in self.buffer]
```

> **Key Engineering Point:** `maxlen`을 설정한 `deque`는 링 버퍼(Ring Buffer)처럼 동작하여, 오래된 데이터를 삭제하는 코드를 별도로 작성할 필요가 없어 코드가 간결해지고 실수가 줄어든다.

---

## 2. namedtuple: 대규모 Vector Search 결과의 메모리 경량화

RAG(검색 증강 생성) 시스템에서는 Vector DB로부터 수천 개의 청크(Chunk)를 검색하고, 이를 Reranking 하는 과정을 거친다. 이때 각 검색 결과를 `dict`로 관리하는 것은 메모리 비효율적이다.

### 🔴 Bad Practice: `dict` 리스트 사용
Python의 `dict`는 해시 테이블 구조로, 데이터를 저장할 때 Key 값 자체와 해시 충돌 방지를 위한 추가 공간을 점유한다. 객체 하나당 오버헤드가 크다.

```python
# 일반적인 딕셔너리 구조
docs = [
    {"id": "doc_1", "score": 0.89, "content": "..."} 
    for _ in range(10000)
]
# 수만 건의 검색 결과 처리 시 메모리 사용량 급증
```

### 🟢 Best Practice: `namedtuple` 활용
`collections.namedtuple`은 내부적으로 튜플(Tuple) 구조를 사용하되, 필드명으로 접근할 수 있게 해준다. `__dict__` 속성을 가지지 않아 메모리 사용량이 현저히 적다.

```python
from collections import namedtuple
import sys

# 검색 결과 구조체 정의
SearchResult = namedtuple("SearchResult", ["id", "score", "content"])

# 메모리 사용량 비교 실험
d = {"id": "1", "score": 0.9, "content": "A"}
n = SearchResult(id="1", score=0.9, content="A")

print(f"Dict Size: {sys.getsizeof(d)} bytes")       # 예: 232 bytes
print(f"NamedTuple Size: {sys.getsizeof(n)} bytes") # 예: 72 bytes
# -> 약 3배 이상의 메모리 절약 효과
```

**적용 시나리오:**
* Vector DB에서 가져온 1차 후보군(Top-K 100~1000개)을 메모리에 올릴 때.
* Reranker 모델에 배치(Batch)로 데이터를 넘기기 전 전처리 과정.

---

## 3. defaultdict: 문서 청크(Chunk) 그룹핑 가속화

긴 문서를 처리할 때, 여러 개의 청크로 나뉘어 처리된 결과를 다시 원본 문서 ID 기준으로 합쳐야 하는 경우가 있다(Map-Reduce 패턴).

### 🔴 Bad Practice: `if key in dict` 체크
```python
results = {}
for chunk in chunk_results:
    doc_id = chunk['doc_id']
    if doc_id not in results:
        results[doc_id] = []
    results[doc_id].append(chunk['summary'])
```
이 방식은 매 반복마다 Key 존재 여부를 해싱하여 검사하므로 불필요한 연산이 포함된다.

### 🟢 Best Practice: `defaultdict`
`collections.defaultdict`는 Key가 없을 때의 초기화 로직을 C 레벨에서 처리하므로, Python 레벨의 분기문(Branching)을 제거하여 루프 속도를 높인다.

```python
from collections import defaultdict

# 원본 문서 ID별로 요약본을 모으는 파이프라인
aggregated_data = defaultdict(list)

for chunk in chunk_results:
    # Key 검사 로직 삭제 -> 코드 가독성 향상 및 속도 최적화
    aggregated_data[chunk['doc_id']].append(chunk['summary'])
```

---

## 4. ChainMap: LLM 하이퍼파라미터 계층 관리

LLM 추론 시 `Temperature`, `Top_p`, `Max_tokens` 등의 설정은 **[기본 설정] -> [유저 설정] -> [프롬프트별 임시 설정]** 순으로 우선순위를 가진다. 이를 `dict.update()`로 매번 새로운 딕셔너리를 생성하여 병합하는 것은 비효율적이다.

### 🟢 Best Practice: `ChainMap`
`collections.ChainMap`은 여러 딕셔너리를 실제로 병합(Copy)하지 않고, 연결된 리스트처럼 논리적으로만 병합하여 보여준다. 조회 시 앞쪽 딕셔너리부터 탐색한다.

```python
from collections import ChainMap

default_config = {"temperature": 0.7, "max_tokens": 512, "top_p": 0.9}
user_config = {"temperature": 0.5}  # 유저가 온도를 낮춤
request_override = {"max_tokens": 1024} # 이번 요청만 길게

# 새로운 딕셔너리 생성 없이 논리적 뷰만 생성 (Zero-copy)
final_config = ChainMap(request_override, user_config, default_config)

print(final_config['temperature']) # 0.5 (user_config 적용)
print(final_config['max_tokens'])  # 1024 (request_override 적용)
print(final_config['top_p'])       # 0.9 (default_config 적용)
```

이 방식은 요청마다 거대한 설정 객체를 복사할 필요가 없어 **High-Throughput API 서버**에서 GC 오버헤드를 줄이는 데 기여한다.

---

## 결론: Micro-Optimization이 모여 시스템 안정성을 만든다

Python은 느리다는 편견이 있지만, 내장된 `collections` 모듈을 적재적소에 활용하면 C로 구현된 내부 최적화의 혜택을 그대로 누릴 수 있다.

* **Queueing/History:** `deque`
* **Data Object:** `namedtuple`
* **Grouping:** `defaultdict`
* **Config Merging:** `ChainMap`

LLM 서비스는 텍스트라는 비정형 데이터를 대량으로 다루는 만큼, 이러한 자료구조의 선택이 **Latency(지연 시간)**와 **Memory Footprint(메모리 사용량)**에 미치는 영향이 생각보다 크다. 화려한 모델 튜닝 이전에, 견고한 데이터 파이프라인 구축이 선행되어야 함을 잊지 말자.