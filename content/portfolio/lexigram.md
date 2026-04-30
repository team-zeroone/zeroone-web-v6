---
title: "Lexigram"
slug: "lexigram"
type: "Tech & Design"
date: "2026-04-30T06:28:47.831Z"
excerpt: "A sophisticated language learning platform that leverages event-driven AI and a premium design system to make French vocabulary acquisition seamless."
image: "https://github.com/user-attachments/assets/c8ed66df-0c21-4fcd-9dd5-79bbecf061ed"
hero_image: "https://github.com/user-attachments/assets/26e4603d-928a-4d60-a1b5-815573b30e19"
images: ["https://github.com/user-attachments/assets/99e79331-d787-4188-8611-10dbc4c59bd4","https://github.com/user-attachments/assets/c33f4414-4e33-4ade-8989-0faafcd2f00f","https://github.com/user-attachments/assets/38e49b16-cae6-4336-8865-2032b48234f8","https://github.com/user-attachments/assets/58f8f8fa-d0d7-4592-a778-f701c209d773","https://github.com/user-attachments/assets/203a3c4a-ac64-4786-8bf6-d572f6a2710f","https://github.com/user-attachments/assets/599ab32b-2156-41ea-8243-576f3960d054","https://github.com/user-attachments/assets/c7f1fec0-f704-40f5-9db6-2c6642c50bfb","https://github.com/user-attachments/assets/692c1274-7fe6-4a01-a72a-cc1988324711"]
stack: "Figma, FastAPI, Kafka, PostgreSQL, PgBouncer, Alembic, Redis, OpenAI, JWT, Google Sign-In, Apple Sign-In, Flutter, Riverpod, Freezed, Dio, Docker, Codemagic."
source: ""
live: "https://www.lexigram.ai"
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
    subgraph MobileClient [Mobile App - Flutter]
        UI[UI Components]
        State[Riverpod & Freezed State]
        Network[Dio Interceptors]
    end

    subgraph BackendServices [FastAPI & Infrastructure]
        API[FastAPI Gateway]
        Kafka[Kafka Event Bus]
        AIWorker[AI Consumer Services]
    end

    subgraph DataPersistence [Persistence Layer]
        DB[(PostgreSQL)]
        Pool[PgBouncer]
        Cache[(Redis)]
    end

    subgraph External [External Services]
        OpenAI[OpenAI API]
        Auth[Google & Apple Auth]
    end

    UI --> State
    State --> Network
    Network --> API
    API --> Auth
    API --> Pool
    Pool --> DB
    API --> Cache
    API --> Kafka
    Kafka --> AIWorker
    AIWorker --> OpenAI
    AIWorker --> DB
```

</div>

### Redefining Language Acquisition Through Design
Lexigram elevates the language learning experience by merging high-performance architecture with a premium aesthetic. By utilizing an event-driven backend, the application performs complex AI-driven content generation asynchronously, ensuring the interface remains fluid and responsive. The design philosophy centers on a bespoke "Aura" system, where glassmorphism and intentional typography reduce cognitive load, allowing users to focus entirely on their progress. Through the perfect synergy of intelligent data orchestration and a meticulously crafted UI, the platform transforms the traditionally tedious process of vocabulary building into an engaging, high-end digital ritual.
