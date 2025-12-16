---
layout: post
title: "[Transformers] OOM 없는 세상: 거대 모델 메모리 적재 및 Offloading 전략"
date: 2025-12-07 10:00:00
description: AutoModel 로딩 시 발생하는 메모리 부족(OOM) 해결법. device_map을 활용한 Offloading 원리와 torch_dtype 설정을 통한 VRAM 최적화 가이드.
tags: python transformers llm gpu memory optimization
categories: engineering
---

LLM을 다루는 엔지니어에게 가장 두려운 에러 메시지는 단연 `CUDA out of memory`일 것이다. 모델의 파라미터 수는 7B, 13B를 넘어 70B, 405B로 커져가는데, 우리가 가진 GPU VRAM은 언제나 한정적이다.

단순히 `.to("cuda")`를 호출하는 방식은 딥러닝 초기(BERT 시절)의 유산이다. 수십 기가바이트에 달하는 LLM을 로딩할 때는 **Model Parallelism(모델 병렬화)**과 **Offloading(오프로딩)** 기술이 필수적이다.

이번 포스트에서는 `transformers` 라이브러리가 제공하는 스마트한 모델 로딩 기법들을 정리한다.

---

## 1. Precision(정밀도) 타협: fp32에서 fp16/bf16으로

모델의 가중치(Weight)를 어떤 데이터 타입으로 불러오느냐에 따라 메모리 사용량은 즉시 **50%** 절감된다.

* **float32 (Full Precision):** 파라미터당 4 bytes. (기본값)
* **float16 / bfloat16 (Half Precision):** 파라미터당 2 bytes.

### 🔴 Bad Practice: 기본 로딩
아무 옵션 없이 모델을 로드하면 기본적으로 `float32`로 로드되는 경우가 많다. 7B 모델 기준 약 **28GB**의 VRAM이 필요하다. (7B * 4bytes)

```python
# VRAM 낭비의 주범
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
model.to("cuda") 
```

### 🟢 Best Practice: `torch_dtype` 명시
`float16`을 사용하면 7B 모델을 약 **14GB**에 로드할 수 있다. Ampere 아키텍처(A100, A10, RTX 30/40 시리즈) 이상을 사용한다면 `bfloat16`을 사용하는 것이 학습 안정성 면에서 더 유리하다.

```python
import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.bfloat16  # 또는 torch.float16
)
```

---

## 2. Model Offloading: GPU가 넘치면 CPU로

모델이 GPU 메모리보다 클 때, 과거에는 "실행 불가"였다. 하지만 이제는 **Offloading** 기술을 통해 모델의 일부를 CPU RAM이나 디스크로 내려보내고, 추론 시 필요한 레이어만 GPU로 불러와 연산할 수 있다.

### 🟢 Best Practice: `device_map="auto"`

`accelerate` 라이브러리를 기반으로 작동하는 이 옵션은 모델의 레이어를 분석하여 최적의 배치 전략을 자동으로 짠다.



```python
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    torch_dtype=torch.float16,
    device_map="auto"  # 핵심 옵션
)

# 현재 모델이 어떻게 분산되었는지 확인
print(model.hf_device_map)
# 출력 예시:
# {
#   'model.embed_tokens': 0,        # GPU 0번
#   'model.layers.0': 0,
#   ...
#   'model.layers.40': 'cpu',       # GPU 꽉 차서 CPU로 이동
#   'lm_head': 'disk'               # RAM도 부족해서 디스크로 이동
# }
```

> **Tip:** 추론 속도는 당연히 느려지지만(PCIe 대역폭 병목), **"OOM으로 죽는 것보다 느리더라도 돌아가는 것이 낫다"**는 엔지니어링 원칙 하에 매우 유용한 옵션이다.

---

## 3. `max_memory`: 추론을 위한 여유 공간 확보

`device_map="auto"`는 가능한 한 GPU 메모리를 꽉 채워서 모델을 적재하려고 한다. 하지만 LLM 추론 시에는 모델 가중치 외에도 **KV Cache(Context 저장소)**와 **Activation**을 위한 동적 메모리 공간이 필요하다.

VRAM을 100% 모델 적재에 써버리면, 막상 추론을 시작하자마자 OOM이 발생한다. 이를 방지하기 위해 GPU 메모리 사용 한도를 제한해야 한다.

```python
# GPU 0번은 20GB까지만 쓰고, 나머지는 CPU(RAM) 100GB를 쓰겠다.
max_memory_mapping = {0: "20GiB", "cpu": "100GiB"}

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    device_map="auto",
    max_memory=max_memory_mapping
)
```

---

## 4. Initialization 최적화: `low_cpu_mem_usage`

PyTorch의 전통적인 모델 로딩 방식은 **1) 모델 구조(껍데기)를 RAM에 생성**하고 **2) 가중치 파일을 읽어서 덮어쓰는** 방식이다.
이 과정에서 모델 크기의 2배에 달하는 시스템 RAM이 순간적으로 필요하다. (RAM 폭발의 원인)

Hugging Face는 **Meta Device** 기술을 활용하여, 빈 껍데기를 생성하지 않고 가중치를 로드하는 `low_cpu_mem_usage=True` 옵션을 제공한다. (`device_map="auto"` 사용 시 기본값으로 켜짐)

```python
# 명시적으로 사용할 때
model = AutoModelForCausalLM.from_pretrained(
    "bigscience/bloom",
    low_cpu_mem_usage=True
)
```

---

## 결론

거대 모델을 로딩하는 것은 "어떻게 하면 GPU VRAM이라는 비싼 부동산을 알뜰하게 쓸 것인가"에 대한 문제다.

1.  **`torch_dtype`**: fp16/bf16으로 용량을 절반으로 줄여라.
2.  **`device_map="auto"`**: GPU 용량이 부족하면 CPU와 Disk를 활용해라.
3.  **`max_memory`**: 추론 시 생성될 토큰을 위해 VRAM에 여유 공간(Buffer)을 남겨둬라.

이 세 가지만 기억해도 로컬 환경이나 저사양 서버에서 LLM을 실험할 때 겪는 대부분의 메모리 문제는 해결된다. 다음 포스트에서는 이렇게 로드한 모델을 사용해 **실제 텍스트를 생성할 때(Inference)의 제어 기법**에 대해 알아보겠다.