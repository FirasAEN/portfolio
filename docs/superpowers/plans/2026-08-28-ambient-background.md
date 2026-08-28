# Ambient Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the drafting grid with three slow-drifting accent-hue gradient shapes at very low opacity.

**Architecture:** A fixed, `pointer-events: none` layer of three radial-gradient spans behind the content, animated with `transform` only. Per-theme opacity is a token, so the two grounds are tuned independently.

**Tech Stack:** Astro 6, CSS custom properties. No new dependencies, no JavaScript.

## Global Constraints

- **No `filter: blur()`** — it forces an offscreen buffer re-blurred every frame. Softness comes from gradient colour stops.
- **Animate `transform` only.** No animation of position, size, colour, or opacity — those leave the compositor.
- All animation lives inside `@media (prefers-reduced-motion: no-preference)`, matching the existing convention in `global.css`.
- The layer must not affect layout: no change to `scrollWidth` or `scrollHeight`.
- **Body text must clear 4.5:1** against the background at each blob's most saturated point, in both themes. Contrast wins over the effect.
- `npm run build` reports 0 errors, 0 warnings.

---

### Task 1: Replace the grid with the ambient layer

**Files:**
- Modify: `src/styles/backgrounds.ts`
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Swap the tokens**

In `src/styles/backgrounds.ts`, delete `--grid-line` (both themes) and `--grid-size`, and add the per-theme ambient opacity. The two grounds are not symmetric — the same value that reads as a faint glow on near-black reads as a dirty smudge on near-white:

```ts
export const backgroundVarsCss = `
	:root {
		--bg-image-noise: url(${noise.src});
		--ambient-opacity: 0.07;
	}
	:root.theme-dark {
		--ambient-opacity: 0.12;
	}
`;
```

- [ ] **Step 2: Strip the grid from the ground layer**

In `src/layouts/BaseLayout.astro`, `.sheet::before` keeps only the ground colour. The `mask-image` goes with the grid — it exists to fade the grid out downward, and the ground colour must not fade:

```css
		.sheet::before {
			content: '';
			position: fixed;
			inset: 0;
			z-index: -1;
			background-color: var(--gray-999);
		}
```

- [ ] **Step 3: Add the markup**

As the **first** child inside `.stack.sheet`, before `<Nav />`. All three of `::before`, `.ambient` and `::after` sit at `z-index: -1`, so paint order is tree order: ground, then shapes, then grain over the top.

```astro
		<div class="stack sheet">
			<div class="ambient" aria-hidden="true">
				<span></span><span></span><span></span>
			</div>
			<Nav />
```

- [ ] **Step 4: Add the styles**

```css
		/*
		 * Ambient drift. Opacity lives on the container so the three shapes share
		 * one tunable value and the theme difference is a single token.
		 */
		.ambient {
			position: fixed;
			inset: 0;
			z-index: -1;
			overflow: hidden;
			pointer-events: none;
			opacity: var(--ambient-opacity);
		}

		/* Softness comes from the colour stop, not filter: blur() — blur forces an
		   offscreen buffer that is re-blurred on every animated frame. */
		.ambient span {
			position: absolute;
			display: block;
			width: 50vmax;
			height: 50vmax;
			border-radius: 50%;
			background: radial-gradient(
				circle at center,
				var(--accent-regular) 0%,
				color-mix(in srgb, var(--accent-regular) 55%, transparent) 35%,
				transparent 70%
			);
		}

		.ambient span:nth-child(1) { top: -18vmax; left: -12vmax; }
		.ambient span:nth-child(2) { top: 30vmax; left: 55vmax; }
		.ambient span:nth-child(3) { top: 62vmax; left: 8vmax; }

		/* Three different periods, so the composite has no perceptible loop. Equal
		   durations would resynchronise every cycle and read as a repeat. */
		@media (prefers-reduced-motion: no-preference) {
			.ambient span {
				will-change: transform;
			}

			.ambient span:nth-child(1) {
				animation: ambient-a 40s ease-in-out infinite alternate;
			}

			.ambient span:nth-child(2) {
				animation: ambient-b 55s ease-in-out infinite alternate;
			}

			.ambient span:nth-child(3) {
				animation: ambient-c 70s ease-in-out infinite alternate;
			}
		}

		@keyframes ambient-a {
			from { transform: translate3d(0, 0, 0) scale(1); }
			to { transform: translate3d(12vmax, 8vmax, 0) scale(1.15); }
		}

		@keyframes ambient-b {
			from { transform: translate3d(0, 0, 0) scale(1.1); }
			to { transform: translate3d(-14vmax, 6vmax, 0) scale(0.95); }
		}

		@keyframes ambient-c {
			from { transform: translate3d(0, 0, 0) scale(0.95); }
			to { transform: translate3d(9vmax, -11vmax, 0) scale(1.2); }
		}
```

- [ ] **Step 5: Extend the forced-colors rule**

```css
		@media (forced-colors: active) {
			.sheet::before,
			.sheet::after {
				background: none;
			}

			.ambient {
				display: none;
			}
		}
```

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: `0 errors, 0 warnings`.

- [ ] **Step 7: Contrast gate — the one that can fail**

Cards and diagrams sit on `--surface`, which is opaque, so they cannot be tinted. Body text sits directly on this background and can be. Sample the composited background beneath body text at each shape's most saturated point, in both themes, and compute the ratio against `--fg-muted`.

Expected: every sample **≥ 4.5:1**. If any sample fails, lower `--ambient-opacity` for that theme and re-measure. Do not accept a failing sample.

- [ ] **Step 8: Layout and motion checks**

- `document.body.scrollHeight` and `document.documentElement.scrollWidth` unchanged from before the change.
- No horizontal scrollbar at 360px, 768px and 1280px widths.
- Under emulated `prefers-reduced-motion: reduce`, `getAnimations()` on the shapes returns empty, and the shapes are still coloured.

- [ ] **Step 9: Commit**

```bash
git add src/styles/backgrounds.ts src/layouts/BaseLayout.astro
git commit -m "feat: replace the drafting grid with an ambient background"
```
