---
title: "Lexigram"
slug: "lexigram"
type: "Tech & Design"
date: "2026-04-30T06:53:17.433Z"
excerpt: "A premium mobile platform employing AI and gamification for an engaging, personalized French vocabulary learning experience."
image: "https://github.com/user-attachments/assets/303fb0ff-f11a-42d1-ab94-b9d5c96180ed"
hero_image: "https://github.com/user-attachments/assets/9699c994-b100-4d88-b9f4-d99c42832edd"
images: ["https://github.com/user-attachments/assets/6db127b4-c8ab-4b4e-896e-6d4c0e91d8f6","https://github.com/user-attachments/assets/2caf6b1b-239b-44bc-a597-22f9522fbaf8","https://github.com/user-attachments/assets/2460f39b-1a57-4548-ae1b-d97bcb6d2ab1","https://github.com/user-attachments/assets/5e199037-5f84-4fba-b21b-2155126bc16d","https://github.com/user-attachments/assets/85ad9088-1286-4bd3-925d-8fa9be13ceff","https://github.com/user-attachments/assets/1c09a845-fc59-467b-9845-ea6d987df1ca","https://github.com/user-attachments/assets/1fa5cca5-0342-4d63-96e1-51662b0134d6","https://github.com/user-attachments/assets/b0bccbeb-fc3b-4f35-bb42-555d03ed03ff"]
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
  subgraph Client [Mobile Client]
    Flutter[Flutter App]
    Riverpod[Riverpod State Management]
    Dio[Dio API Client]
  end

  subgraph Auth [Identity Management]
    OAuth[Google & Apple Sign-In]
    JWT[JWT Token Rotation]
  end

  subgraph Backend [Backend Orchestration]
    FastAPI[FastAPI Web Framework]
    Kafka[Kafka Message Broker]
    AIService[OpenAI Consumer Service]
  end

  subgraph Data [Storage & Performance]
    Redis[(Redis Cache)]
    PgBouncer[PgBouncer Pooling]
    Postgres[(PostgreSQL Database)]
    Alembic[Alembic Migrations]
  end

  subgraph Lifecycle [DevOps Pipeline]
    Codemagic[Codemagic CI/CD]
    Docker[Docker Containerization]
  end

  Flutter --> Riverpod
  Riverpod --> Dio
  Dio --> FastAPI
  FastAPI --> OAuth
  OAuth --> JWT
  FastAPI --> Redis
  FastAPI --> Kafka
  Kafka --> AIService
  AIService --> PgBouncer
  FastAPI --> PgBouncer
  PgBouncer --> Postgres
  Alembic --> Postgres
  Codemagic --> Flutter
  Docker --> FastAPI
```

</div>

### Mastering French, Reimagined
This platform redefines language acquisition, transforming the challenge of learning French vocabulary into an engaging, gamified journey. It seamlessly integrates interactive quizzes and intelligent word cards, guiding users through personalized, AI-driven learning paths designed for gradual mastery. The design embraces a "Premium Aura" philosophy, utilizing sophisticated glassmorphism and dynamic themes for an immersive, lifestyle-centric experience. Every interaction is crafted to reduce cognitive load, making complex language concepts intuitive and enjoyable.
