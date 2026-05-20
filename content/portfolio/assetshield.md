---
title: "AssetShield"
slug: "assetshield"
type: "Tech & Design"
date: "2026-05-20T08:52:52.318Z"
excerpt: "A sophisticated industrial management platform leveraging agentic AI and type-safe architecture to translate complex asset data into actionable intelligence."
image: "https://github.com/user-attachments/assets/cfda570d-f966-4d43-9764-f29075000d1d"
hero_image: "https://github.com/user-attachments/assets/ba7958e0-2083-4551-a617-bc25447c3cad"
images: ["https://github.com/user-attachments/assets/d11d065d-ddca-4425-a735-a63fc95c411f","https://github.com/user-attachments/assets/466f1140-08ec-408f-91ca-3c363042fcaf","https://github.com/user-attachments/assets/ab049b38-3128-4439-baec-833d14ab2763"]
stack: "Figma, Flutter, Next JS,  tRPC, PostgreSQL, Prisma, Vercel"
source: ""
live: ""
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
  subgraph DesignLayer [Design & Mobile]
    figmaDesign[Figma Design System]
    flutterApp[Flutter Mobile App]
  end

  subgraph WebFrontend [Next.js Frontend]
    nextJS[Next.js Framework]
    parallelRoutes[Parallel Routing Slots]
    uiComponents[Ant Design & Tailwind CSS]
  end

  subgraph LogicLayer [Type-Safe API & AI]
    trpc[tRPC API]
    zodValidation[Zod Validation]
    langGraph[LangGraph AI Agents]
  end

  subgraph DataLayer [Persistence]
    prismaORM[Prisma ORM]
    postgreSQL[PostgreSQL Database]
  end

  figmaDesign --> nextJS
  nextJS --- parallelRoutes
  nextJS --- uiComponents

  nextJS <--> trpc
  flutterApp <--> trpc
  
  trpc --- zodValidation
  trpc <--> langGraph
  trpc <--> prismaORM
  
  prismaORM <--> postgreSQL

  nextJS & trpc --> vercelHost[Vercel Deployment]
```

</div>

### The Problem
Industrial operations often struggle with fragmented equipment data and complex workflows, leading to information overload for technicians and engineers alike.

### The Solution
We integrated state-machine AI agents and a role-based modular UI to deliver high-fidelity asset insights. By combining predictive logic with a streamlined, industrial-grade design system, we transformed dense operational datasets into intuitive, context-aware dashboards.

### The Impact
This platform eliminates cognitive friction, enabling teams to act on critical maintenance needs with precision while maintaining enterprise-grade safety and system-wide data integrity.
