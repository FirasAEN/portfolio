---
title: DC Core — IDE-Style Formula Editor
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

## Replacing raw text files as the way business rules get written

Business users author the domain rules that DataChain runs — the formulas Spark
evaluates over their dataframes. They were writing them in raw text files. No
syntax checking, no knowledge of what columns existed, no feedback until a Spark
job failed somewhere downstream.

I replaced that with an IDE-style editor.

### The constraint

The people writing these rules are domain experts, not developers. Feedback has
to arrive while they type and has to talk about their data — column names,
types, the shape of their own dataframe — not about parse trees.

And the language is a real language, not a settings form. Text files at least
let people express what they needed. Whatever replaced them had to keep that
expressiveness while adding the safety.

### The decision

Write the grammar from scratch with Lezer and drive a CodeMirror editor from it.
Lezer parses incrementally, so every keystroke reparses only what changed and
the editor stays responsive as expressions grow.

On top of the syntax tree sits a domain-aware layer: it resolves references
against the actual dataframe schema, checks types, and offers completion drawn
from the user's own columns rather than a static keyword list. Validation is
live, so an error appears at the point it is made.

### The trade-off

A hand-written grammar is a real maintenance commitment — the editor's
understanding of the language and the executor's have to stay in agreement, and
they are separate code. That cost is accepted because the alternative was a
class of error that only ever surfaced as a failed Spark run, on data the author
could not easily inspect.

### Outcome

Domain rules are authored in an editor that understands them, and mistakes
surface in milliseconds instead of after a cluster job fails.
