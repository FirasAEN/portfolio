# Ambient background — replacing the drafting grid

## Context

The page background is a drafting grid: `.sheet::before` paints 1px lines on a 72px
module, `position: fixed`, masked to fade toward the bottom.

It collides with the content's own hairlines — the section rule in `SectionNode`, the
timeline spine, the node connector — and the collision is not static. Because the grid
is fixed to the viewport while content scrolls, the distance between a content hairline
and the nearest grid line drifts continuously. Measured on the live page across 36px of
scroll, one section rule moved through 4.1px → 5.9px → 15.9px → 31.9px from the nearest
grid line, and a timeline marker sat 2.6px off.

The 0–6px band is the damaging one: too far apart to read as one line, too close to read
as two. The new reveal animations make it worse, because a rule that grows via `scaleX`
sweeps across grid lines while the eye is already on it.

A second, unrelated misalignment surfaced while measuring: the `SectionNode` marker
centre sits 40px from the container's left edge while the timeline entry spine sits at
48px. Both read as "the spine in the gutter" but disagree by 8px. **This is recorded
here but deliberately not fixed by this work** — it is a layout question, and this change
removes the grid rather than aligning to it.

## Decision

Replace the grid with an ambient background: slow-drifting soft gradient shapes in the
accent hue, at very low opacity.

An alternative was considered and rejected by the owner after discussion: anchoring the
grid to the content container and unifying the gutter spine column, so hairlines would
land on grid lines by construction. It was the stronger answer to the collision
specifically, but the owner chose the ambient background. Recorded so the reasoning is
not relitigated.

Intensity is **barely perceptible**: a single accent hue, low opacity. The reader should
register that the background is not flat, without being able to describe the shapes.

## Design

### Removed

`.sheet::before` keeps the ground colour and loses everything else — both grid gradients,
`background-size`, and the `mask-image`. The mask exists only to fade the grid out
downward; the ground colour must not fade, so it goes with the grid.

`--grid-line` and `--grid-size` are deleted from `src/styles/backgrounds.ts`.

### Kept

`.sheet::after`, the grain layer at `opacity: 0.02`, stays — and stops being merely
decorative. Large, soft gradients band visibly on 8-bit displays; noise is the standard
remedy. It is now load-bearing for this effect.

### Added

A `<div class="ambient" aria-hidden="true">` in `BaseLayout`, holding three `<span>`
elements. `position: fixed`, `inset: 0`, `z-index: -1`, `pointer-events: none`,
`overflow: hidden`.

Each span is a single `radial-gradient` in `--accent-regular`, roughly 50vmax across,
fading to `transparent` by 70%.

**No `filter: blur()`.** It is the common way to build this and the expensive way: it
forces an offscreen buffer and re-blurs on every animated frame. A soft gradient colour
stop produces the same edge at no cost.

Animation is `transform: translate3d(...) scale(...)` only, so frames stay on the
compositor and never trigger layout or paint. The three spans use different durations —
40s, 55s, 70s, `alternate`, `infinite` — so the composite has no perceptible loop. Equal
durations would resynchronise every cycle and read as a repeat.

### Per-theme opacity

The two grounds are not symmetric and must not share a value. On the dark ground
(`#090b11`) the accent reads as a faint glow; on the light ground (`#f8f9fc`) the same
value reads as a dirty smudge. Starting points are approximately 0.12 dark and 0.07
light, to be settled by the contrast measurement below rather than by eye.

### Reduced motion

Under `prefers-reduced-motion: reduce`, `animation: none`. The shapes hold their initial
positions with colour intact — a static gradient, not a slower drift.

### Forced colors

The existing `@media (forced-colors: active)` rule that blanks `.sheet::before` and
`.sheet::after` extends to `.ambient`.

## Verification

1. **Contrast is the gate.** Cards, panels and diagrams sit on `--surface`, which is
   opaque, so they cannot be tinted. Body text sits directly on this background and can
   be. Sample the rendered background at each blob's most saturated point, in both
   themes, and confirm body text still clears **4.5:1**. If it does not, reduce opacity
   until it does. Contrast wins over the effect.
2. No horizontal scrollbar and no change to `document.scrollWidth` — the layer is fixed
   and must not affect layout.
3. Under emulated `prefers-reduced-motion: reduce`, no animation is running and the
   shapes are still coloured.
4. `document.body.scrollHeight` is unchanged from before the change.
5. `npm run build` reports 0 errors, 0 warnings.

## Files

| File | Change |
| --- | --- |
| `src/layouts/BaseLayout.astro` | Strip grid from `.sheet::before`; add `.ambient` markup and styles |
| `src/styles/backgrounds.ts` | Delete `--grid-line` and `--grid-size` |

## Out of scope

- The 40px/48px gutter-spine disagreement noted above.
- Any change to the reveal animations, which land separately on the `scroll-motion`
  branch. Both touch `BaseLayout.astro`, so that merge will need attention.
- Parallax or scroll-linked background motion. The drift is time-based and independent
  of scroll position.
