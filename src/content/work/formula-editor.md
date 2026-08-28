---
title: DC Core — IDE-Style Formula Editor
publishDate: 2023-03-10 00:00:00
diagram: dsl-pipeline
description: |
  Replaced raw text files as the way business users author domain rules: a from-scratch
  Lezer grammar, CodeMirror, and domain-aware autocomplete over their own schema.
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

Business users author the domain rules DataChain runs — the formulas Spark
evaluates over their dataframes. They were writing them in raw text files. No
syntax checking, no knowledge of which columns existed, no feedback at all until
a Spark job failed somewhere downstream, on data the author could not easily go
and look at.

The people writing these rules are domain experts, not developers, so feedback
has to arrive while they type and it has to talk about their data — column names,
types, the shape of their own dataframe — not about parse trees. The other
requirement was not to take anything away. Text files at least let people express
whatever they needed, so whatever replaced them had to keep that and add the
safety on top.

I wrote the grammar from scratch with Lezer and drove a CodeMirror editor from
it. Lezer parses incrementally, so a keystroke reparses only what changed and the
editor stays responsive as expressions grow. On top of the syntax tree sits a
domain-aware layer: it resolves references against the actual dataframe schema,
checks types, and offers completion drawn from the user's own columns instead of
a static keyword list. Validation runs live, so an error appears at the point it
is made.

A hand-written grammar is a maintenance commitment I took on knowingly. The
editor's understanding of the language and the executor's have to stay in
agreement, they are separate code in separate languages, and so every change to
the language is two changes. I took it on because the alternative was a class of
error that only ever surfaced as a failed cluster job.
