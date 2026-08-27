---
title: Formula Editor
publishDate: 2023-03-10 00:00:00
diagram: dsl-pipeline
description: |
  Created a custom DSL editor using CodeMirror 6 and Lezer, providing syntax highlighting,
  autocomplete, and real-time error reporting for business formula expressions.
tech:
  - TypeScript
  - CodeMirror
  - Lezer
  - Scala
  - Spark
tags:
  - Dev
  - Frontend
  - CodeMirror
company: adobis
---

## Catching formula errors before Spark runs them

Business users author formulas over dataframes that Spark then executes. A
mistake surfaced only when the cluster job failed — slow, and opaque to the
person who wrote it. I built an IDE-style editor that validates the expression
as it is typed.

### The constraint

The formulas are a business language, not general-purpose code. The people
writing them are domain experts, not developers, so the feedback has to arrive
in the editor and speak in their terms.

### The decision

Define the language as a real grammar with a Lezer parser, and drive a
CodeMirror editor from it. Lezer parses incrementally, so every keystroke
reparses only what changed and the editor stays responsive.

On top of the syntax tree sits a semantic layer that resolves column
references and checks types against the dataframe schema, producing inline
errors and completion.

### The trade-off

The grammar is effectively maintained twice — once to give editor feedback,
once to compile to an execution plan — and the two must not disagree. That is
a real cost, accepted because the alternative is an author discovering a typo
after a cluster job fails.

### Outcome

Authors write and check expressions in the editor and see mistakes in
milliseconds instead of after a failed Spark run.
