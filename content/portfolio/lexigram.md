---
title: "Lexigram"
slug: "lexigram"
type: "Tech & Design"
date: "2026-04-29T15:26:51.850Z"
excerpt: "A sophisticated language learning platform that merges AI-driven personalization with a premium, gamified interface to master French vocabulary effectively."
image: "https://github.com/user-attachments/assets/d3bd35c8-4baa-4e43-b8ea-90f5ce09b86e"
hero_image: "https://github.com/user-attachments/assets/5383b5f7-c461-49f6-8f62-ffb7605d417f"
stack: "FastAPI, Kafka, PostgreSQL, PgBouncer, Alembic, Redis, OpenAI, JWT, Google Sign-In, Apple Sign-In, Flutter, Riverpod, Freezed, Dio, Docker, Codemagic."
source: ""
live: "https://www.lexigram.ai/"
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
    subgraph Frontend [Mobile Client - Flutter]
        UI[App Interface]
        State[Riverpod & Freezed State]
        Auth[Dio Interceptor & Auth]
    end

    subgraph Backend [API & Intelligence]
        FastAPI[FastAPI Service]
        Kafka[Kafka Message Broker]
        Workers[AI Consumer Services]
    end

    subgraph Data [Storage & Infra]
        Postgres[PostgreSQL & PgBouncer]
        Redis[Redis Cache]
        OpenAI[OpenAI API]
    end

    UI <--> State
    State <--> Auth
    Auth <--> FastAPI
    FastAPI --> Postgres
    FastAPI --> Redis
    FastAPI -- Produce Event --> Kafka
    Kafka -- Consume Event --> Workers
    Workers --> OpenAI
    Workers --> Postgres
```

</div>

### Elevating Language Mastery Through Intelligence
Lexigram transforms language acquisition into a frictionless, premium experience. By leveraging an asynchronous event-driven architecture, the platform offloads complex AI processing, ensuring users interact with a responsive and fluid interface. The application treats education as a lifestyle tool, employing a bespoke design system that utilizes glassmorphism and refined typography to minimize cognitive load. Through the seamless integration of spaced repetition and dynamic, context-aware content generation, the platform offers a uniquely personalized learning journey that remains both highly performant and aesthetically captivating, setting a new standard for intelligent educational technology.
