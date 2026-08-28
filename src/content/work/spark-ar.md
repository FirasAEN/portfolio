---
title: SPARK — Spatial Augmented Reality
publishDate: 2017-09-01 00:00:00
diagram: spark-pipeline
description: |
  An EU research project projecting 3D designs onto printed models in real time, with
  ActiveMQ holding a Java web stack and a C# projection loop apart.
tech:
  - Spring MVC
  - Spring Data
  - Apache Storm
  - Hibernate
  - ElasticSearch
  - AngularJS
  - ThreeJS
  - C#
  - ActiveMQ
  - N-tier Architecture
tags:
  - Dev
  - Full-Stack
  - 3D
company: viseo
featured: true
order: 8
---

## Spatial Augmented Reality for an EU research project

At VISEO Technologies I worked as a full-stack developer on **SPARK** — Spatial
Augmented Reality as a Key for co-creativity — an EU research project with
Politecnico di Milano, projecting 3D designs onto 3D-printed physical models in
real time so designers can iterate on an object they can pick up.

### The constraint: two runtimes, one real-time loop

Rendering and projector calibration ran in C#; the web stack, services and data
ran on the JVM. They had to co-operate closely enough for a projected image to
track a physical object in real time, while remaining separately developed and
separately restartable.

### The decision

Bridge them with message-oriented middleware rather than direct calls. ActiveMQ
sits between the Java and C# subsystems, so neither blocks on the other and
either can restart without taking the system down.

Behind the web tier, Spring MVC and Spring Data handle services and persistence,
with Apache Storm processing the incoming streams and ElasticSearch backing
retrieval. I built the front-end rendering pipeline in AngularJS and ThreeJS.

### The trade-off

A broker adds a component to operate and makes end-to-end debugging harder — a
failure is somewhere in a pipeline rather than in a stack trace. In exchange the
two runtimes stay genuinely decoupled, which matters when their failure and
restart characteristics differ as much as a web service and a projection loop.

### Research, not product

Requirements on a research project are discovered rather than specified. The
architecture had to tolerate the goal moving, which is much of why the seam
between subsystems was kept deliberately loose.

### Technical environment

Spring MVC, Spring Data, Apache Storm, JPA/Hibernate, SQL, ElasticSearch,
AngularJS, ThreeJS, Gradle, Gulp, C#, ActiveMQ.
