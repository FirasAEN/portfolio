# Identity signals — availability marker and name alias

## Context

Two small pieces of the hero were carrying borrowed or ambiguous identity.

### The availability pill

    background-color: #22c55e;
    animation: availability-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
    /* keyframes: scale(2.8), opacity 0 */

`#22c55e` is hardcoded. It is not a token, is not derived from the accent, and appears in
no other file in the project. The pulse is Tailwind's `animate-ping` reproduced by hand.
The component's own comment records the provenance: *"borrowed from the reference
portfolio."*

So the reason it reads as generic is not incidental — it is vocabulary imported from
somewhere else and never joined to this design system.

### The name

`site.name` is `Firas François Abed El Nabi`, used in the `h1`, the nav and every page
title. But `site.email` is `francois.aen@gmail.com` and the LinkedIn handle is
`françois-aen-phd`. A reader matching this page against the CV or LinkedIn meets two
different names with nothing connecting them.

## Decisions

- The availability indicator becomes the site's own `HexMarker` in `--accent-regular`,
  breathing by opacity. The green and the ping are removed outright.
- The alias is **stated in text**, once. An animated switch between the two name forms was
  proposed and rejected: an `h1` is the page's primary identity claim, text that mutates
  while being read is disorienting, a recruiter cross-checking against LinkedIn needs one
  stable string, and a heading whose rendered text changes is an accessibility problem. It
  is also a text-cycling animation — the same class of template trick the pill was being
  redesigned to escape.

### Accepted trade-off

Green is a universal availability signal and cyan is not, so the instant read weakens
slightly. Accepted because the label states availability explicitly in words, and cyan is
already this site's live/active colour — links, nodes, index numerals.

## Design

### Availability

`<span class="dot">` is replaced by `HexMarker` at `0.6rem`, wrapped in a span the
component owns.

The wrapper is required, not stylistic: Astro scopes a style to the component that
declares it, so a class passed to `HexMarker` lands on an element carrying `HexMarker`'s
scope id and the parent's rule never matches. This already caused both marker rules to be
silently inert once in this project.

Animation is a single opacity breath — about 0.45 to 1 over 3.2s, `ease-in-out`,
`alternate`, `infinite`. No expanding halo, no second pseudo-element. Declared inside
`@media (prefers-reduced-motion: no-preference)`, so a reduced-motion reader sees a static
marker at full opacity rather than a slower pulse.

### Name alias

`alias: 'François AEN'` is added to `site.ts` beside `name`, so the string is configured
once rather than typed into markup.

The hero renders it directly under the `h1` and above the rule, in the existing mono
`.meta` treatment: **also François AEN**.

The `h1` is unchanged. The nav keeps only the canonical name — repeating the alias in a
header that already competes for space would move the duality rather than resolve it.

## Verification

1. No occurrence of `#22c55e` anywhere in `src/`.
2. The availability marker resolves to `--accent-regular`, and its wrapper rule actually
   applies — computed opacity is animated, not the CSS default.
3. Under `prefers-reduced-motion: reduce`, the marker runs no animation and its computed
   opacity is 1.
4. The alias renders once on the page, the `h1` still contains exactly the canonical name,
   and the nav contains no alias.
5. Hero layout does not shift: `document.body.scrollHeight` grows only by the alias line's
   own height, and there is no horizontal overflow at 360/768/1280.
6. `npm run build` reports 0 errors, 0 warnings.

## Files

| File | Change |
| --- | --- |
| `src/components/Availability.astro` | HexMarker instead of the green dot; breath instead of ping |
| `src/config/site.ts` | Add `alias` |
| `src/pages/index.astro` | Render the alias under the `h1` |

## Out of scope

Any change to the `h1` itself, to page titles, or to the nav's name.
