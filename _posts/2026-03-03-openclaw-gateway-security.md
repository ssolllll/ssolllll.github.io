---
layout: page
title: "AI 에이전트 보안의 핵심: OpenClaw Gateway 아키텍처"
description: "LLM API 키 노출 방지부터 속도 제한까지, 에이전트 서비스의 보안 강화 전략"
img:
importance: 4
category: Security
---

### 📌 프로젝트 개요
AI 에이전트를 실제 서비스(Production) 환경에 배포할 때 가장 큰 리스크는 **API 키 노출**과 **무분별한 토큰 사용으로 인한 비용 폭증**입니다. 이를 해결하기 위해 OpenClaw Gateway의 보안 기능을 활용하여 에이전트와 LLM 제공자 사이의 안전한 중계 레이어를 구축하고, 보안 통제권을 확보한 사례를 정리합니다.

* **기술 스택:** OpenClaw Gateway, Bearer Token Auth, Rate Limiting, CORS Policy, Docker
* **주요 기능:** API Key 추상화, 사용자별 권한 제어, 요청량 제한(Traffic Control)

---

### 💡 단계별 기술적 고도화 (Technical Evolution)

#### 1. API Key 노출 방지 및 중앙 관리 (Security Hardening)
에이전트 클라이언트 코드에 직접 LLM API 키(OpenAI, Anthropic 등)를 심는 것은 매우 위험합니다.
* **Solution:** OpenClaw Gateway를 중앙 프록시로 설정했습니다. 클라이언트는 Gateway가 발급한 별도의 **Bearer Token**만 가지며, 실제 LLM 키는 서버 환경변수로 격리하여 관리합니다.
* **Effect:** 키가 노출되더라도 Gateway 레벨에서 즉시 토큰을 무효화할 수 있어, 클라우드 비용 유출 리스크를 원천 차단했습니다.

#### 2. 안정적인 트래픽 제어: Rate Limiting
특정 사용자나 에이전트 루프의 오류로 인해 초당 수만 개의 요청이 발생하면 서비스 전체가 마비될 수 있습니다.
* **Implementation:** `Rate Limiting` 정책을 적용하여 IP 또는 사용자별로 분당 요청수(RPM)와 토큰수(TPM)를 제한했습니다.
* **Logic:** OpenClaw의 미들웨어 설정을 통해 트래픽 폭증 시 429(Too Many Requests) 에러를 반환하게 함으로써, 백엔드 리소스와 LLM 할당량(Quota)을 보호했습니다.



#### 3. CORS 및 도메인 신뢰성 확보
웹 기반 에이전트 인터페이스에서 발생할 수 있는 교차 출처 리소스 공유(CORS) 문제를 해결했습니다.
* **Configuration:** 허용된 특정 도메인에서만 Gateway에 접근할 수 있도록 화이트리스트를 관리합니다.
* **Safety:** 이를 통해 악의적인 웹사이트에서 사용자의 에이전트 권한을 가로채거나 비정상적인 호출을 시도하는 공격(CSRF 등)을 방어했습니다.

---

### 📊 기대 효과 및 성과
* **보안 수준 극대화:** API 키의 직접적인 노출 없이 안전한 토큰 기반 통신 환경 구축
* **운영 안정성:** 속도 제한(Rate Limit) 도입을 통한 예측 가능한 인프라 운영 및 비용 관리
* **확장성:** 새로운 LLM 모델을 추가하더라도 클라이언트 수정 없이 Gateway 설정만으로 대응 가능한 유연성 확보

---

### 🛠️ 엔지니어의 노트: '편의성'과 '보안'의 균형
에이전트 개발 초기에는 보안 레이어가 개발 속도를 늦춘다고 생각할 수 있습니다. 하지만 OpenClaw Gateway를 통해 보안 설정을 코드 밖으로 분리(Externalization)함으로써, 개발자는 **에이전트의 로직**에만 집중하고 보안은 **인프라 레이어**에서 해결하는 이상적인 SoC(Separation of Concerns)를 달성할 수 있었습니다.