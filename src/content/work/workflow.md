---
title: DC Maestro — Visual Workflow Engine
publishDate: 2022-06-15 00:00:00
diagram: workflow-model
description: |
  The module where automation processes are composed visually and configured per task,
  replacing hand-coded process definitions.
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

Automation processes on the platform were hand-coded. Every change to a business
process meant a developer and a release, so the people who understood a process
were never the people who could change it: a new step or a different condition
became a ticket, then a sprint, then a deployment. The definitions also lived
only as code, which sits awkwardly on a platform whose whole proposition is that
you can see how your data got the way it is.

I built DC Maestro to replace that. A process is a graph and you edit it as one,
on JointJS. Each node is a task carrying its own configuration, edges define
sequencing and conditions, and tasks are ordered by their dependencies so the
graph states what must happen before what. The graph *is* the definition, not a
picture of a definition kept somewhere else. There is no second representation
to drift out of sync.

Per-task configuration is what makes it usable day to day. Retuning a step
without touching the shape of the process is the change people need to make most
often, and it was the thing the old mechanism made most expensive.

Moving definitions out of code gives up compile-time checking of them, so
validation happens before save instead. An unreachable task, a cycle, or a step
pointing at something the user cannot access is caught in the editor and
surfaced on the node itself. Failure states are modelled too: a task can be
failed, or blocked because something upstream failed, and the graph shows which
is which.
