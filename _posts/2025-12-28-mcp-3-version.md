---
layout: post
title: "[MCP] 3. 프로덕션을 위한 MCP: SSE, 디버깅, 그리고 보안"
date: 2025-12-22 10:00:00
description: 로컬 Stdio를 넘어 원격 서버 연결을 위한 SSE(Server-Sent Events) 구현, MCP Inspector를 활용한 디버깅, 그리고 보안 가이드라인.
tags: mcp sse debugging security devops
categories: engineering
---

로컬에서 `python server.py`로 띄우는 건 쉽다. 하지만 실제 팀 단위로 MCP를 도입하거나, 서버에 배포된 MCP를 사용하려면 더 깊은 이해가 필요하다.

이번 마지막 포스트에서는 **Stdio vs SSE**, **MCP Inspector**, 그리고 **보안**이라는 세 가지 엔지니어링 주제를 다룬다.

---

## 1. Transport Layer: Stdio vs SSE

MCP는 통신 방식(Transport)에 대해 유연하다.

### A. Stdio (Standard I/O)
* **작동 방식:** 클라이언트가 서버 프로세스를 직접 실행(`spawn`)하고, 표준 입출력(stdin/stdout)으로 JSON-RPC 메시지를 주고받는다.
* **장점:** 설정이 쉽고, 로컬 보안(내 컴퓨터 밖으로 데이터가 안 나감)이 강력하다.
* **단점:** 로컬 머신에 서버 코드가 있어야 한다. 원격 서버 연결 불가.

### B. SSE (Server-Sent Events)
* **작동 방식:** HTTP 서버 위에서 작동하며, 서버->클라이언트는 SSE로, 클라이언트->서버는 HTTP POST로 통신한다.
* **장점:** **원격 배포 가능**. 팀원들이 공용으로 쓰는 '사내 지식 베이스 MCP 서버'를 구축할 수 있다.
* **구현:** `starlette`나 `fastapi`와 결합하여 쉽게 구현할 수 있다.

```python
# SSE 방식의 MCP 서버 예시 (FastAPI)
from mcp.server.sse import SseServerTransport
from starlette.applications import Starlette
from starlette.routing import Route

# ... (서버 로직)

async def handle_sse(request):
    async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
        await mcp.run(streams[0], streams[1], mcp.create_initialization_options())

app = Starlette(routes=[
    Route("/sse", endpoint=handle_sse),
    Route("/messages", endpoint=handle_messages, methods=["POST"])
])
```
2. Debugging: MCP Inspector
MCP는 눈에 보이지 않는 백그라운드 통신이라 디버깅이 까다롭다. 이를 위해 Anthropic은 MCP Inspector라는 웹 기반 디버깅 도구를 제공한다.
```bash
npx @modelcontextprotocol/inspector python my_server.py

```
이 명령어를 실행하면 웹 UI가 뜨고, 여기서 직접 Tool을 호출해보거나 Resource를 조회해보며 내 서버가 잘 작동하는지 테스트할 수 있다. 클라이언트(Claude) 없이도 독립적인 테스팅이 가능하다.

3. Security: AI에게 어디까지 허용할 것인가?
MCP는 강력하다. 즉, 위험하다. 만약 rm -rf /를 수행할 수 있는 Tool을 만들어서 연결해두면, LLM이 해킹당하거나 오작동했을 때 내 컴퓨터가 날아갈 수 있다.

보안 수칙
Human-in-the-loop: 중요한 Tool(결제, 데이터 삭제 등)은 실행 전 사용자 승인을 받도록 클라이언트 측에서 설정해야 한다. (현재 Claude Desktop은 이를 지원)

Read-Only Resources: 가능한 한 Tool(실행)보다는 Resource(읽기) 위주로 설계하여 부작용을 최소화한다.

Sandboxing: MCP 서버 자체를 Docker 컨테이너 안에서 실행하여 호스트 시스템 격리를 수행한다.