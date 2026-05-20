---
title: "Coachello"
slug: "coachello"
type: "Tech"
date: "2026-05-20T11:00:25.045Z"
excerpt: "An AI-driven leadership development platform that merges human coaching expertise with premium, fluid design to foster personal growth at scale."
image: "https://github.com/user-attachments/assets/fc11b8ec-7cbc-443d-b6da-4f1529ef17f8"
hero_image: "https://github.com/user-attachments/assets/b91022b5-e949-497e-b0a1-e63da606bccb"
images: ["https://github.com/user-attachments/assets/a3356f53-492d-4539-bc97-621ef9ca8f25","https://github.com/user-attachments/assets/375ae046-6274-4ce9-b933-b9bf83837fc8","https://github.com/user-attachments/assets/2ab263e7-aad0-4612-a925-22e77eb66dce","https://github.com/user-attachments/assets/160cd294-7a58-43e7-900f-07a04f82a261","https://github.com/user-attachments/assets/14beea2b-cd04-411a-ab42-b251bccd3ce1","https://github.com/user-attachments/assets/c85a306e-fe6b-4850-b199-d5d26782cdad","https://github.com/user-attachments/assets/493c0451-29ea-4a38-b4b8-343c026f473f"]
stack: "Flutter, React, Ngrok, Microsoft Teams UI Kit, Python, FastAPI, MySQL"
source: ""
live: ""
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
    subgraph FrontendLayer [Frontend Applications]
        flutterApp[Flutter Mobile App]
        teamsApp[React MS Teams Interface]
    end

    subgraph StateAndNetwork [State & Communication]
        riverpodState[Riverpod State Management]
        dioClient[Dio Network Client]
        ngrokTunnel[Ngrok Tunneling]
    end

    subgraph BackendLayer [Backend Services]
        fastApi[FastAPI Python Server]
        llmIntegration[AI Coaching Engine]
    end

    subgraph DataLayer [Data Persistence]
        mysqlDb[(MySQL Database)]
    end

    %% Flow Connections
    flutterApp --> riverpodState
    riverpodState --> dioClient
    dioClient --> ngrokTunnel
    teamsApp --> fastApi
    ngrokTunnel --> fastApi
    
    fastApi --> llmIntegration
    fastApi --> mysqlDb
    llmIntegration -.-> fastApi
```

</div>

### The Problem
Traditional coaching platforms often feel clinical and static, creating a disconnect between data-heavy analytics and the human nature of leadership growth.

### The Solution
We engineered a sophisticated, high-performance interface that synthesizes AI-driven insights with a warm, glassmorphic design system. By decoupling business logic from UI, we deliver a responsive experience that makes complex developmental feedback feel personal and intuitive.

### The Impact
A seamless, motion-rich ecosystem that transforms professional development into an engaging journey, ensuring users remain motivated through every interaction.
