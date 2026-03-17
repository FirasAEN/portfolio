---
title: Formula Editor
publishDate: 2023-03-10 00:00:00
img: assets/work/formula-editor.png
imgThumbnail: assets/work/formula-editor.png
img_alt: Code editor interface with syntax highlighting for business formulas
description: |
  Created a custom DSL editor using CodeMirror 6 and Lezer, providing syntax highlighting,
  autocomplete, and real-time error reporting for business formula expressions.
tags:
  - Dev
  - Frontend
  - CodeMirror
company: adobis
---

## Custom DSL for Business Formulas

Developed a specialized formula editor that empowers business users to write calculation expressions in a domain-specific language (DSL). The editor is built on CodeMirror 6 with a custom Lezer grammar, providing a professional IDE-like experience within the application.

### Language Design

The DSL supports:
- **Arithmetic and logical operators** with proper precedence
- **Variable references** to data model fields, with dot-notation for nested access
- **Built-in functions** for aggregation (SUM, AVG, COUNT), string manipulation, date arithmetic, and conditional logic (IF/THEN/ELSE)
- **Type inference** to catch type mismatches before execution

### Editor Features

- **Syntax highlighting** — Color-coded tokens based on the Lezer parse tree, making formulas easy to read and debug.
- **Autocomplete** — Context-aware suggestions for variables, functions, and operators, populated dynamically from the application's data model.
- **Error diagnostics** — Real-time error markers with descriptive messages, powered by the Lezer parser's error recovery and a custom semantic analysis pass.
- **Inline documentation** — Hover tooltips showing function signatures, parameter descriptions, and usage examples.

### Technical Implementation

The Lezer grammar was written from scratch to define the DSL's syntax. A custom CodeMirror extension bridges the parse tree with the application's type system, enabling semantic checks beyond what the grammar alone can express. The editor component is fully encapsulated as an Angular library, reusable across multiple application contexts.
