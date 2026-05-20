---
title: "SRM (Paddy Procurement & Weighing System)"
slug: "srm-(paddy-procurement-and-weighing-system)"
type: "Tech & Design"
date: "2026-05-20T10:47:15.230Z"
excerpt: "A centralized, high-precision procurement platform that streamlines agricultural weighing and inventory management for large-scale supply chain operations."
image: "https://github.com/user-attachments/assets/541fffa5-dae5-4fa0-806e-e76df2e24081"
hero_image: "https://github.com/user-attachments/assets/11d3c6d3-a30a-4d5d-8241-2368211783f0"
images: ["https://github.com/user-attachments/assets/1bda7470-0d2b-4bd3-a82a-53947dda3445","https://github.com/user-attachments/assets/8cf0ba31-fe4f-457b-b1d7-ed0a27cad956","https://github.com/user-attachments/assets/9a9819b4-ad43-4b83-9497-cd0cd376740a","https://github.com/user-attachments/assets/405bcdb9-c91e-4709-91a7-d70f71d03506"]
stack: "Next JS,  tRPC, MongoDB, Prisma, Vercel"
source: ""
live: ""
has_diagram: true
---

### Architecture at a Glance

<div style="background: white; padding: 30px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee; display: block; overflow: hidden;">

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'canvasBackground': '#ffffff', 'primaryColor': '#fff' }}}%%
flowchart TD
    subgraph ClientLayer [Client Layer]
        nextjsApp[NextJS Frontend]
    end

    subgraph LogicLayer [Communication & Logic]
        trpcAPI[tRPC API Layer]
    end

    subgraph DataLayer [Data Persistence]
        prismaORM[Prisma ORM]
        mongoDB[MongoDB Database]
    end

    subgraph CloudLayer [Infrastructure]
        vercelHosting[Vercel Platform]
    end

    nextjsApp --> trpcAPI
    trpcAPI --> prismaORM
    prismaORM --> mongoDB

    nextjsApp -.-> vercelHosting
    trpcAPI -.-> vercelHosting
    prismaORM -.-> vercelHosting
```

</div>

### The Problem
Fragmented data and manual weighing processes caused significant bottlenecks, leading to inconsistent records and operational inefficiencies in agricultural procurement.

### The Solution
A unified, responsive management system that synchronizes real-time weighing data with secure backend infrastructure to ensure end-to-end transparency.

### The Impact
By automating complex data flows, we minimized human error and optimized throughput, providing stakeholders with an intuitive, reliable tool for mission-critical logistics.
