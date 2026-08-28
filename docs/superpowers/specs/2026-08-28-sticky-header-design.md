# Sticky header — make it stick, glass it, swap the name

## Context

The header is declared `position: sticky; top: 0; z-index: 9999`, carries a translucent
background and `backdrop-filter: blur(10px)`, and a JavaScript handler adds a `.scrolled`
class past 8px of scroll. Every piece works. None of it has ever been visible.

Measured: at `scrollY 1500` the nav's `getBoundingClientRect().top` is **-1500** — it
scrolls away with the page. The `.scrolled` class *is* applied, so the JS is fine.

The cause is in `global.css`:

    html,
    body {
      min-height: 100%;
      overflow-x: hidden;
    }

`overflow-x: hidden` on `body` forces `body`'s computed `overflow-y` to `auto`, which
makes body a scroll container. `position: sticky` then resolves against body's scrollport
— which never scrolls, because the viewport does. Setting body's `overflow-x` back to
`visible` restores `top: 0` immediately.

Two consequences follow from the header never sticking: the `.scrolled` border rule has
been dead code since it was written, and `[id] { scroll-margin-top: 5.5rem }` has been
compensating for a header that was not there.

## Decisions

- Remove `overflow-x: hidden` from **`body` only**. `html` keeps its copy, so the
  horizontal-overflow guard remains; it is body's declaration that breaks sticky.
- Invert the glass. Today the translucent background is unconditional and `.scrolled`
  adds only a border. Instead: transparent at rest, and on stick the background, blur,
  hairline border and a soft shadow arrive together.
- The full name is hidden while the header is at rest and fades in once it sticks. At the
  top the hero already renders the name at 48px directly beneath, so the header repeating
  it is redundant; once the hero has scrolled away the header should carry the identity.

## Design

### Stickiness

One declaration removed. Because `html` retains `overflow-x: hidden`, the guard against a
horizontal scrollbar is unchanged — this only stops body from being a scroll container.

### Glass

`nav` at rest: transparent background, transparent bottom border, no backdrop filter.

`nav.scrolled`: `background-color` at ~82% of the ground colour, `backdrop-filter:
blur(12px)`, `border-bottom-color: var(--rule-color)`, and a soft downward shadow.

Declaring `backdrop-filter` only in the stuck state matters beyond tidiness: a permanent
`backdrop-filter` forces a compositing layer and re-filters the backdrop on every frame,
including while the effect is invisible.

### Name

The name becomes a `<span class="site-name">` so it can be targeted; the terminal icon
stays put as a constant anchor.

It is hidden with `opacity`, **not** `display: none` or `visibility`. Two reasons: the
element keeps its space, so the left grid column does not change width and nothing shifts
when it appears; and the text stays in the accessibility tree, so the site-title link
keeps its accessible name at every scroll position.

### Height stays constant — deliberately

A sticky element still occupies its space in normal flow. Reducing the header's padding on
stick would shorten it and pull all following content upward, producing a visible jump
each time the threshold is crossed. So the height does not change; the shape change is
carried entirely by the surface — glass, border, shadow — plus the name arriving.

A physically compacting bar is possible but needs a reserved fixed height, which is a
larger change and is out of scope here.

### Motion

Transitions live inside `@media (prefers-reduced-motion: no-preference)`, matching the
convention already used in `global.css`. The end states are declared unconditionally, so a
reduced-motion reader gets an instant swap rather than no swap.

## Verification

1. At `scrollY 1500`, the nav's `top` is `0` — it is stuck. This is the regression test
   for the whole change.
2. No horizontal overflow at 360px, 768px, 1280px: `scrollWidth <= clientWidth`. This is
   the check that removing the body rule was safe.
3. Header height is identical at rest and stuck, and `document.body.scrollHeight` is
   unchanged, so nothing jumps.
4. At rest: name `opacity: 0`, no `backdrop-filter`. Stuck: name `opacity: 1`,
   `backdrop-filter` present, border visible.
5. The site-title link still exposes its full accessible name at both scroll positions.
6. Nav scroll-spy still marks exactly one link — it shares this component.
7. `npm run build` reports 0 errors, 0 warnings.

## Files

| File | Change |
| --- | --- |
| `src/styles/global.css` | Drop `overflow-x: hidden` from `body` |
| `src/components/Nav.astro` | Wrap the name; invert the glass; fade the name on stick |

## Out of scope

- A physically compacting header, per the height note above.
- `scroll-margin-top: 5.5rem`, which was compensating for a header that never stuck. It
  is now doing its intended job and should be re-checked visually, but changing it is a
  separate decision.
