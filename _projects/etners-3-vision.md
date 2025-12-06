---
layout: page
title: "학자금 지원 서류 자동화 에이전트"
description: "GPT-Vision과 OCR을 활용한 비정형 문서 데이터 추출 및 검증 자동화"
img: assets/img/etners_ocr_thumb.jpg
importance: 3
category: Etners
---

### 📌 프로젝트 개요
[cite_start]담당자가 수작업으로 확인하던 학자금 영수증 및 증빙 서류 검토 업무를 자동화하기 위해 구축한 **멀티모달 AI 어시스턴트**입니다. [cite: 76, 82]

* [cite_start]**기술 스택:** GPT-Vision, OCR, FastAPI, Redis [cite: 77]
* [cite_start]**주요 기능:** 이미지 내 텍스트 좌표 인식, 정책 대조, 예상 지원금 산출 자동화 [cite: 81]

---

### 💡 기술적 의사결정 (Technical Decision)

#### Cost-Effective Architecture (Vision → OCR+LLM)
초기에는 모든 이미지를 **GPT-4-Vision**으로 처리했으나, 높은 비용과 응답 지연 문제가 발생했습니다. [cite_start]이를 해결하기 위해 **경량화된 OCR 엔진**으로 텍스트와 좌표를 먼저 추출하고, LLM은 추출된 텍스트의 의미를 해석하는 구조로 변경하여 비용 효율성과 처리 속도를 모두 잡았습니다. [cite: 79, 80]

#### 비표준 문서 시각화 (Overlay)
[cite_start]해외 대학 영수증 등 양식이 제각각인 문서의 경우, OCR로 추출한 텍스트를 번역하여 원본 이미지 위에 **오버레이(Overlay)** 처리해 줌으로써 담당자가 직관적으로 내용을 교차 검증할 수 있도록 UX를 개선했습니다. [cite: 84]