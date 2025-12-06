---
layout: page
title: "금융 및 공공기관 보안 AI POC"
description: "신한은행 및 국회도서관 대상 위협 탐지 모델 고도화 및 ETL 파이프라인 구축"
img: assets/img/ctilab_poc_thumb.jpg
importance: 2
category: Ctilab
---

### 📌 프로젝트 개요
[cite_start]연구 개발한 보안 AI 모델을 실제 고객사(신한은행, 국회도서관, 국가보안기술연구소) 데이터에 적용하여 성능을 검증하고 고도화한 프로젝트입니다. [cite: 116, 122, 128]

---

### 🚀 주요 성과 (Key Achievements)

#### 1. 신한은행 AI 탐지 모델 고도화 (탐지율 80% 달성)
* [cite_start]**문제:** 보안 데이터 특성상 공격 데이터가 매우 적은 **Data Imbalance** 문제로 인해 탐지율이 저조(9~50%)했습니다. [cite: 117]
* **해결:** Encoder-Decoder 구조의 모델을 활용하여 데이터 불균형 문제를 완화하고, 데이터 분석을 통해 오탐 원인을 제거했습니다.
* [cite_start]**결과:** 위협 탐지율을 **80% 이상**으로 끌어올리는 성과를 달성했습니다. [cite: 117, 118]

#### 2. 국회도서관 및 NSR 맞춤형 ETL 구축
* [cite_start]각 기관의 네트워크 환경에 맞는 **ETL(Extract, Transform, Load) 자동화 스크립트**를 작성하여 데이터 전처리 과정을 효율화했습니다. [cite: 124, 131]
* [cite_start]기존 보안 장비(Rule-base)가 놓친 위협 패킷을 다수 탐지하여 AI 모델의 효용성을 입증했습니다. [cite: 127]