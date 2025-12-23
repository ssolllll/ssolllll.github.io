---
layout: post
title: "[MCP] 2. Python으로 5분 만에 나만의 MCP Server 만들기"
date: 2025-12-22 10:00:00
description: mcp-python-sdk를 활용하여 SQLite 데이터를 조회하는 커스텀 서버 구현 실습. Tools와 Resources의 개념을 코드로 이해하기.
tags: python mcp backend coding tutorial
categories: engineering
---

이전 글에서 MCP의 개념을 익혔다면, 이제 손을 더럽힐 차례다.
이번 포스트에서는 Python의 `mcp` SDK를 사용하여, 로컬 SQLite 데이터베이스를 조회하고 수정하는 간단한 **MCP Server**를 구현해 본다.

이 서버를 만들면, **Claude Desktop 앱**이 내 로컬 DB를 자유자재로 조회하여 답변할 수 있게 된다.

---

## 1. 환경 설정

MCP 서버 구축을 도와주는 `mcp` 패키지를 설치한다. (또는 `fastmcp` 같은 래퍼를 쓸 수도 있지만, 원리 이해를 위해 정석 SDK를 사용한다.)

```bash
pip install mcp
```
2. Server 코드 작성 (weather_server.py)
가장 간단한 예제로, 날씨 정보를 조회하는 기능을 가진 서버를 만들어보자.

Python

from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

## 1. 서버 인스턴스 생성
mcp = FastMCP("Weather Demo")

## 2. Tool 정의 (모델이 호출할 함수)
- 데코레이터만 붙이면 자동으로 MCP Tool로 등록된다.
```python
@mcp.tool()
async def get_weather(city: str) -> str:
    """도시 이름을 입력받아 현재 날씨를 반환합니다."""
    # 실제로는 외부 API를 호출하겠지만, 여기선 Mocking
    weather_data = {
        "seoul": "맑음, 15도",
        "busan": "흐림, 18도",
        "new york": "비, 10도"
    }
    return weather_data.get(city.lower(), "알 수 없는 도시입니다.")
```

## 3. Resource 정의 (모델이 읽을 수 있는 데이터)
```python
@mcp.resource("weather://list")
async def list_cities() -> str:
    """날씨 조회가 가능한 도시 목록을 반환합니다."""
    return "Seoul, Busan, New York"

if __name__ == "__main__":
    # Stdio 방식으로 실행 (Claude Desktop과 통신하는 표준 방식)
    mcp.run()
```

3. Claude Desktop에 연결하기
만든 서버를 LLM 클라이언트(Claude Desktop)가 인식하도록 설정해야 한다. ~/Library/Application Support/Claude/claude_desktop_config.json 파일을 열고 다음을 추가한다.

JSON
```json
{
  "mcpServers": {
    "my-weather-server": {
      "command": "python",
      "args": ["/absolute/path/to/weather_server.py"]
    }
  }
}
```

이제 Claude Desktop을 재실행하면, 우측 상단에 🔌 아이콘이 생기고 get_weather 툴이 활성화된 것을 볼 수 있다.

채팅창에 **"서울 날씨 어때?"**라고 물어보면, Claude는 내 로컬 파이썬 스크립트를 실행하여 정보를 가져오고 답을 해준다.

4. 핵심 포인트: Tools vs Resources
Tools (도구): get_weather(city)처럼 **인자(Argument)**를 받아 연산을 수행하거나 부작용(Side-effect)이 있는 작업에 사용된다. (Function Calling과 유사)

Resources (자원): weather://list처럼 정적인 데이터나 파일 내용을 읽어오는(Read) 용도로 사용된다. 모델에게 "참고 자료"를 던져주는 개념이다.

이 두 가지 추상화만 있으면, 파일 시스템, 데이터베이스, API 서버 등 세상의 모든 데이터를 LLM에 연결할 수 있다.

다음 포스트에서는 로컬 통신(Stdio)을 넘어, **원격 서버(SSE)**로 배포하고 디버깅하는 심화 엔지니어링 기법을 다룬다.