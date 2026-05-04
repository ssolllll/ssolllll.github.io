---
layout: page
title: "연말정산 AI 도우미 챗봇"
description: "Kubernetes + vLLM 기반 On-premise LLM 서빙 — 동시 접속 1,000명 부하 테스트 완료"
img:
importance: 2
category: Etners
related_publications: false
---

### 📌 프로젝트 개요

연말정산 집중 기간의 대규모 문의를 자동화하기 위해, 기존 사내 QnA 챗봇 엔진을 **연말정산 세무 도메인으로 특화·확장**하고 **On-premise LLM 서빙 환경**을 구축한 프로젝트입니다.

* **기간:** 2025.12 ~ 2026.01
* **역할:** 아키텍처 설계, 부하 테스트 및 최적화, LLM 서빙
* **주요 성과:**
  * 동시 접속 **1,000명** 환경에서 지연 없는 응답 성능 확보
  * 내부 오픈소스 모델 활용으로 데이터 외부 유출 완전 차단
  * 연말정산 문의 업무 자동화로 인사·총무 담당자 업무 부하 대폭 경감

---

### 🛠 Tech Stack

![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)
![vLLM](https://img.shields.io/badge/vLLM-LLM_Serving-FF4B4B)
![Milvus](https://img.shields.io/badge/Milvus-VectorDB-009688)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)
![JMeter](https://img.shields.io/badge/JMeter-Load_Test-D22128?style=flat&logo=apachejmeter&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

### 🔍 핵심 기술 구현

#### 1. 대규모 트래픽 대응 인프라 설계
연말정산 집중 기간의 고부하 상황을 대비하여 **JMeter** 부하 테스트를 실시했습니다.

* **부하 테스트:** 동시 접속자 1,000명 기준 성능 검증 완료
* **오토스케일링:** Kubernetes(K8s) 기반으로 트래픽 변화에 유연하게 대응할 수 있는 인프라 구조 설계
* **Vector DB 고도화:** 기존 FAISS 대비 대용량 벡터 데이터 관리에 최적화된 **Milvus**를 메인 Vector DB로 채택

#### 2. On-premise LLM 내재화 (보안 강화)
민감한 개인정보 보호를 위해 외부 API 의존도를 완전히 제거했습니다.

* **내부 오픈소스 모델 서빙:** GPT-OSS를 **vLLM**으로 서빙하여 On-premise 환경 구축
* **데이터 보안:** 외부 API 호출 없이 사내 서버에서 모든 추론 처리
* **비용 최적화:** API 사용료 제거 및 GPU 자원 효율적 활용

#### 3. 도메인 특화 고도화
기존 범용 QnA 챗봇 엔진을 연말정산 특화 도메인으로 분리·확장했습니다.

* **전문 문서 색인화:** 복잡한 연말정산 세법 문서를 RAG 구조로 색인화하여 전문 질의응답 가능
* **FAQ 최적화:** 사용자 질문 패턴 분석을 통해 자주 묻는 질문에 대한 응답 정확도 및 처리 속도 최적화

---

### 📈 프로젝트 성과

| 항목 | 내용 |
|------|------|
| 트래픽 안정성 | 동시 접속 1,000명 환경에서 지연 없는 응답 성능 및 인프라 안정성 증명 |
| 보안성 | 내부 모델 활용으로 데이터 외부 유출 원천 차단 |
| 운영 효율화 | 연말정산 문의 업무 자동화로 담당자 업무 부하 대폭 경감 |
