---
layout: post
title: "[MCP] 1. AI 시대의 USB-C, Model Context Protocol 완벽 이해"
date: 2025-12-22 10:00:00
description: Anthropic이 공개한 MCP의 등장 배경과 아키텍처 분석. M x N 연결 문제를 M + N으로 해결하는 표준 인터페이스의 혁명.
tags: mcp llm architecture standard anthropic
categories: engineering
---

지금까지 LLM 애플리케이션을 개발하면서 우리는 수많은 "커넥터(Connector)"를 만들어야 했다.
Slack을 연결하려면 Slack API 어댑터를, PostgreSQL을 연결하려면 SQL 쿼리 도구를, Google Drive를 연결하려면 또 별도의 파서를 작성해야 했다.

새로운 모델(Claude, GPT-4, Gemini)이 나올 때마다, 혹은 새로운 IDE(Cursor, VS Code)나 챗봇 UI가 나올 때마다 이 연결 작업을 반복해야 한다. 이것이 바로 **"M x N 연결 문제"**다.

Anthropic이 오픈소스로 공개한 **MCP(Model Context Protocol)**는 이 난장판을 정리하기 위한 **"AI 시대의 USB-C"** 표준이다.

---

## 1. The Problem: 파편화된 연결 (Fragmentation)

기존 방식에서는 AI 모델이 데이터 소스에 접근하기 위해 각기 다른 전용 연동 코드가 필요했다.
* **Claude Desktop**에서 로컬 파일을 보려면? -> 전용 기능 필요
* **Cursor**에서 Postgres를 조회하려면? -> 전용 플러그인 필요
* **LangChain** 에이전트가 Slack을 읽으려면? -> LangChain Tool 필요

시스템이 복잡해질수록 유지보수 비용은 기하급수적으로 늘어난다.



## 2. The Solution: MCP 아키텍처

MCP는 **Client(호스트) - Server(데이터 제공자)** 구조의 개방형 프로토콜이다.
한 번만 MCP 호환 서버(Server)를 만들면, MCP를 지원하는 모든 클라이언트(Client)에서 별도 수정 없이 해당 데이터를 갖다 쓸 수 있다.



### 핵심 컴포넌트
1.  **MCP Host (Client):** LLM을 구동하는 애플리케이션 (예: Claude Desktop, Cursor, Zed, 혹은 우리가 만든 커스텀 챗봇).
2.  **MCP Server:** 실제 데이터나 기능을 제공하는 주체 (예: Google Drive Server, Postgres Server, Local Filesystem Server).
3.  **Resources:** 서버가 제공하는 읽기 전용 데이터 (파일, DB 레코드 등).
4.  **Tools:** 모델이 실행할 수 있는 함수 (API 호출, 쿼리 실행 등).
5.  **Prompts:** 서버가 제공하는 사전 정의된 프롬프트 템플릿.

---

## 3. 왜 엔지니어에게 중요한가?

### A. 한 번 작성하여 어디서나 사용 (Write Once, Run Anywhere)
PostgreSQL DB를 조회하는 MCP 서버를 하나 파이썬으로 짜두면, 이를 **Claude Desktop**에서도 쓰고, 팀 동료의 **IDE**에서도 쓰고, 사내 **Admin 대시보드**에서도 쓸 수 있다. 클라이언트마다 로직을 다시 짤 필요가 없다.

### B. 로컬 우선 (Local First) & 보안
MCP는 기본적으로 로컬 프로세스 간 통신(Stdio)을 지원한다. 내 컴퓨터에 있는 민감한 파일이나 DB 접속 정보를 클라우드에 올리지 않고, 내 로컬에서 돌아가는 LLM Client와 직접 연결할 수 있다.

### C. 생태계의 확장
이미 Google Drive, Slack, Git, Postgres 등 주요 서비스에 대한 MCP Server 구현체들이 쏟아져 나오고 있다. 우리는 바퀴를 다시 발명할 필요 없이, 표준 규격에 맞는 서버를 가져다 쓰기만 하면 된다.

---

## 결론

MCP는 단순한 라이브러리가 아니라 **프로토콜(Protocol)**이다. 웹이 HTTP라는 프로토콜 위에서 폭발적으로 성장했듯, AI 에이전트 시장도 MCP라는 표준 위에서 데이터 연결의 장벽을 허물고 폭발할 준비를 하고 있다.

다음 포스트에서는 Python을 사용하여 **실제 작동하는 나만의 MCP 서버**를 5분 만에 구축하는 과정을 다룬다.