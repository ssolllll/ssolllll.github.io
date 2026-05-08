---
layout: post
title: "[A2A] MCP 다음은 A2A: 에이전트끼리 대화하는 법"
date: 2026-05-09 10:00:00
description: Google이 설계하고 Linux Foundation이 표준화한 A2A Protocol. MCP가 에이전트와 도구를 잇는다면, A2A는 에이전트와 에이전트를 잇는다. 개념부터 실제 구현까지.
tags: a2a mcp agent protocol llm multi-agent google
categories: engineering
---

작년 말에 MCP 시리즈를 쓸 때만 해도 "에이전트가 도구를 표준화된 방식으로 쓸 수 있다"는 것만으로도 충분히 혁신적이었다.

그런데 2026년 현재, 실무 환경에서 진짜 문제는 다른 곳에 있다. **에이전트가 다른 에이전트에게 일을 위임하고, 결과를 받아오고, 협업하는 것을 어떻게 표준화하는가.**

MCP가 에이전트의 "손"을 표준화했다면, **A2A(Agent-to-Agent Protocol)는 에이전트의 "대화"를 표준화**한다.

---

## 1. 왜 A2A가 필요한가

MCP를 쓰면 에이전트 하나가 Slack, DB, 코드 실행기 같은 도구들을 통일된 방식으로 다룰 수 있다. 잘 작동한다.

하지만 규모가 커지면 이런 상황이 온다.

* **법무 에이전트**가 계약서를 검토한 뒤, **번역 에이전트**에게 한국어 번역을 위임하고 싶다.
* **오케스트레이터 에이전트**가 작업을 분해하여 **코딩 에이전트**와 **테스트 에이전트**에게 병렬 배분하고 싶다.
* 회사 A의 에이전트가 회사 B의 에이전트에게 데이터 분석을 요청하고 싶다.

이걸 직접 구현하면 매번 다른 API, 다른 인증, 다른 응답 포맷을 손으로 이어붙여야 한다. MCP와 동일한 "M × N 문제"가 에이전트 간 통신에서 반복된다.

A2A는 이 문제를 해결하기 위해 Google이 2025년 4월에 제안하고, 2025년 6월 Linux Foundation에 기증한 개방형 프로토콜이다. 현재 OpenAI, Anthropic, Google, Microsoft, AWS가 공동으로 참여하는 **Agentic AI Foundation(AAIF)**에서 관리된다.

---

## 2. 핵심 개념 세 가지

### Agent Card

에이전트의 "명함"이다. `/.well-known/agent.json` 경로에 게시되며, 해당 에이전트가 무엇을 할 수 있는지, 어떻게 연락하는지를 선언한다.

```json
{
  "name": "translation-agent",
  "description": "한국어/영어 번역 전문 에이전트",
  "url": "https://agents.mycompany.com/translation",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "translate",
      "name": "텍스트 번역",
      "description": "주어진 텍스트를 지정한 언어로 번역",
      "inputModes": ["text"],
      "outputModes": ["text"]
    }
  ]
}
```

클라이언트 에이전트는 이 Agent Card를 읽어 상대 에이전트의 능력을 동적으로 파악할 수 있다.

### Task

에이전트 간 작업 단위다. 클라이언트가 `tasks/send` 엔드포인트로 요청을 보내면, 서버 에이전트가 Task를 수행하고 결과를 반환한다.

Task는 다음 다섯 가지 상태를 순서대로 거친다.

```
submitted → working → (input-required) → completed / failed / canceled
```

`input-required` 상태는 중요하다. 에이전트가 작업 중 추가 정보가 필요할 때 사람이나 상위 에이전트에게 물어볼 수 있는 루프를 공식적으로 지원한다.

### Artifact

Task의 결과물이다. 텍스트, 파일, 구조화 데이터 등 여러 형태를 가질 수 있으며, Task 완료 시 응답에 포함된다.

---

## 3. MCP와 A2A: 역할 분리

이 둘은 경쟁 관계가 아니다. 레이어가 다르다.

| | MCP | A2A |
|---|---|---|
| **목적** | 에이전트 ↔ 도구/데이터 | 에이전트 ↔ 에이전트 |
| **비유** | 에이전트의 손 (도구 사용) | 에이전트의 입 (대화/위임) |
| **전송** | 로컬 Stdio / HTTP | HTTP + SSE |
| **관리** | Agentic AI Foundation | Agentic AI Foundation |

실제 멀티 에이전트 시스템은 두 프로토콜을 함께 쓴다.

```
오케스트레이터 에이전트
  ├── MCP → DB 조회, 코드 실행, 파일 읽기 (도구)
  └── A2A → 번역 에이전트, 분석 에이전트 (다른 에이전트)
```

---

## 4. Python으로 A2A 서버/클라이언트 구현하기

Google이 공개한 `a2a-sdk`를 사용한다.

### 서버 측 (번역 에이전트)

```python
from a2a.server import A2AServer, TaskHandler
from a2a.types import Task, TaskStatus, Artifact, TextPart

class TranslationHandler(TaskHandler):
    async def handle(self, task: Task) -> Task:
        # 입력 메시지 추출
        user_message = task.history[0].parts[0].text

        # 실제 번역 로직 (Claude 등 LLM 호출)
        translated = await self.translate(user_message)

        # 결과 반환
        task.status = TaskStatus(state="completed")
        task.artifacts = [
            Artifact(parts=[TextPart(text=translated)])
        ]
        return task

    async def translate(self, text: str) -> str:
        import anthropic
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"다음 텍스트를 한국어로 번역해줘: {text}"
            }]
        )
        return response.content[0].text

# 서버 실행
server = A2AServer(
    agent_card_path="agent_card.json",
    handler=TranslationHandler(),
)
server.run(host="0.0.0.0", port=8001)
```

### 클라이언트 측 (오케스트레이터가 번역 에이전트 호출)

```python
import asyncio
from a2a.client import A2AClient
from a2a.types import Message, TextPart, Role

async def main():
    # Agent Card를 읽어 에이전트 능력 파악
    client = await A2AClient.from_agent_card_url(
        "http://localhost:8001/.well-known/agent.json"
    )

    # Task 전송
    task = await client.send_task(
        message=Message(
            role=Role.user,
            parts=[TextPart(text="The quick brown fox jumps over the lazy dog.")]
        )
    )

    # Task 완료까지 폴링
    while task.status.state not in ("completed", "failed", "canceled"):
        await asyncio.sleep(0.5)
        task = await client.get_task(task.id)

    if task.status.state == "completed":
        result = task.artifacts[0].parts[0].text
        print(f"번역 결과: {result}")

asyncio.run(main())
```

---

## 5. 스트리밍 응답 처리

번역처럼 단순한 작업은 폴링으로 충분하지만, 긴 보고서 생성이나 코드 리뷰처럼 시간이 걸리는 작업은 SSE 스트리밍이 훨씬 자연스럽다.

```python
async def stream_task():
    client = await A2AClient.from_agent_card_url(
        "http://localhost:8001/.well-known/agent.json"
    )

    # 스트리밍으로 Task 전송
    async for event in client.send_task_streaming(
        message=Message(
            role=Role.user,
            parts=[TextPart(text="분기별 매출 보고서를 작성해줘.")]
        )
    ):
        if event.type == "artifact_chunk":
            print(event.chunk.text, end="", flush=True)
        elif event.type == "task_status":
            print(f"\n[상태 변경] {event.status.state}")
```

---

## 현재 생태계 현황 (2026년 5월)

* **MCP**: 2025년 12월 Linux Foundation 기증 후 월 9,700만 SDK 다운로드. OpenAI, Google, Microsoft 등 전 주요 제공사 채택 완료.
* **A2A**: 2025년 4월 Google 공개, 6월 Linux Foundation 기증, 8월 IBM의 ACP와 통합. 현재 엔터프라이즈 에이전트 배포의 사실상 표준.
* **두 프로토콜의 관계**: 2025년 12월 출범한 AAIF(Agentic AI Foundation)에서 MCP와 A2A를 함께 관리. 서로 충돌 없이 계층이 명확히 구분됨.

---

## 결론

2025년이 "에이전트가 도구를 쓰는 시대"였다면, 2026년은 "에이전트가 에이전트를 쓰는 시대"다.

* **MCP**로 에이전트 하나가 수십 개의 도구를 표준화된 방식으로 다루고,
* **A2A**로 여러 에이전트가 역할을 나눠 협업하는 것.

이 두 프로토콜의 조합이 지금 엔터프라이즈 AI 시스템 설계의 기본 뼈대가 되고 있다. MCP 서버를 이미 만들어봤다면, 다음 스텝은 자연스럽게 A2A 위에서 에이전트를 분리하고 위임하는 구조를 실험해보는 것이다.

Sources:
- [MCP vs A2A: The Complete Guide to AI Agent Protocols in 2026](https://dev.to/pockit_tools/mcp-vs-a2a-the-complete-guide-to-ai-agent-protocols-in-2026-30li)
- [Google ADK 1.0 and A2A Protocol: Defining the 2026 Multi-Agent Standard](https://explore.n1n.ai/blog/google-adk-1-0-a2a-protocol-multi-agent-standard-2026-05-04)
- [A2A, MCP, AG-UI, A2UI: The Essential 2026 AI Agent Protocol Stack](https://medium.com/@visrow/a2a-mcp-ag-ui-a2ui-the-essential-2026-ai-agent-protocol-stack-ee0e65a672ef)
- [How to Build a Multi-Agent AI System with LangGraph, MCP, and A2A](https://www.freecodecamp.org/news/how-to-build-a-multi-agent-ai-system-with-langgraph-mcp-and-a2a-full-book/)
