# Marker System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** One hexagon component and one gutter token, so the section marker and the timeline marker share a shape and a vertical line — and grow to a readable size.

**Architecture:** `HexMarker.astro` owns the SVG shape. `--marker-size` on `:root` positions both consumers, so their centres resolve to the same x by construction.

**Tech Stack:** Astro 6, CSS custom properties. No new dependencies, no JavaScript.

## Global Constraints

- The shape is defined **once**. No second hexagon, no rotated-square fallback.
- Marker and spine positions derive from `--marker-size`; no independently written pixel offsets that must be kept in sync by hand.
- `fill="none"` on the hexagon — a ground-coloured fill punches an opaque hole through the ambient background.
- `pathLength="1"` retained so dash-based draw animation uses `1`/`0`, not the real perimeter.
- `npm run build` reports 0 errors, 0 warnings.

---

### Task 1: One shape, one gutter

**Files:**
- Create: `src/components/HexMarker.astro`
- Modify: `src/components/SectionNode.astro`, `src/pages/index.astro`, `src/styles/global.css`

- [ ] **Step 1: Measure the baseline so the fixes are provable**

In the browser, record: section connector centre vs marker centre; timeline spine centre vs marker centre; both marker centres relative to the container.

Expected before: 16px, 1.5px, and 40px vs 48px respectively.

- [ ] **Step 2: Create `HexMarker.astro`**

```astro
---
// The one hexagon on this site. It was previously defined twice — an SVG beside
// section headings and a rotated square on the timeline — which is how their
// sizes, shapes and centres drifted apart.
//
// A rotated square rather than clip-path was used for the timeline because
// clip-path slices a border into fragments (c89fcbc). An SVG path has no border
// to slice, so one shape now serves both.
interface Props {
	/** Rendered size, e.g. "2.5rem" or "12px". */
	size: string;
	class?: string | undefined;
}
const { size, class: className } = Astro.props;
---

<svg
	class:list={['hex-marker', className]}
	style={`--hex-size: ${size}`}
	viewBox="0 0 24 24"
	aria-hidden="true"
>
	<path
		d="M12 1.5 21 6.75 21 17.25 12 22.5 3 17.25 3 6.75 Z"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linejoin="round"
		pathLength="1"></path>
</svg>

<style>
	/* fill stays none: a ground-coloured fill punches an opaque patch through
	   the ambient background, which reads as a hole once the shapes drift. */
	.hex-marker {
		display: block;
		width: var(--hex-size);
		height: var(--hex-size);
		flex: none;
	}
</style>
```

- [ ] **Step 3: Add the gutter token**

In `src/styles/global.css`, alongside the other layout tokens:

```css
	/* One gutter for every node marker. The section marker starts at the content
	   edge and the timeline reserves the same width as padding, so both centres
	   resolve to content-edge + half this value — and stay agreeing if it changes.
	   They previously disagreed by 8px (40 vs 48). */
	--marker-size: 2.5rem;
```

- [ ] **Step 4: Rework `SectionNode.astro`**

Replace the inline `<svg class="hex">` with `<HexMarker size="var(--marker-size)" />`, delete the local `--node-size` declaration, and drive the box and connector from the token:

```css
	.marker {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--marker-size);
		height: var(--marker-size);
		flex: none;
		color: var(--accent-regular);
	}

	.node::before {
		content: '';
		position: absolute;
		left: calc(var(--marker-size) / 2 - 0.5px);
		bottom: calc(100% + 0.35rem);
		width: 1px;
		height: 5rem;
		background: linear-gradient(to bottom, transparent, var(--rule-color));
	}
```

`--node-size` was declared on `.marker` but read by `.node::before`. A parent cannot read a child's custom property, so that `calc()` was invalid and `left` fell back to 0 — the whole 16px error.

The index numeral grows to 13px:

```css
	.index {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--accent-regular);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
```

- [ ] **Step 5: Rework the timeline in `index.astro`**

Import `HexMarker`, render one inside each `<li class="entry">` as the first child, and delete `.entry::before`.

```astro
						<li class="entry">
							<HexMarker size="12px" class="entry-marker" />
```

```css
	.timeline {
		list-style: none;
		padding: 0 0 0 var(--marker-size);
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	/* Marker and spine both derive from --marker-size, so the spine is centred by
	   construction. Writing the two offsets independently is how they ended up
	   1.5px apart. */
	.entry-marker {
		position: absolute;
		left: calc(-1 * var(--marker-size) / 2 - 6px);
		top: 0.4rem;
		color: var(--accent-regular);
	}

	.entry::after {
		content: '';
		position: absolute;
		left: calc(-1 * var(--marker-size) / 2 - 0.5px);
		top: 1.3rem;
		bottom: 0;
		width: 1px;
		background: var(--rule-color);
	}
```

- [ ] **Step 6: Build**

```bash
npm run build
```

Expected: `0 errors, 0 warnings`.

- [ ] **Step 7: Prove the three alignments**

Re-measure. Expected, all within 0.5px:
- section connector centre == section marker centre
- timeline spine centre == timeline marker centre
- section marker centre x == timeline marker centre x

- [ ] **Step 8: Centre the numeral optically**

Measure the rendered glyph bounds (not the box) against the hexagon centre. If the glyphs sit low, apply the measured correction as a `transform: translateY(...)` on `.index` and record the measurement in a comment. Re-measure to confirm it lands within 0.5px.

- [ ] **Step 9: No overflow**

At 360px, 768px and 1280px: `scrollWidth == clientWidth`. The wider gutter must not push the content column out.

- [ ] **Step 10: Commit**

```bash
git add src/components/HexMarker.astro src/components/SectionNode.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: one hexagon and one gutter for every node marker"
```
