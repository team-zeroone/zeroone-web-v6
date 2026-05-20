---
title: "StudyQ"
slug: "studyq"
type: "Tech & Design"
date: "2026-05-20T09:06:22.752Z"
excerpt: "A premium, student-centric learning platform that streamlines exam preparation through a reactive architecture and high-fidelity, frictionless user experiences."
image: "https://github.com/user-attachments/assets/81b3f603-cbfa-445d-a29b-7130bbd37321"
hero_image: "https://github.com/user-attachments/assets/8c1ed35a-7274-484f-be31-0360f6d2adbc"
images: ["https://github.com/user-attachments/assets/de020c1e-9a42-487e-915a-b9237edf8573"]
stack: "Figma, Flutter, Next.js, React, Postgres, Supabase, Firebase, Nest.js, DigitalOcean"
source: ""
live: "https://studyq.lk/"
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
    subgraph Frontend [Client Layer]
        Figma[Design System]
        Flutter[Flutter App]
        Nextjs[Next.js Web Portal]
    end

    subgraph Backend [Core Services]
        Nestjs[Nest.js API]
        Supabase[Supabase Auth & DB]
        Firebase[Firebase Services]
    end

    subgraph Data [Persistence & Ops]
        Postgres[(Postgres DB)]
        DO[DigitalOcean Hosting]
    end

    Figma --> Flutter
    Figma --> Nextjs
    Flutter --> Nestjs
    Nextjs --> Nestjs
    Nestjs --> Supabase
    Nestjs --> Firebase
    Nestjs --> Postgres
    Nestjs --> DO
    Supabase --> Postgres
```

</div>

### The Problem
Traditional exam preparation tools are often fragmented, offering static interfaces that fail to bridge the gap between content creators and learners effectively.

### The Solution
We engineered a robust, decoupled ecosystem that synchronizes expert-curated content with a bespoke, lightweight UI. By separating financial truth from content access, we ensured seamless, high-performance interactions across all student touchpoints.

### The Impact
A refined learning environment where fluid micro-interactions and intelligent state management empower users to focus exclusively on concept mastery, rather than navigating technical friction.
