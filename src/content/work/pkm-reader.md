---
title: Serving a Knowledge Vault as a Website
publishDate: 2026-08-22 00:00:00
tech:
  - TypeScript
  - Next.js
  - React
  - Docker
tags:
  - Frontend
  - Tooling
  - Full-Stack
diagram: vault-reader
links:
  - url: https://pkm.cyberonix.dev/login
    label: live instance
    note: sign-in required
description: |
  A read-only reader for a notes vault or a code repository — wikilinks, backlinks,
  search, and a faithful reimplementation of git's layered ignore semantics, pruning
  behaviour included.
company: independent
---

## Reading a vault the way git reads a repository

A read-only web reader that serves a personal notes vault, or a code repository,
as a navigable site: folder tree, full-text search, wikilinks and backlinks, tag
index, diagrams and maths, and a syntax-highlighted code viewer with a symbol
outline.

I run it for my own notes. The interesting part is not the rendering.

### Ignore rules are the actual problem

Deciding what to publish means reimplementing git's ignore semantics, and they
are subtler than they look. Rules layer innermost-first: built-in defaults, then
the vault's `.gitignore`, then a reader-specific ignore file applied *afterwards*
so it can rescue files git excludes, then nested files scoped to their own
subtree.

The behaviour worth getting right is directory pruning. In git, an exception like
`!dist/keep.ts` does nothing on its own while `dist/` is excluded — the walk
never opens `dist/` to discover the exception. Reproducing that faithfully means
reproducing a limitation.

That is the right call anyway. A tool *almost* compatible with a familiar format
is worse than one exactly compatible, because the gap surfaces as surprise —
someone reasons from what git would do and gets something else, in the one
mechanism that decides what becomes public.

### A trade-off stated rather than hidden

**Code file contents are never indexed — only filenames and paths.**

The index rebuilds from scratch on every filesystem change and on a timer, so
holding every code file's text in memory across rebuilds was the wrong shape.
Notes are searchable in full; code is navigable but not searchable by content.

That limitation is in the README, along with several others: no `extends` chain
following in tsconfig, no support for git's global excludes file, package-style
Python and Go imports that never resolve to links. Listing what a tool cannot do
is how someone decides whether it fits. The list costs nothing to write; the
surprise costs a great deal.

### Auth with exactly one hole

Access is gated by signed-cookie middleware at the edge, with a single bypass: a
bearer token scoped to the refresh endpoint alone, so a git post-receive hook can
trigger a rescan without holding a session.

One narrow, named exception is a security posture. A general-purpose API key
would not be.
