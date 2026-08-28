# Hero title block, and the home-mark click animation

## Context

### The availability signal

Rebuilt once already: the borrowed `#22c55e` dot and Tailwind `animate-ping` were replaced
with the site's own hexagon breathing on opacity. It still reads as machine-generated,
and the reason is structural rather than chromatic — it is a **badge**. A pill with a
border, a fill, and a live indicator is the "Open to work" component, and recolouring it
does not change what it is.

The hero also wastes its right half. Measured at 1024px wide: content occupies the left
450–610px, leaving 415–694px empty per row. Only `.rule` spans the full width, which is
what makes the emptiness read as neglect rather than intent.

### The home mark

The terminal glyph in the header links home. `IconPaths.ts` renders it as two shapes: a
`<rect>` window frame, and one `<path>` carrying both the prompt chevron and the cursor
underscore.

## Decisions

- The availability signal becomes a **title block** in the hero's right column — the
  labelled panel a technical drawing carries in its corner. The hexagon marker stays; the
  pill chrome does not.
- The home mark plays a short animation on click before navigating.

### Recorded objection

A click animation on a navigation link is largely wasted motion: this is a multi-page
site, so the document unloads and whatever plays is cut off. It also has to delay
navigation to be seen at all, which taxes every future use of the control. This was raised
and the owner chose it anyway, so it is built — with the delay held to 200ms and skipped
entirely where it would do harm (see below).

## Design

### Title block

Above `50em` the hero is two columns: narrative left, title block top-right aligned to the
name. Below that breakpoint it collapses back above the name, as now.

The block is a hairline top rule, `AVAILABILITY` in mono, and the status sentence in body
text, with the accent hexagon beside it. No border, no background, no pill — those are the
badge signals, and they are what made it read as generic.

`Availability.astro` keeps its `site.availability.open` guard, so `open: false` still
removes it and the column with it.

### Click animation

On click the inner path — chevron and cursor — blinks once while the whole mark presses in
slightly, over 200ms, then navigation proceeds.

Three cases where the animation must not run, because in each it costs something and
returns nothing:

- **Modified clicks.** Middle-click, and ctrl/cmd/shift/alt clicks, open a new tab or
  window. `preventDefault` there would break that, so they pass straight through
  untouched.
- **Reduced motion.** Navigate immediately, no delay.
- **Any non-primary button.** Right-click opens a context menu and must not be intercepted.

The animation is `transform` and `opacity` only, so it stays on the compositor.

## Verification

1. The hero is two columns above 50em and one below, with no horizontal overflow at 360,
   768 and 1280.
2. The title block has no border and no background — computed, not eyeballed.
3. Setting `availability.open` to false removes the block entirely.
4. A plain click delays navigation by roughly 200ms and then lands on the home page.
5. A ctrl/cmd-click is **not** intercepted — `defaultPrevented` is false, so the browser
   still opens a new tab.
6. Under `prefers-reduced-motion: reduce`, no animation runs and navigation is immediate.
7. `npm run build` reports 0 errors, 0 warnings.

## Files

| File | Change |
| --- | --- |
| `src/components/Availability.astro` | Title block instead of a pill |
| `src/pages/index.astro` | Two-column hero |
| `src/components/Nav.astro` | Click animation on the home mark |

## Out of scope

Turning the home mark into a scroll-to-top when already on the home page. It was offered
and not chosen; the click continues to navigate everywhere.
