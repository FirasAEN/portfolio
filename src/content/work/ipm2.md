---
title: EATON — Intelligent Power Manager
publishDate: 2020-09-01 00:00:00
img: assets/work/Gemini_Generated_Image_nh5q6snh5q6snh5q2.png
imgThumbnail: assets/work/Gemini_Generated_Image_nh5q6snh5q6snh5q2.png
img_alt: Data center power management dashboard with UPS monitoring interfaces
description: |
  Built Angular reactive UIs for EATON's Intelligent Power Manager (IPM2),
  a data center UPS monitoring platform with real-time state management using NgRx.
tags:
  - Dev
  - Frontend
  - Enterprise
company: capgemini
---

## Data Center Power Monitoring

Worked on EATON's Intelligent Power Manager 2 (IPM2), a web-based platform for monitoring and managing Uninterruptible Power Supply (UPS) systems in data centers. The application provides operators with real-time visibility into power infrastructure health and enables proactive incident response.

### Frontend Architecture

- **NgRx state management** — Centralized application state using NgRx Store, ensuring predictable data flow and enabling time-travel debugging during development.
- **RxJS reactive streams** — Real-time data from UPS devices flows through observable pipelines, with operators for throttling, buffering, and error recovery.
- **ImmutableJS data structures** — Enforced immutability for state objects, preventing accidental mutations and simplifying change detection.

### Key Features

- **Real-time UPS dashboard** — Live monitoring of voltage, current, battery status, load percentage, and environmental sensors.
- **Event timeline** — Chronological log of power events (outages, switchovers, battery cycles) with filtering and search.
- **Topology view** — Visual representation of power distribution from utility input through UPS systems to protected loads.
- **Firmware coordination** — Interfaces for managing firmware updates across distributed UPS devices, built in close coordination with the firmware team.

### Technology Stack

- Angular with TypeScript
- NgRx for state management
- RxJS for reactive programming
- Angular Material for UI components
- ImmutableJS for data integrity
