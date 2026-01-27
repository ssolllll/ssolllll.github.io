---
layout: page
title: "사내 규정 검색 RAG 챗봇"
description: "LLM과 Vector DB를 활용하여 사내 문서를 검색하는 시스템 구축"
img: assets/img/project_etners_thumbnail.jpg  # 썸네일 이미지
importance: 1  # 1번이 가장 먼저 뜸
category: Etners # projects.md의 display_categories와 철자가 정확히 같아야 함
related_publications: false
---

### 📌 프로젝트 개요
사내 레거시 시스템이 없는 상태에서 기획부터 아키텍처 설계, 백엔드 개발, 운영 배포까지 전 과정을 **단독(Solo Engineer)**으로 수행한 **LLM 기반 사내 QnA 챗봇**입니다. 단순 검색을 넘어 복잡한 사내 규정을 논리적으로 추론하여 답변하는 Agent 시스템을 구축했습니다.

* **기간:** 2025.01 ~ 2025.06 (6개월)
* **역할:** AI Engineer (기여도 100% - 설계, 개발, 운영 단독 수행)
* **주요 성과:**
    * 통합 검색이 없던 환경에서 자연어 검색 도입으로 정보 탐색 시간 **약 50% 단축**
    * 단순 RAG 대비 복합 질문 처리 정확도 **85% 달성** (Agent 도입)
    * 정량적 평가 시스템(MLflow) 도입으로 답변 품질 모니터링 자동화

---

### 🎯 추진 배경 및 문제 정의
**1. 신규 입사자를 위한 정보 접근성 개선 (Accessibility)**
기존 임직원 포털에는 **통합 검색 기능이 부재**하여, 게시판별로 흩어진 정보를 일일이 찾아야 했습니다. 이로 인해 업무 흐름이 낯선 신규 입사자들이 필요한 규정을 찾는 데 많은 어려움을 겪었습니다. 이에 자연어 질의만으로 흩어진 문서를 한 번에 검색하고 답변받을 수 있는 인터페이스를 구축했습니다.

**2. 차세대 솔루션을 위한 Core 엔진 선행 개발 (Scalability)**
추후 진행될 **메신저 시스템 내 챗봇 탑재 로드맵**을 고려하여, 사내 웹페이지에 우선적으로 챗봇을 구현하는 전략을 수립했습니다. 웹 환경에서 핵심 RAG 엔진과 Agent 로직을 선제적으로 검증(PoC)함으로써, 향후 다양한 플랫폼으로 즉시 이식 가능한 API 기반 공통 모듈을 확보했습니다.

---

### 🛠 Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-FF4B4B?style=flat&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Milvus](https://img.shields.io/badge/Milvus-VectorDB-009688)
![MLflow](https://img.shields.io/badge/MLflow-0194E2?style=flat&logo=mlflow&logoColor=white)

---

### 시스템 아키텍처 및 핵심 기능 

#### 1. Agent 기반 워크플로우 (LangGraph)
초기의 단순 선형적인 RAG 구조(LangChain v0.1)는 복합적인 추론이 필요한 질문에 취약했습니다. 이를 해결하기 위해 상태(State) 관리가 가능한 **LangGraph**를 도입하여 에이전트(Agent) 구조로 고도화했습니다.

* **Dynamic Routing:** 질문의 의도를 분석하여 '단순 규정 검색'과 '연산/추론' 경로를 동적으로 분기 처리
* **Self-Correction:** 검색된 문서가 답변하기에 불충분할 경우, LLM이 스스로 판단하여 검색 쿼리를 재생성(Query Rewrite)하고 재검색하는 루프(Loop) 구현

#### 2. 데이터 기반 품질 평가 (LLM-as-a-judge)
RAG 시스템의 수정 배포 시 답변 품질 저하(Regression)를 방지하기 위해 **MLflow**와 **G-Eval** 기법을 적용한 자동 평가 파이프라인을 구축했습니다.

* **평가 지표:** 정확성(Faithfulness), 관련성(Relevance) 등 5가지 척도로 정량 평가 (5점 만점)
* **CI/CD 통합:** Golden Set(100건)에 대한 평가 점수가 유지될 때만 배포되도록 파이프라인 구성

#### 3. On-Premise 전환 준비 (vLLM & Gemma 3)
외부 API 의존도(비용, 보안)를 낮추기 위해 **vLLM**과 **Gemma 3** 모델을 활용한 사내 구축형(On-Premise) 전환 테스트를 완료했습니다.

* **최적화:** PagedAttention 및 양자화(Quantization) 기술을 적용하여 상용 API 수준의 응답 속도(Latency) 확보
* **보안 강화:** 민감한 사내 데이터가 외부로 유출되지 않는 로컬 서빙 환경 기반 마련