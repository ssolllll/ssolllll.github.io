---
layout: page
title: "AICC (AI Contact Center) 모델 고도화"
description: "LLM 기반 파이프라인 전환을 통한 응답 성공률 21.4% → 97.3% 개선"
img: assets/img/etners_aicc_thumb.jpg
importance: 1
category: Project
---

### 📌 프로젝트 개요
기존 사업장 확장 과정에서 발생한 레거시 NLP 모델의 성능 한계를 극복하기 위해, 음성 인식(STT)부터 응답 생성(RAG), 음성 합성(TTS)에 이르는 전체 파이프라인을 LLM 기반으로 재설계한 프로젝트입니다.

* **기간:** 2025.05
* **역할:** 시스템 아키텍처 설계, STT-TTS 파이프라인 및 LLM 응답 로직 개발
* **성과:** 응답 성공률 **97.3%** 달성 및 전국 6개 지역 서비스 확장 적용

---

### 🛠 Tech Stack

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Whisper](https://img.shields.io/badge/OpenAI_Whisper-STT-412991)
![FAISS](https://img.shields.io/badge/FAISS-VectorDB-blue)
![Redis](https://img.shields.io/badge/KV_Caching-Redis-DC382D)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)

---

### 🔍 문제 정의 (Problem Definition)

**"기존 레거시 NLP 모델의 확장성 및 정확도 한계"**

1. **정확도 저하 및 사업 확장 불가:** 신규 사업장 확장을 위해 기존 NLP 모델의 성능 개선이 필요했으나, 고객 응답 성공률이 21.4%에 그쳐 실사용이 어려운 수준이었습니다.
2. **레거시 아키텍처의 제약:** 정확도 향상을 위해 번호 하나당 3개의 모델을 병렬로 구현하려는 시도가 있었으나, 기존 시스템의 구조적 한계로 인해 도입이 불가능했습니다.
3. **LLM 전환 요청:** 위 문제를 해결하기 위해 기존 룰 기반/경량 NLP를 탈피하고, 복잡한 문맥 파악이 가능한 **LLM(Large Language Model)** 기반 응답 시스템으로의 전면 전환을 추진하게 되었습니다.

---

### 👨‍💻 문제 해결 (Problem Solving)

#### 1. 인식률 저조 문제 해결 (Whisper STT 도입)
기존 엔진의 낮은 인식률을 개선하기 위해 **OpenAI Whisper** 모델을 도입했습니다. 단순 모델 교체에 그치지 않고, 도메인 특화 용어(상담 전문 용어 등)에 대한 **후처리 로직(Post-processing)**을 추가하여 최종 인식 정확도를 극대화했습니다.

#### 2. 실시간 응답 속도 확보 (KV Caching & Redis)
음성 대화형 서비스에서 LLM의 추론 속도(Latency)는 사용자 경험에 직접적인 영향을 미칩니다.
* **KV Caching 구조 도입:** 반복되는 쿼리나 유사 질문에 대한 연산 부하를 줄이기 위해 KV Caching을 적용했습니다.
* **응답 지연 최소화:** 캐싱 전략을 통해 실시간 대화가 가능한 수준으로 응답 속도를 확보했습니다.

#### 3. RAG 기반 지식 답변 정확도 향상
방대한 상담 매뉴얼을 **Vector DB(FAISS)**에 임베딩하여 저장하고, 고객 질문과 가장 유사한 답변을 검색하여 생성하는 **RAG(Retrieval-Augmented Generation)** 구조를 구축했습니다. 이를 통해 모델의 환각 현상을 방지하고, 매뉴얼에 기반한 정확한 정보를 제공하도록 설계했습니다.

---

### 📈 프로젝트 성과 및 회고

* **지표 개선:** 낮은 응답 성공률(21.4%)을 **97.3%**까지 끌어올리는 혁신적인 결과를 얻었습니다.
* **비즈니스 가치:** 레거시에서 해결하지 못했던 기술적 병목을 LLM 아키텍처로 해결함으로써, 전국 6개 지역 서비스로의 성공적인 확장을 이끌어냈습니다.
* **회고:** 기존 NLP의 한계를 LLM으로 돌파하며, 단순한 기술 도입보다 **비즈니스 요구사항에 맞는 아키텍처 재설계**가 프로젝트 성공의 핵심임을 체감했습니다.