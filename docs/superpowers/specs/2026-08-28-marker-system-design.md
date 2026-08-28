# Marker system — one hexagon, one gutter

## Context

Two things on the page mean "a node": the hexagon beside each section heading
(`SectionNode`) and the marker on each timeline entry. They were built separately and
have drifted apart in every respect.

Measured on the live page:

| Symptom | Measurement |
| --- | --- |
| Section connector misses the hexagon centre | connector `left: 0px`, marker centre at `16px` — **16px off** |
| Timeline spine misses its marker centre | marker centre `-19px`, spine centre `-20.5px` — **1.5px off** |
| The two gutters disagree | section marker centre 40px from the container edge, timeline spine 48px |
| Markers are small | section hexagon 32px; timeline marker 8px outer |
| Index numeral is small | 10px inside a 32px hexagon |
| Shapes disagree | section marker is an SVG hexagon; timeline marker is a rotated square |

The 16px connector error has a specific cause worth recording: `--node-size` is declared
on `.marker` but consumed by `.node::before` in `calc(var(--node-size) / 2 - 0.5px)`. A
parent cannot read a child's custom property, so the `calc()` is invalid at
computed-value time and `left` falls back to its static position.

The rotated square exists because an earlier `clip-path` hexagon sliced its own border
into fragments (commit `c89fcbc`). `clip-path` cuts the border along with the box. An SVG
path has no border to slice, so the shape can return.

## Decisions

- **One shape component.** `HexMarker.astro` owns the hexagon. `SectionNode` and the
  timeline both render it. The drift above happened because the shape was defined twice;
  after this it is defined once.
- **One gutter.** A single `--marker-size` token positions both markers, so their centres
  land on the same vertical line by construction rather than by two independent sums.
- Section marker 32px → **40px**; index numeral 10px → **13px**; timeline marker 8px →
  **12px**.

## Design

### `HexMarker.astro` (new)

Renders only the shape: an SVG on the `0 0 24 24` viewBox carrying the existing path,
`stroke="currentColor"`, `fill="none"`, and `pathLength="1"`. Takes a `size` prop and an
optional class. Colour comes from the parent through `currentColor`; the component sets no
colour of its own.

`fill` stays `none` deliberately. Filling with the ground colour would punch an opaque
patch through the ambient background behind it, which is visible as a hole once the shapes
drift underneath.

`pathLength="1"` is carried over so a stroke-draw animation can use dash values of `1` and
`0` rather than the real perimeter (~62.7), which would silently break if the geometry
were edited.

### Gutter

`--marker-size: 2.5rem` on `:root`. Both consumers derive from it:

- `SectionNode`: the marker box is `var(--marker-size)` square, and the connector sits at
  `calc(var(--marker-size) / 2 - 0.5px)`. The local `--node-size` is deleted — it is the
  bug.
- Timeline: `padding-left: var(--marker-size)` on the list; the marker and the spine are
  both placed from `calc(-1 * var(--marker-size) / 2 …)`.

Because the section marker starts at the content edge and the timeline's padding equals
the same token, both centres resolve to *content edge + `--marker-size` / 2*. The two
gutters agree by construction, and stay agreeing if the token changes.

### Index numeral

13px, and centred **optically** rather than by box. The box centre is already exact —
measured offset 0.00/0.00 — so the perceived low position comes from cap-height centre
sitting above em-box centre. The correction is measured from rendered glyph bounds, not
chosen by eye, and recorded as a comment with the measurement that produced it.

## Verification

1. Section connector centre equals section marker centre, to within 0.5px.
2. Timeline spine centre equals timeline marker centre, to within 0.5px.
3. Section marker centre and timeline marker centre sit at the same x, to within 0.5px.
4. Rendered index glyph bounds are centred in the hexagon to within 0.5px vertically.
5. No horizontal overflow at 360px, 768px, 1280px — the wider gutter must not push the
   content column out.
6. `npm run build` reports 0 errors, 0 warnings.

## Files

| File | Change |
| --- | --- |
| `src/components/HexMarker.astro` | New — owns the shape |
| `src/components/SectionNode.astro` | Use `HexMarker`; drop `--node-size`; resize |
| `src/pages/index.astro` | Timeline marker becomes `HexMarker`; gutter from the token |
| `src/styles/global.css` | Add `--marker-size` |

## Known merge conflict

`scroll-motion` also modifies `SectionNode.astro` — it adds the draw-in animation and
already contains the `--node-size` fix. That fix will conflict directly with this one.
Resolve in favour of this version, which additionally unifies the gutter.

## Out of scope

Any change to the reveal animations themselves.
