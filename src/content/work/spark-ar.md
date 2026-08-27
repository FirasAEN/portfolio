---
title: SPARK — Spatial Augmented Reality
publishDate: 2017-09-01 00:00:00
diagram: spark-pipeline
description: |
  Developed a Spatial Augmented Reality platform for Politecnico di Milano,
  enabling real-time 3D projection onto physical 3D-printed models.
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
tags:
  - Dev
  - Full-Stack
  - 3D
featured: true
order: 4
company: viseo
---

## Spatial Augmented Reality for an EU research project

At VISEO Technologies I worked as a full-stack developer on **SPARK** — Spatial
Augmented Reality as a Key for co-creativity — an EU research project with
Politecnico di Milano that projects digital designs onto 3D-printed physical
models in real time, so designers can iterate on an object they can hold.

### The constraint: two runtimes, one real-time loop

The rendering and projector calibration ran in C#; the web stack, services and
data ran on the JVM. They had to co-operate closely enough for the projected
image to track a physical object in real time, while remaining separately
developed and separately restartable.

### The decision

Bridge them with message-oriented middleware rather than direct calls. ActiveMQ
sits between the Java and C# subsystems, so neither blocks on the other and
either can restart without taking the system down.

Behind the web tier, Spring MVC and Spring Data handle services and
persistence, with Apache Storm processing the incoming streams and
ElasticSearch backing retrieval. The front end renders in AngularJS with
ThreeJS.

### The trade-off

A broker adds a component to operate and makes end-to-end debugging harder — a
failure is now somewhere in a pipeline rather than in a call stack. In exchange
the two runtimes stay genuinely decoupled, which matters when their failure and
restart characteristics differ as much as these did.

### Research versus product

Requirements in a research project are discovered rather than specified. The
architecture had to tolerate the goal moving, which is much of why the
integration seam was kept loose.

### Technical environment

Spring MVC, Spring Data, Apache Storm, JPA/Hibernate, ElasticSearch, AngularJS,
ThreeJS, Gradle, Gulp, C#, ActiveMQ.
