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
[cite_start]사내 레거시 시스템이 없는 상태에서 기획부터 아키텍처 설계, 백엔드 개발, 운영 배포까지 전 과정을 단독으로 수행한 **LLM 기반 사내 QnA 챗봇**입니다. [cite: 42, 45]

* **기간:** 2025.01 ~ 2025.06
* [cite_start]**역할:** AI Engineer (설계, 개발, 운영 단독 수행) [cite: 43]
* [cite_start]**주요 성과:** 단순 QnA를 넘어 멀티턴 대화가 가능한 Agent 구조로 고도화하고, 정량적 평가 시스템을 도입하여 답변 품질을 지속적으로 관리했습니다. [cite: 47, 49]

---

### 🛠 Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-FF4B4B?style=flat&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Milvus](https://img.shields.io/badge/Milvus-VectorDB-009688)
![MLflow](https://img.shields.io/badge/MLflow-0194E2?style=flat&logo=mlflow&logoColor=white)

---

### 🏗️ 시스템 아키텍처 및 핵심 기능

#### 1. Agent 기반 워크플로우 (LangGraph)
[cite_start]초기의 단순 RAG 구조(LangChain v0.1)에서 벗어나, 복잡한 질문을 처리할 수 있도록 **LangGraph**를 도입하여 에이전트(Agent) 구조로 고도화했습니다. [cite: 47, 201]

* **동적 라우팅:** 질문의 의도를 파악하여 단순 답변(LLM)과 문서 검색(RAG) 경로를 분기 처리
* [cite_start]**멀티턴 대화:** 이전 대화의 맥락(Context)을 유지하며 후속 질문에 정확히 답변 [cite: 48]

#### 2. 데이터 기반 품질 평가 (LLM-as-a-judge)
[cite_start]챗봇의 답변 품질을 객관적으로 측정하기 위해 **MLflow**와 **LLM-as-a-judge** 기법을 적용했습니다. [cite: 49, 208]

* [cite_start]**평가 지표:** 정확도, 명확성, 깊이, 관련성, 유용성의 5가지 척도로 정량 평가 (5점 만점) [cite: 208]
* **모니터링:** 사용자 피드백과 자동 평가 점수를 대시보드에서 실시간 확인

#### 3. On-Premise 전환 준비 (vLLM)
[cite_start]비용 절감 및 데이터 보안을 위해 OpenAI API 의존도를 낮추고, **vLLM**과 **Gemma 3** 모델을 활용한 사내 구축형(On-Premise) 전환 테스트를 완료했습니다.