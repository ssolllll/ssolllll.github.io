// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Edit the `_data/repositories.yml` and change the `github_users` and `github_repos` lists to include your own GitHub profile and repositories.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "post-ai-에이전트-보안의-핵심-openclaw-gateway-아키텍처",
        
          title: "AI 에이전트 보안의 핵심: OpenClaw Gateway 아키텍처",
        
        description: "LLM API 키 노출 방지부터 속도 제한까지, 에이전트 서비스의 보안 강화 전략",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/openclaw-gateway-security/";
          
        },
      },{id: "post-openclaw-오픈소스-브라우저-에이전트의-가능성",
        
          title: "OpenClaw: 오픈소스 브라우저 에이전트의 가능성",
        
        description: "Anthropic Computer Use를 넘어선 오픈소스 기반 웹 자동화 에이전트 구축기",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/open-claw/";
          
        },
      },{id: "post-고성능-ai-서빙을-위한-로깅-아키텍처-동기-vs-비동기",
        
          title: "고성능 AI 서빙을 위한 로깅 아키텍처: 동기 vs 비동기",
        
        description: "I/O 병목 제거를 위한 비동기 로깅 파이프라인 구축 및 성능 벤치마크",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/async-or-not/";
          
        },
      },{id: "post-llm-기반-로깅-성능-최적화-f-string-vs-지연-포매팅",
        
          title: "LLM 기반 로깅 성능 최적화: f-string vs 지연 포매팅",
        
        description: "고성능 AI 시스템 구축을 위한 문자열 연산 시점 분석 및 최적화 전략",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/fstring&formating/";
          
        },
      },{id: "post-mcp-3-프로덕션을-위한-mcp-sse-디버깅-그리고-보안",
        
          title: "[MCP] 3. 프로덕션을 위한 MCP: SSE, 디버깅, 그리고 보안",
        
        description: "로컬 Stdio를 넘어 원격 서버 연결을 위한 SSE(Server-Sent Events) 구현, MCP Inspector를 활용한 디버깅, 그리고 보안 가이드라인.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/mcp-3-version/";
          
        },
      },{id: "post-mcp-2-python으로-5분-만에-나만의-mcp-server-만들기",
        
          title: "[MCP] 2. Python으로 5분 만에 나만의 MCP Server 만들기",
        
        description: "mcp-python-sdk를 활용하여 SQLite 데이터를 조회하는 커스텀 서버 구현 실습. Tools와 Resources의 개념을 코드로 이해하기.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/mcp-server-tutorial/";
          
        },
      },{id: "post-mcp-1-ai-시대의-usb-c-model-context-protocol-완벽-이해",
        
          title: "[MCP] 1. AI 시대의 USB-C, Model Context Protocol 완벽 이해",
        
        description: "Anthropic이 공개한 MCP의 등장 배경과 아키텍처 분석. M x N 연결 문제를 M + N으로 해결하는 표준 인터페이스의 혁명.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/mcp-basic-concepts/";
          
        },
      },{id: "post-llm-ops-ai-에이전트의-블랙박스를-여는-기술-h-e-a-r-감사-로그-전략",
        
          title: "[LLM Ops] AI 에이전트의 블랙박스를 여는 기술: H.E.A.R. 감사 로그 전략",
        
        description: "수백 건의 자율 실행을 수행하는 AI 에이전트. 단순 로그를 넘어 의도(Intent)와 맥락(Context)을 추적하는 감사 시스템 구축 가이드.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/llm-log/";
          
        },
      },{id: "post-transformers-파이토치-루프-탈출-trainer-api-200-활용-가이드",
        
          title: "[Transformers] 파이토치 루프 탈출: Trainer API 200% 활용 가이드",
        
        description: "Raw PyTorch Loop 대신 Trainer를 써야 하는 이유. Custom Callback을 이용한 실시간 생성 평가와 효율적인 체크포인트 관리 전략.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/transformers-api/";
          
        },
      },{id: "post-transformers-llm-경량화와-가속-quantization부터-flash-attention까지",
        
          title: "[Transformers] LLM 경량화와 가속: Quantization부터 Flash Attention까지",
        
        description: "BitsAndBytes를 활용한 4bit 양자화(QLoRA) 원리와 Flash Attention 2 적용법. KV Cache의 중요성까지, 모델 성능을 극한으로 끌어올리는 최적화 기법 총정리.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/bitsandbytes/";
          
        },
      },{id: "post-transformers-llm-성능의-시작점-tokenizer-최적화-및-활용-전략",
        
          title: "[Transformers] LLM 성능의 시작점, Tokenizer 최적화 및 활용 전략",
        
        description: "Hugging Face Tokenizer의 Rust 기반 가속, Dynamic Padding을 통한 연산량 절감, 그리고 Chat Template을 활용한 프롬프트 엔지니어링 표준화 가이드.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/transformers-optimization/";
          
        },
      },{id: "post-transformers-oom-없는-세상-거대-모델-메모리-적재-및-offloading-전략",
        
          title: "[Transformers] OOM 없는 세상: 거대 모델 메모리 적재 및 Offloading 전략",
        
        description: "AutoModel 로딩 시 발생하는 메모리 부족(OOM) 해결법. device_map을 활용한 Offloading 원리와 torch_dtype 설정을 통한 VRAM 최적화 가이드.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/offloading/";
          
        },
      },{id: "post-transformers-llm-추론-제어-generationconfig와-실시간-streaming-구현",
        
          title: "[Transformers] LLM 추론 제어: GenerationConfig와 실시간 Streaming 구현",
        
        description: "하드코딩된 파라미터를 GenerationConfig로 분리하여 관리하는 MLOps 노하우와 TextIteratorStreamer를 활용한 ChatGPT 스타일의 실시간 토큰 스트리밍 구현법.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/generation_config_streaming/";
          
        },
      },{id: "post-python-collections-모듈-심층-분석",
        
          title: "[Python] collections 모듈 심층 분석",
        
        description: "단순한 문법 소개가 아닌, 나에게 있어 필요한 collections 모듈 분석.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/python-package-collections/";
          
        },
      },{id: "post-google-gemini-updates-flash-1-5-gemma-2-and-project-astra",
        
          title: 'Google Gemini updates: Flash 1.5, Gemma 2 and Project Astra <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "We’re sharing updates across our Gemini family of models and a glimpse of Project Astra, our vision for the future of AI assistants.",
        section: "Posts",
        handler: () => {
          
            window.open("https://blog.google/technology/ai/google-gemini-update-flash-ai-assistant-io-2024/", "_blank");
          
        },
      },{id: "post-displaying-external-posts-on-your-al-folio-blog",
        
          title: 'Displaying External Posts on Your al-folio Blog <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@al-folio/displaying-external-posts-on-your-al-folio-blog-b60a1d241a0a?source=rss-17feae71c3c4------2", "_blank");
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{id: "projects-사이버-보안-위협-탐지-ai-연구",
          title: '사이버 보안 위협 탐지 AI 연구',
          description: "HTTP 패킷 분석을 위한 도메인 특화 Tokenizer 개발 및 이상 탐지(Anomaly Detection) 모델 연구",
          section: "Projects",handler: () => {
              window.location.href = "/projects/ctilab-1-research/";
            },},{id: "projects-금융-및-공공기관-보안-ai-poc",
          title: '금융 및 공공기관 보안 AI POC',
          description: "신한은행 및 국회도서관 대상 위협 탐지 모델 고도화 및 ETL 파이프라인 구축",
          section: "Projects",handler: () => {
              window.location.href = "/projects/ctilab-2-poc/";
            },},{id: "projects-사내-규정-검색-rag-챗봇",
          title: '사내 규정 검색 RAG 챗봇',
          description: "LLM과 Vector DB를 활용하여 사내 문서를 검색하는 시스템 구축",
          section: "Projects",handler: () => {
              window.location.href = "/projects/etners-1-chatbot/";
            },},{id: "projects-aicc-ai-contact-center-모델-고도화",
          title: 'AICC (AI Contact Center) 모델 고도화',
          description: "LLM 기반 파이프라인 전환을 통한 응답 성공률 21.4% → 97.3% 개선",
          section: "Projects",handler: () => {
              window.location.href = "/projects/etners-2-aicc/";
            },},{id: "projects-학자금-지원-서류-자동화-에이전트",
          title: '학자금 지원 서류 자동화 에이전트',
          description: "GPT-Vision과 MCP 기반의 글로벌 비정형 문서 추출 및 검증 자동화",
          section: "Projects",handler: () => {
              window.location.href = "/projects/etners-3-vision/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/example_pdf.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
