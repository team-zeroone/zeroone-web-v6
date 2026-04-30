---
title: "Lexigram"
slug: "lexigram"
type: "Tech & Design"
date: "2026-04-30T07:07:52.328Z"
excerpt: "A premium, AI-driven language platform that gamifies French vocabulary mastery through an asynchronous, event-based architecture and a sophisticated, design-forward interface."
image: "https://github.com/user-attachments/assets/475406e1-e532-46b4-a56a-8d6dcbc4ce33"
hero_image: "https://github.com/user-attachments/assets/cd165ec7-194c-40ad-92a5-ba50a9df7403"
images: ["https://github.com/user-attachments/assets/8eb60237-841f-4b57-9769-64c511c6be05","https://github.com/user-attachments/assets/8b399b07-ac59-4571-8af7-ee7a838e015b","https://github.com/user-attachments/assets/e281d33d-4c23-4b3c-a544-cfb21b4c40e4","https://github.com/user-attachments/assets/572a0160-147d-4c34-8c15-547032dba382","https://github.com/user-attachments/assets/56a02ee0-7492-47e5-9416-e86c901c252d","https://github.com/user-attachments/assets/0910bcac-7c21-4dac-a7a8-a601e9b81621","https://github.com/user-attachments/assets/7f705e6b-7a35-469c-b91c-1b65a3ae3d6a","https://github.com/user-attachments/assets/3cb471c8-42b9-4579-9831-31815a819eab"]
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
    subgraph ClientLayer [Mobile Client]
        Flutter[Flutter App - Riverpod & Freezed]
        Dio[Dio Interceptor - JWT & Auth]
    end

    subgraph GatewayLayer [API & Auth]
        FastAPI[FastAPI Backend]
        Auth[Google & Apple Sign-In]
    end

    subgraph EventLayer [Async Orchestration]
        Kafka[Kafka Event Bus]
        OpenAI[OpenAI Service - CEFR & Image Gen]
    end

    subgraph DataLayer [Storage & Caching]
        Redis[Redis Cache]
        PgBouncer[PgBouncer Pooler]
        Postgres[(PostgreSQL - Alembic)]
    end

    subgraph Deployment [CI/CD]
        Codemagic[Codemagic Pipeline]
        Docker[Docker Containers]
    end

    %% Flow Connections
    Flutter <-->|REST API| Dio
    Dio <--> FastAPI
    FastAPI --- Auth
    FastAPI -->|Trigger Events| Kafka
    Kafka --> OpenAI
    OpenAI -->|Store Metadata| FastAPI
    FastAPI <--> Redis
    FastAPI --> PgBouncer
    PgBouncer --> Postgres

    %% DevOps Mapping
    Codemagic -.->|Deploy| Flutter
    Docker -.->|Containerize| FastAPI
```

</div>

### Elevating the Language Learning Experience
Lexigram reimagines digital education by transforming technical complexity into a seamless, high-end user journey. By utilizing an event-driven architecture, the platform offloads resource-heavy AI tasks from the primary user flow, ensuring a zero-latency experience. The result is a highly responsive tool that feels both alive and personal. Through a bespoke design system defined by glassmorphism and intentional typographic hierarchy, we have stripped away the friction typically associated with learning, allowing users to focus entirely on their progress through an interface that is as functional as it is aesthetic.
