---
title: Workflow Editor
publishDate: 2022-06-15 00:00:00
img_alt: Visual workflow editor interface with connected nodes and process flows
diagram: workflow-model
description: |
  Built a BPMN-like visual workflow editor using JointJS, enabling business users
  to model and orchestrate complex processes through drag-and-drop interactions.
tech:
  - Angular
  - TypeScript
  - JointJS
  - Java
  - Spring Boot
tags:
  - Dev
  - Frontend
  - JointJS
company: adobis
---

## Making automation reconfigurable without a release

Automation workflows were defined in code, so every change to a business
process — a new step, a different order, an altered condition — required a
developer and a deployment. I replaced them with a visual editor that lets the
people who own the process change it directly.

### The decision

Model workflows as a graph and edit them as one. Each node is a task with its
own configuration; edges define ordering and conditions. The editor is built on
JointJS, with per-task configuration panels so a step can be tuned without
touching the graph's shape.

Crucially, the graph is the definition — not a picture of a definition that
lives somewhere else. There is no second representation to drift out of sync.

### The trade-off

Moving process definitions out of code means giving up compile-time checking of
them. That is mitigated by validating the graph before it is saved — the
screenshot shows the editor flagging an unreachable element — but it is a real
shift of responsibility from the compiler to the tool.

### Outcome

Automation processes are now reconfigured without a code change or a release.
