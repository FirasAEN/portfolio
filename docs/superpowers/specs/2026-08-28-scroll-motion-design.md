# Scroll motion — reveal on scroll and back-to-top

## Context

The portfolio is a static Astro 6 site deployed to GitHub Pages under `/portfolio`.
It is a classic MPA: there is no `ClientRouter`, so every navigation loads a fresh
document and discards the previous one along with its listeners and observers.

Two additions are wanted:

1. Sections reveal as the reader scrolls down the homepage.
2. A back-to-top control appears once the reader has left the top of the page.

The site already runs one rAF-throttled scroll handler in `Nav.astro`, serving the
sticky-header rule and the scroll-spy. It already gates `scroll-behavior: smooth`
behind `prefers-reduced-motion`, and `ThemeToggle.astro` and `Availability.astro`
both honour that query. New motion must fit that existing discipline rather than
introduce a parallel one.

The visual language is a drafting sheet: hairline rules, monospace metadata, and a
hexagonal node with a connector spine beside each section heading (`SectionNode.astro`).
Motion has to read as part of that idiom. A previous restyle was rejected for reading
as a template, so a generic fade-everything reveal is a real risk, not a hypothetical one.

## Decisions

| Question | Decision |
| --- | --- |
| Motion character | Signature but restrained — section headers animate in the drafting-sheet idiom; body content only rises and fades |
| Reveal scope | Homepage only |
| Back-to-top scope | Site-wide (`BaseLayout`) — project pages are the longest scroll |
| Button form | Inline-SVG hexagon echoing `SectionNode` |
| Viewport-entry signal | `IntersectionObserver` |

### Why IntersectionObserver

Considered and rejected:

- **CSS scroll-driven animations** (`animation-timeline: view()`). Zero JS and it would
  track scroll position rather than fire once, but Firefox still gates it behind a flag.
  The failure mode is severe: `opacity: 0` authored in CSS with an animation that never
  runs leaves content permanently invisible. An `@supports` guard makes it safe but means
  maintaining two paths.
- **Extending the existing rAF scroll handler.** Hand-computing element positions
  duplicates what the platform does natively and puts layout reads in the scroll path.

`IntersectionObserver` has universal support, needs no scroll listener, and degrades to
"no animation" rather than "no content".

## Design

### 1. Reveal mechanism — `src/pages/index.astro`

An inline script adds `reveal-armed` to `<html>` before anything is hidden. The hidden
initial state is authored as `.reveal-armed [data-reveal]`, so with JavaScript disabled
no element is ever hidden.

A single observer (`threshold: 0`, `rootMargin: '0px 0px -10% 0px'`) watches all
`[data-reveal]` elements. On intersection it adds `.is-revealed`, calls `unobserve` for
that element, and decrements a counter. At zero it calls `disconnect()` and stamps
`data-reveal-state="done"` on `<html>`.

Elements already on screen at load reveal immediately — `IntersectionObserver` fires on
first observation — so the hero needs no special case.

`[data-reveal]` is applied to the four `<section>` wrappers only — not to the project grid,
the timeline entries, or individual words, icons, and chips.

Marking nested elements was considered and rejected. `IntersectionObserver` is geometric and
ignores `opacity`, so a marked child inside a still-hidden marked parent fires on its own
schedule and the two reveals race. It would also produce a per-card stagger, which is the
option explicitly not chosen.

The hero is **not** marked. It is above the fold, so the observer would fire on first
observation and turn a scroll reveal into a page-load animation — a different effect, and
one that delays the first thing a reader sees.

### 2. Section headers — `src/components/SectionNode.astro`

Keyed off `.is-revealed` on the parent section, with no additional JavaScript. The
component is built from three separate pieces, each needing its own technique — only one
of them is an SVG:

| Piece | What it is | Animation |
| --- | --- | --- |
| `.node::before` | CSS pseudo-element, 1px wide, `height: 5rem`, gradient | `transform: scaleY(0 → 1)`, `transform-origin: bottom` |
| `.hex path` | Real stroked SVG path | `stroke-dashoffset: 1 → 0` |
| `.rule` | `flex: 1` hairline span after the label | `transform: scaleX(0 → 1)`, `transform-origin: left` |

The connector sits *above* its node (`bottom: calc(100% + 0.35rem)`) and its gradient runs
transparent-to-solid downward, so it must grow from the node upward — hence
`transform-origin: bottom`. Growing it the other way would animate the faded end and look
like a rendering fault.

`stroke-dashoffset` applies only to the hexagon. Give the path `pathLength="1"` so the
dash values are `1` and `0` rather than a hardcoded perimeter that breaks if the geometry
is ever edited.

All three use `transform` or `stroke-dashoffset` — compositor-friendly properties. No
animation of `height`, `width`, or layout-affecting values.

Body content inside the section receives only an 8px rise and a fade.

### 3. Back-to-top — `src/components/ScrollTop.astro` (new)

An inline-SVG hexagon reusing `SectionNode`'s geometry, containing an up arrow.
`position: fixed`, bottom-right, respecting `env(safe-area-inset-*)`, with a `z-index`
below the nav's 9999.

Visibility is driven by a second observer watching a 1px-wide, `100vh`-tall
`aria-hidden` sentinel that the component renders at document top. When the sentinel
stops intersecting, the reader is one screen down and the button appears. No scroll
listener is added, so nothing competes with the rAF handler in `Nav.astro`.

Two constraints that are easy to get wrong:

- **Hidden state uses `visibility: hidden` + `opacity: 0` + `pointer-events: none`,
  not the `hidden` attribute.** `visibility` removes the control from the tab order and
  still participates in transitions, so no JS timing is needed to coordinate the fade.
- **Focus moves to the top of the document on activation.** Scrolling a keyboard user to
  the top while focus remains on a button at the bottom means their next Tab returns them
  to where they just left.

`scrollTo({ behavior })` overrides the CSS `scroll-behavior` rule, so the component reads
`matchMedia('(prefers-reduced-motion: reduce)')` directly and passes `'instant'` when set.

The button carries an accessible name (`aria-label="Back to top"`); the hexagon SVG is
`aria-hidden`.

### 4. Observer lifecycle

Required behaviour, stated explicitly because it is the part that rots quietly:

- `unobserve(el)` runs as each element reveals, not only at the end.
- `disconnect()` runs once the last element has revealed. Steady state is **zero** live
  reveal observers.
- A single-init guard prevents a double-included script from stacking observers.
- The sentinel observer is deliberately long-lived: it is a continuous state signal, one
  observer on one element, and must not be "tidied up" into a leak later. This is recorded
  in a comment at the definition.

In the current MPA these disciplines are belt-and-braces, since the document is discarded
on every navigation. They become load-bearing the moment a `ClientRouter` is added, because
scripts then re-run on `astro:page-load` against a surviving document.

### 5. Motion gate

Every animation rule lives inside `@media (prefers-reduced-motion: no-preference)`.
Readers who prefer reduced motion get static content and a button that appears without a
fade — no animation at all, rather than a slower one.

## Verification

Run against the local preview build (`astro preview`), driven by Playwright:

1. After scrolling the homepage to the bottom, every `[data-reveal]` element carries
   `.is-revealed` and `<html>` carries `data-reveal-state="done"` — proving both that the
   reveal fired and that the observer disconnected.
2. With JavaScript disabled, all homepage content is visible.
3. With `prefers-reduced-motion: reduce` emulated, content is visible and untransformed.
4. The button is absent from the tab order at the top of the page, present after scrolling
   one viewport, and focus lands at the top of the document after activation.
5. The nav scroll-spy still marks exactly one link at top, `#work`, `#timeline`, `#skills`,
   and back at top — the regression test for the handler this work sits beside.
6. `npm run build` passes `astro check` with zero errors.

## Files

| File | Change |
| --- | --- |
| `src/components/ScrollTop.astro` | New |
| `src/layouts/BaseLayout.astro` | Render `ScrollTop` |
| `src/components/SectionNode.astro` | Draw-in animation hooks |
| `src/pages/index.astro` | `data-reveal` attributes, reveal script |
| `src/styles/global.css` | Reveal and button styles, reduced-motion gate |

## Out of scope

- Reveals on project detail pages and the work index. Detail pages are prose read top to
  bottom; gating paragraphs behind an animation delays the words rather than framing them.
- Page-transition animations. These would require a `ClientRouter` and change the site's
  navigation model.
- Parallax, scroll-linked scrubbing, and any motion that continues to respond after an
  element has arrived.
