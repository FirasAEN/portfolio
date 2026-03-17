---
title: Workflow Editor
publishDate: 2022-06-15 00:00:00
img: assets/work/workflow.png
imgThumbnail: assets/work/jointJs.png
img_alt: Visual workflow editor interface with connected nodes and process flows
description: |
  Built a BPMN-like visual workflow editor using JointJS, enabling business users
  to model and orchestrate complex processes through drag-and-drop interactions.
tags:
  - Dev
  - Frontend
  - JointJS
company: adobis
---

## Visual Process Modeling

Designed and implemented a full-featured workflow editor that allows business analysts and domain experts to visually define process flows without writing code. The editor leverages JointJS as its diagramming engine, providing a rich canvas for creating, connecting, and configuring workflow nodes.

### Key Features

- **Drag-and-drop node palette** — Users select from a library of pre-defined node types (actions, conditions, loops, sub-processes) and place them on an infinite canvas.
- **Custom shape library** — Extended JointJS with domain-specific shapes representing business operations, approval gates, notification steps, and data transformations.
- **Connection validation** — Enforced graph constraints at the UI level, preventing invalid connections (e.g., circular dependencies, incompatible port types).
- **Properties panel** — Each node exposes a configurable form for parameters, expressions, and routing rules, bound to a reactive data model.
- **Undo/Redo** — Full command-pattern history allowing users to step through changes.
- **Import/Export** — Serialization to/from JSON for persistence and versioning of workflow definitions.

### Technical Approach

The editor integrates into an Angular application, bridging JointJS's vanilla JS API with Angular's change detection and component lifecycle. Custom Angular directives wrap JointJS elements, enabling seamless two-way data binding between the diagram and the application state.

The workflow definitions are validated server-side before execution, ensuring the visual model is always consistent with the runtime engine's expectations.
