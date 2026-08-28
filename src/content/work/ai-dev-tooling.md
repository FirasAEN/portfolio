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
  with custom agents and MCP integrations, judged on the quality of what they produce.
company: independent
---

Outside work I build my own developer tooling — code-generation scripts, test
scaffolding, documentation generators — driven by Claude Code with custom agents
and MCP integrations. I run it, and everything it produces, on a Linux VPS I
manage myself: deployment, domains, DNS, SSL, server configuration, with the
deploy and maintenance paths automated through scripts and CI/CD.

What it removes is the scaffolding around real work. The boilerplate a new module
needs before it does anything. The test harness that has to exist before a test
can be written. The documentation that goes stale because updating it is a chore.

I let it near scaffolding, tests, documentation and prototypes I intend to throw
away, which are the places where being wrong is cheap and shows up immediately.
Architecture and domain modelling I do myself, and not out of craft principle:
generated code can be reviewed, because you read it and you see what it does,
whereas a generated decision arrives with no reasoning attached. There is nothing
to review. And a badly drawn boundary does not fail at review time, it fails
eighteen months later when everything hangs off it.

The metric these tools make easy is volume, and volume is worthless. What I check
is whether I would have written it the same way, and whether I can still change
it in six months.
