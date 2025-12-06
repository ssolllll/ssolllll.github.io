---
layout: page
title: "사이버 보안 위협 탐지 AI 연구"
description: "HTTP 패킷 분석을 위한 도메인 특화 Tokenizer 개발 및 이상 탐지(Anomaly Detection) 모델 연구"
img: assets/img/ctilab_packet_thumb.jpg
importance: 1
category: Ctilab
---

### 📌 연구 개요
[cite_start]네트워크 패킷 데이터를 분석하여 사이버 공격을 자동으로 프로파일링하고 탐지하는 NLP 기반 보안 모델을 연구 개발했습니다. [cite: 97, 105]

* [cite_start]**기간:** 2023.08 ~ 2024.06 [cite: 90]
* [cite_start]**개발 환경:** Linux, Docker, PyTorch, Huggingface [cite: 93, 100]

---

### 🔬 핵심 연구 내용 (Key Research)

#### 1. 도메인 특화 Tokenizer 개발
일반적인 자연어와 다른 HTTP 패킷 데이터의 특성을 반영하기 위해, **Domain-Specific Tokenizer**를 직접 학습시켜 적용했습니다. [cite_start]이를 통해 보안 로그의 패턴 학습 효율을 높였습니다. [cite: 99]

#### 2. LLM 기반 오토 프로파일링 & PEFT 최적화
공격 패킷의 특성을 분석하여 자동으로 공격 유형을 분류(Profiling)하는 모델을 개발했습니다. [cite_start]거대 언어 모델의 파라미터를 효율적으로 튜닝하기 위해 **PEFT(Parameter-Efficient Fine-Tuning)** 기법을 적용하여 추론 속도와 학습 효율을 개선했습니다. [cite: 97, 101, 103]

#### 3. Anomaly Detection (이상 탐지)
[cite_start]정상 패킷 흐름을 학습한 뒤, 이를 벗어나는 비정상 패턴을 탐지하는 MLM(Masked Language Modeling) 기반의 이상 탐지 모델을 설계하고 구현했습니다. [cite: 104, 107]