---
title: "[REGEN] Lexigram"
slug: "regen-lexigram"
type: "Tech & Design"
date: "2026-04-29T14:22:44.575Z"
excerpt: "A sophisticated language learning ecosystem that blends AI driven content generation with premium, high depth design for seamless French mastery."
image: "https://github.com/user-attachments/assets/cc061ffb-4115-4ecc-9548-a36eb1ff48e2"
hero_image: "https://github.com/user-attachments/assets/a6ecc3c6-e746-4246-b252-3f3cbda572cd"
stack: "Figma, FastAPI, Kafka, PostgreSQL, PgBouncer, Alembic, Redis, OpenAI, JWT, Google Sign-In, Apple Sign-In, Flutter, Riverpod, Freezed, Dio, Docker, Codemagic"
source: ""
live: "https://www.lexigram.ai/"
has_diagram: true
---

### Architecture at a Glance

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Flutter/Riverpod)"]
        UI[App UI & Micro-interactions]
        State[State Management/Cache]
        Auth[Auth Interceptor/Dio]
    end

    subgraph API ["Gateway & Auth"]
        Gateway[FastAPI]
        Security[JWT/Google/Apple]
    end

    subgraph Messaging ["Event-Driven Core"]
        Kafka[Kafka Broker]
        Workers[AI Worker Services]
    end

    subgraph Storage ["Data Persistence"]
        DB[(PostgreSQL + PgBouncer)]
        Redis[Redis Cache]
        Alembic[Alembic Migrations]
    end

    subgraph AI ["Intelligence"]
        OpenAI[OpenAI LLM API]
    end

    UI <--> State
    State <--> Auth
    Auth <--> Gateway
    Gateway <--> Redis
    Gateway <--> DB
    Gateway --> Kafka
    Kafka --> Workers
    Workers --> OpenAI
    Workers --> DB
    
    Alembic -.-> DB
```

### Elevating the Language Learning Experience
Lexigram transforms the arduous process of vocabulary acquisition into a fluid, lifestyle-driven experience. By moving away from static educational templates, we engineered a platform that feels both personal and high-end. The product utilizes an intelligent, event-driven architecture to deliver real-time AI content without sacrificing performance. Through a bespoke design system built on glassmorphism and HSL-curated palettes, we created a distraction-free environment that prioritizes cognitive clarity, ensuring every interaction feels intentional, rewarding, and remarkably fast. Lexigram is a benchmark for how complex AI products can prioritize elegance alongside industrial-grade reliability.
