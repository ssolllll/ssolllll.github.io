---
layout: post
title: "[Transformers] LLM 경량화와 가속: Quantization부터 Flash Attention까지"
date: 2025-12-12 10:00:00
description: BitsAndBytes를 활용한 4bit 양자화(QLoRA) 원리와 Flash Attention 2 적용법. KV Cache의 중요성까지, 모델 성능을 극한으로 끌어올리는 최적화 기법 총정리.
tags: python transformers quantization optimization cuda
categories: engineering
---

거대 언어 모델(LLM)을 다룰 때 가장 큰 장벽은 '비용'이다. 
수천만 원짜리 A100 GPU를 마음껏 쓸 수 있다면 좋겠지만, 현실은 제한된 VRAM(24GB, 48GB) 안에서 최대한의 성능을 뽑아내야 한다.

다행히 Hugging Face 생태계는 **모델의 크기를 줄이는(Quantization)** 기술과 **연산 속도를 높이는(Acceleration)** 기술을 매우 쉽게 사용할 수 있도록 통합해 두었다.

이번 시리즈의 마지막 포스트에서는 엔지니어링 관점에서 반드시 적용해야 할 3가지 최적화 기법을 다룬다.

---

## 1. Quantization: 4-bit의 마법 (feat. BitsAndBytes)

양자화(Quantization)는 32비트(float32)나 16비트(float16)로 표현된 가중치를 8비트(int8) 또는 4비트(nf4)로 압축하여 표현하는 기술이다. 
놀라운 점은 4비트로 줄여도 모델의 성능 저하가 미미하다는 것이다.

### 🔴 Bad Practice: 무조건 원본 로드
70B 모델을 fp16으로 로드하면 약 140GB의 VRAM이 필요하다. 이는 A100(80GB) 2장을 써야 겨우 올라가는 크기다.

### 🟢 Best Practice: `BitsAndBytesConfig` (4-bit Loading)
`bitsandbytes` 라이브러리를 통해 모델을 4비트로 로드하면 용량이 약 1/4로 줄어든다. 
이를 통해 **Llama-2-70B 모델을 48GB GPU(A6000, L40) 한 장**에 올릴 수 있다.



```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# 4bit 양자화 설정 (QLoRA 학습 시 필수)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",       # 정규분포에 최적화된 Normal Float 4
    bnb_4bit_compute_dtype=torch.bfloat16, # 연산은 bf16으로 수행 (속도/성능 보존)
    bnb_4bit_use_double_quant=True,  # 양자화 상수를 한 번 더 양자화 (메모리 추가 절약)
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)
```

이 설정은 파인튜닝 기법인 **QLoRA(Quantized LoRA)**의 기반이 되며, 소비자용 GPU(RTX 3090/4090)에서도 LLM 학습을 가능하게 만든 일등공신이다.

---

## 2. Flash Attention 2: 메모리 대역폭 병목 해소

Transformer 구조의 핵심인 Attention 메커니즘은 입력 시퀀스 길이($N$)의 제곱($N^2$)에 비례하여 연산량과 메모리 사용량이 증가한다. 문장이 길어질수록 급격히 느려지는 이유다.

**Flash Attention**은 GPU 메모리(HBM) 접근 횟수를 획기적으로 줄여(IO-Aware), 긴 문맥 처리 속도를 2배 이상 빠르게 만든다.

### 적용 방법
복잡한 구현 없이 `use_flash_attention_2=True` 옵션만 켜면 된다. (단, Ampere 아키텍처 이상의 GPU 필요: A100, A10, RTX 30/40 시리즈)

```python
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-chat-hf",
    torch_dtype=torch.bfloat16, 
    attn_implementation="flash_attention_2" # 핵심 옵션
)
```

> **Benchmark:** 입력 토큰이 4096 이상일 때, 일반 Attention 대비 **2~3배의 속도 향상**과 메모리 절약 효과를 볼 수 있다. RAG(검색 증강 생성)처럼 긴 문서를 다루는 서비스에서는 필수 옵션이다.

---

## 3. KV Cache: 했던 계산 또 하지 않기

LLM은 다음 토큰을 예측할 때, 이전의 모든 토큰 정보를 다시 참조한다. 매번 처음부터 다시 계산하는 것은 엄청난 낭비다.
**Key-Value (KV) Cache**는 이전 토큰들의 연산 결과(Key, Value)를 메모리에 저장해두고 재사용하는 기술이다.



### 🟢 Best Practice: `use_cache=True`
대부분의 모델에서 기본값은 `True`이지만, 학습(Training) 시에는 메모리 절약을 위해 `False`로 끄는 경우가 많다. 
따라서 **추론(Inference) 단계에서는 반드시 켜져 있는지 확인**해야 한다.

```python
# 1. 모델 설정에서 확인
model.config.use_cache = True

# 2. generation 호출 시 명시
output = model.generate(
    input_ids,
    max_new_tokens=100,
    use_cache=True 
)
```

KV Cache를 끄면 문장이 길어질수록 생성 속도가 선형적으로 느려지지만, 켜면 문장 길이에 상관없이 일정한 속도(O(1) per token)를 유지할 수 있다.

---

## Series Conclusion: LLM 엔지니어링의 여정

총 5편에 걸쳐 `transformers` 라이브러리를 활용한 LLM 엔지니어링 핵심 기술을 살펴보았다.

1.  **Tokenizer:** Rust 기반 가속과 Dynamic Padding으로 입력 파이프라인 최적화.
2.  **Model Loading:** `device_map`과 `fp16`으로 OOM 없는 로딩.
3.  **Inference:** `GenerationConfig`와 `Streamer`로 상용 수준의 서비스 구현.
4.  **Training:** `Trainer`와 `Callback`으로 안정적인 학습 파이프라인 구축.
5.  **Optimization:** `Quantization`과 `Flash Attention`으로 극한의 효율성 달성.

이 시리즈가 단순한 코드 복사-붙여넣기를 넘어, **"왜 이렇게 설정해야 하는가?"**에 대한 엔지니어링적 통찰을 제공했기를 바란다. 이제 여러분의 데이터를 모델에 태워볼 차례다. Happy Engineering!