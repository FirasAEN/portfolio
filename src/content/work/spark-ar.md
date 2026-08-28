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

At VISEO Technologies I worked as a full-stack developer on SPARK — Spatial
Augmented Reality as a Key for co-creativity — an EU research project run with
Politecnico di Milano. It projected 3D designs onto 3D-printed physical models in
real time, so a designer could iterate on an object they could pick up.

The split that shaped the system was two runtimes. Rendering and projector
calibration ran in C#; the web stack, services and data ran on the JVM. They had
to cooperate closely enough to keep a projected image on a physical object in
real time, while staying separately developed and separately restartable.
ActiveMQ sat between them instead of direct calls, so neither side blocked on the
other and either could restart without taking the system down. Behind the web
tier: Spring MVC and Spring Data for services and persistence, Apache Storm on
the incoming streams, ElasticSearch for retrieval. I built the front-end
rendering pipeline in AngularJS and ThreeJS.

The broker made end-to-end debugging harder. A failure was somewhere in a pipeline
instead of in a stack trace, and finding it meant reading two logs in two
languages.

This was research, so requirements were discovered along the way. Much of why the
seam between the subsystems was kept loose is that nobody yet knew where the goal
would settle.
