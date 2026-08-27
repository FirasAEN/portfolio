---
title: AI-Assisted Development Tooling
publishDate: 2024-01-15 00:00:00
tech:
  - Claude Code
  - MCP
  - Python
  - Bash
  - Linux
  - Docker
  - CI/CD
tags:
  - Tooling
  - AI
  - Infrastructure
diagram: ai-pipeline
description: |
  Code generation, test scaffolding and documentation generators driven by Claude Code
  with custom agents and MCP integrations — judged on the quality of what they produce,
  not the volume.
company: independent
---

## Tooling I build, run and host myself

Outside work I build my own developer tooling — code-generation scripts, test
scaffolding and documentation generators — driven by Claude Code with custom
agents and MCP integrations. I run it, and everything it produces, on a
self-managed Linux VPS.

### What it removes

The repetitive scaffolding around real work: the boilerplate a new module needs
before it does anything, the test harness that has to exist before a test can be
written, the documentation that goes stale because updating it is a chore.

The same pipeline serves prototyping and architectural exploration — trying a
shape quickly enough to find out whether it holds, before committing to it.

### The line I hold

Generation is applied to the parts where being wrong is cheap and visible:
scaffolding, tests, documentation, throwaway prototypes. **Architecture, domain
modelling and production-critical decisions stay under human ownership.**

That is not caution for its own sake. Those are exactly the decisions whose cost
arrives late — a boundary drawn in the wrong place is not wrong at review time,
it is wrong eighteen months later when everything depends on it. Generated code
is reviewable; a generated decision is not, because the reasoning that would let
you review it was never made explicit.

### How I evaluate it

**On the code quality, maintainability and correctness it produces — not on
output volume.** Volume is the metric these tools make easy and it is the one
that means least. A generator that emits a thousand lines nobody can maintain
has produced a liability with good throughput.

The practical test is whether I would have written it the same way, and whether
I can still change it in six months.

### Running it

The full production path is mine: a Hostinger VPS with Linux, deployment,
domains, DNS, SSL/TLS and server configuration, with deployment and maintenance
automated through scripting and CI/CD workflows. Owning the whole path is how
the tooling gets tested against reality rather than against a happy path.

### Technical environment

Linux, Docker, CI/CD pipelines, Bash, Python, Claude Code, MCP, custom agents.
