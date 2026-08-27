---
title: DC Core — Transformation Expression Editor
publishDate: 2023-03-10 00:00:00
diagram: dsl-pipeline
description: |
  A business DSL on a Lezer grammar driving a CodeMirror editor, so analysts see column
  and type errors as they type rather than after Spark fails.
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

## Catching transformation errors before Spark runs them

DataChain's proposition is a logical layer over data that is queried in place
rather than copied. Analysts shape that data through DC Core's no-code
transformation layer, and for anything beyond point-and-click they write
expressions over dataframes that Spark then executes. A mistake used to surface
only when the cluster job failed — slow, and opaque to the person who wrote it.

I built the editor that validates the expression as it is typed.

### The constraint

These are business expressions, not general-purpose code, and the people
writing them are domain experts rather than developers. Feedback has to arrive
in the editor and speak in their terms — column names and types, not stack
traces.

### The decision

Define the language as a real grammar with a Lezer parser and drive a CodeMirror
editor from it. Lezer reparses incrementally, so each keystroke re-examines only
what changed and the editor stays responsive on large expressions.

On top of the syntax tree sits a semantic layer that resolves column references
against the dataset's schema and checks types, producing inline errors and
completion. Because DataChain virtualises its sources, that schema is resolved
live rather than read from a copy.

### The trade-off

The grammar is effectively maintained twice — once to give editor feedback,
once to compile to an execution plan — and the two must not disagree. That cost
is accepted because the alternative is an analyst discovering a typo after a
cluster job fails, on data they cannot easily inspect.

### Outcome

Expressions are written and checked in the editor, with mistakes visible in
milliseconds instead of after a failed Spark run.
