# Contrast to WCAG AA

**Goal:** every piece of text on the site clears 4.5:1 against the background it
is actually composited over, in both themes, without flattening the visual
hierarchy the mono labels depend on.

## The finding

Measured against `--gray-999` with the ambient layer at its most saturated point:

| alpha of `--gray-100` | light flat | light ambient | dark flat | dark ambient |
| --- | --- | --- | --- | --- |
| **44%** — today's `--fg-subtle` | 2.47 | **2.25** | 3.71 | **3.32** |
| 55% | 3.26 | 2.97 | 5.22 | **4.66** |
| **70%** — today's `--fg-muted` | 4.97 | **4.52** | 7.92 | 7.07 |
| 75% | 5.77 | 5.26 | 8.99 | 8.03 |
| 85% | 7.88 | **7.17** | 11.41 | 10.20 |

On the light theme, **body text already sits on the AA floor** — 4.52 against a
requirement of 4.5. There is no room beneath it, so any label lighter than body
text fails by construction, whatever value is chosen. This is not a
`--fg-subtle` tuning problem; the light ramp is compressed against the floor and
`--fg-subtle` is only where it shows first.

`--gray-400`, used for five pieces of text, fails on light for the same reason:
4.37 flat, **3.98** over the ambient.

## Decisions

- **Headroom before hierarchy.** `--fg-muted` goes to 85% on light, moving body
  text 4.52 → 7.17. Dark is already at 7.07 and does not move.
- **`--fg-subtle` becomes an AA label token, at a different alpha per theme** —
  72% light, 55% dark. The asymmetry is deliberate and already precedented:
  `--ambient-opacity` is 0.12 dark against 0.07 light because the two grounds
  are not symmetric. What is matched is the *step*: body-to-label lands at 1.49×
  on light and 1.52× on dark, so both themes read with the same hierarchy from
  different numbers.
- **The lost lightness step is recovered in form, not colour.** The step shrinks
  from 2.1× to ~1.5×, so `.meta` carries more of its distinction through weight
  and tracking. Neither affects measured contrast — WCAG scores colour, not
  weight.
- **`--gray-400` stays a raw ramp value.** Its text consumers move to
  `--fg-subtle`. Ramp values are raw material; semantic tokens are what text is
  allowed to use.

Rejected: bumping `--fg-subtle` to 70% on light. It passes at 4.52, but it sits
0.02 above the floor and becomes byte-identical to `--fg-muted` — the token
stops meaning anything and the labels become body text.

## Changes

| File | Change |
| --- | --- |
| `src/styles/global.css` | `--fg-muted` 70% → 85% and `--fg-subtle` 44% → 72% on `:root`; both re-declared on `:root.theme-dark` at 70% / 55% |
| `src/styles/global.css` | `--tracking-meta` 0.12em → 0.14em; `.meta` font-weight 500 → 400 |
| `src/styles/global.css` | `.index-num`, `.figure figcaption`, `.diagram .d-meta` → `--fg-subtle` |
| `src/pages/index.astro` | `.entry-role` → `--fg-subtle` |
| `src/components/Skills.astro` | `.skills p` → `--fg-subtle` |
| `src/components/Footer.astro` | `footer` and `footer a` → `--fg-subtle` |

`--tracking-meta` has two consumers beyond `.meta` — `SkillsEvidenced.astro` and
`PortfolioPreview.astro`. Both are mono labels of the same kind, so the change is
intended to reach them.

## Verification

1. Every text sample in the earlier audit re-measured in **both** themes,
   against the composited ambient ground, not the flat one. All ≥ 4.5.
2. `--fg-muted` and `--fg-subtle` remain visibly distinct — the measured step is
   ≥ 1.45× in both themes.
3. No remaining text consumer of `--gray-400`.
4. `npm run build` reports 0 errors, 0 warnings, 0 hints.

## Out of scope, flagged

`.diagram .d-meta` is diagram label text at **9px**. Moving it to `--fg-subtle`
fixes its contrast but not its size, and at 9px it is the hardest text on the
site to read. Worth its own decision.

AAA (7:1) is not reachable on the light ground for anything but full-strength
ink, so this is an AA plan throughout.
