---
title: SPARK — Spatial Augmented Reality
publishDate: 2017-09-01 00:00:00
img: assets/work/Gemini_Generated_Image_wsnqj0wsnqj0wsnq3.png
imgThumbnail: assets/work/Gemini_Generated_Image_wsnqj0wsnqj0wsnq3.png
img_alt: 3D projection mapping on a physical model demonstrating spatial augmented reality
description: |
  Developed a Spatial Augmented Reality platform for Politecnico di Milano,
  enabling real-time 3D projection onto physical 3D-printed models.
tags:
  - Dev
  - Full-Stack
  - 3D
company: viseo
---

## Spatial Augmented Reality Research Platform

As a full-stack consultant at VISEO Technologies, I contributed to the SPARK project in collaboration with Politecnico di Milano — a research initiative exploring Spatial Augmented Reality (SAR) for industrial and educational applications.

### Project Overview

SPARK enables users to project dynamic visual information directly onto physical 3D-printed models, eliminating the need for head-mounted displays or handheld devices. This approach is particularly valuable for collaborative design reviews, architectural visualization, and educational demonstrations.

### Technical Contributions

- **3D rendering pipeline** — Implemented real-time rendering using ThreeJS and C# for projector-calibrated output, ensuring pixel-accurate alignment between the digital model and the physical object.
- **Back-end services** — Built data management APIs with Spring MVC and Spring Data for storing model metadata, projection configurations, and user sessions.
- **Real-time data processing** — Integrated Apache Storm for processing sensor data streams that trigger dynamic projection updates.
- **Search and indexing** — Used ElasticSearch for indexing and searching 3D model repositories.
- **Messaging** — ActiveMQ for asynchronous communication between the rendering engine, back-end services, and sensor inputs.

### Technology Stack

- Spring MVC & Spring Data (Java)
- Apache Storm for stream processing
- ElasticSearch for search
- ThreeJS for 3D web rendering
- C# for projector-side rendering
- ActiveMQ for messaging
