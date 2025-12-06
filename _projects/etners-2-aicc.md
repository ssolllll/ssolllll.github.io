---
layout: page
title: "AICC (AI Contact Center) 고도화"
description: "Whisper STT 및 KV Caching 도입을 통한 음성 응답률 21.4% → 97.3% 개선"
img: assets/img/etners_aicc_thumb.jpg
importance: 2
category: Etners
---

### 📌 프로젝트 개요
[cite_start]기존 AICC 시스템의 낮은 응답률(21.4%) 문제를 해결하기 위해 음성 인식(STT)부터 응답 생성(RAG), 음성 합성(TTS)에 이르는 전체 파이프라인을 재설계한 프로젝트입니다. [cite: 54, 57]

* **기간:** 2025.05
* [cite_start]**역할:** 시스템 설계, STT-TTS 파이프라인 개발 [cite: 55]
* [cite_start]**성과:** 응답 성공률을 **97.3%**까지 끌어올려 6개 지역 서비스로 확장 적용되었습니다. [cite: 60, 61, 63]

---

### 🛠 Tech Stack

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Whisper](https://img.shields.io/badge/OpenAI_Whisper-STT-412991)
![FAISS](https://img.shields.io/badge/FAISS-VectorDB-blue)
![Redis](https://img.shields.io/badge/KV_Caching-Redis-DC382D)

---

### 👨‍💻 문제 해결 (Problem Solving)

#### 1. 인식률 저조 문제 해결 (Whisper 도입)
기존 레거시 STT 엔진의 낮은 정확도로 인해 고객의 발화를 제대로 인식하지 못하는 문제가 있었습니다. [cite_start]이를 **OpenAI Whisper** 모델로 교체하고, 도메인 특화 용어에 대한 후처리 로직을 추가하여 인식률을 극대화했습니다. [cite: 57]

#### 2. 실시간 응답 속도 확보 (KV Caching)
음성 대화의 특성상 지연 시간(Latency)이 사용자 경험에 치명적입니다. [cite_start]이를 해결하기 위해 **KV Caching** 구조를 도입하여 반복되는 쿼리나 유사한 질문에 대한 검색 속도를 획기적으로 단축했습니다. [cite: 59]

#### 3. RAG 기반 정확도 향상
[cite_start]상담 매뉴얼을 **Vector DB(FAISS)**에 임베딩하여 저장하고, 고객 질문과 가장 유사한 답변을 검색하여 생성하도록 구성함으로써 환각(Hallucination) 현상을 줄이고 답변 정확도를 높였습니다. [cite: 58]