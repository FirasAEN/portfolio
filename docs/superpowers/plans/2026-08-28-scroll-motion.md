# Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reveal homepage sections as the reader scrolls, and add a site-wide back-to-top control, without adding dependencies, scroll listeners, or leaked observers.

**Architecture:** Two `IntersectionObserver`s. One watches `[data-reveal]` elements on the homepage, adds `.is-revealed`, unobserves each element as it fires, and disconnects when the last one lands. One watches a full-viewport sentinel to toggle the back-to-top button. All hidden states are gated behind a `reveal-armed` class that only JavaScript adds, so scripting-off degrades to "no animation" rather than "no content".

**Tech Stack:** Astro 6, plain TypeScript in `<script>` tags, CSS custom properties. No test framework and no new dependencies.

## Global Constraints

- **No new dependencies.** `package.json` has zero devDependencies and three dependencies (`@astrojs/check`, `astro`, `typescript`). Adding a test runner is out of scope.
- **No new scroll listeners.** `Nav.astro` already runs one rAF-throttled handler for the sticky rule and scroll-spy. Viewport-entry detection uses `IntersectionObserver`.
- **Every animation lives inside `@media (prefers-reduced-motion: no-preference)`.** Readers preferring reduced motion get no animation, not a slower one.
- **Observer lifecycle:** `unobserve` per element as it reveals; `disconnect()` when the last one fires; a single-init guard so a doubly-included script cannot stack observers. The sentinel observer is deliberately long-lived and must be commented as such.
- **Button `z-index` must be below the nav's `9999`** and it renders inside `.stack.sheet`, which is `position: relative; isolation: isolate`.
- TypeScript is `astro/tsconfigs/strict`. `npm run build` runs `astro check` first and must report **0 errors, 0 warnings**.
- Site base path is `/portfolio`; the preview server serves at `http://localhost:<port>/portfolio/`.

## Deviation from the spec

The spec says `[data-reveal]` goes on "the section wrappers, the project grid, and the timeline
entries". This plan puts it on the four `<section>` elements **only**.

Reason: `IntersectionObserver` is geometric and ignores `opacity`, so a `[data-reveal]` child
inside a still-hidden `[data-reveal]` parent fires on its own schedule and the two reveals race.
Nested reveals would also produce a per-card stagger, which is the "Staggered cards" option that
was explicitly not chosen.

## Setup (before Task 1)

Verification is browser-driven because the project has no test runner. Start a preview
server once and leave it running:

```bash
npm run build && npx astro preview --port 4343
```

Note the port actually chosen — it prints `Local http://localhost:<port>/portfolio` and
increments if the port is taken. Every URL below assumes `4343`.

## File Structure

| File | Responsibility |
| --- | --- |
| `src/styles/global.css` | Reveal hidden/revealed states and the `SectionNode` draw-in rules. Global because they key off `.reveal-armed` on `<html>`, which is outside any component's scope. |
| `src/pages/index.astro` | `data-reveal` attributes on the four sections, plus the observer script. Homepage-only, so it lives here rather than in the layout. |
| `src/components/SectionNode.astro` | Adds `pathLength="1"` to the hexagon path. Nothing else. |
| `src/components/ScrollTop.astro` | New. Sentinel, button markup, scoped styles, and its own observer. |
| `src/layouts/BaseLayout.astro` | Renders `ScrollTop` inside `.stack.sheet`. |

---

### Task 1: Reveal mechanism

**Files:**
- Modify: `src/styles/global.css` (append)
- Modify: `src/pages/index.astro` (four `<section>` tags; new `<script>`)

**Interfaces:**
- Consumes: nothing.
- Produces: `.reveal-armed` on `<html>`; `.is-revealed` on each `[data-reveal]` element; `<html data-reveal-state="armed">` then `"done"`. Task 2 styles key off `[data-reveal].is-revealed`. Task 4 asserts on `data-reveal-state`.

- [ ] **Step 1: Write the failing check**

With the preview running, load `http://localhost:4343/portfolio/` and evaluate:

```js
(() => JSON.stringify({
  marked: document.querySelectorAll('[data-reveal]').length,
  state: document.documentElement.dataset.revealState ?? null,
}))()
```

- [ ] **Step 2: Run it to confirm it fails**

Expected now: `{"marked":0,"state":null}` — nothing is marked and no script runs.

- [ ] **Step 3: Add the CSS**

Append to `src/styles/global.css`:

```css
/* --- Reveal on scroll ----------------------------------------------------
 * The hidden state is gated on .reveal-armed, which only JavaScript adds, so
 * with scripting off nothing is ever hidden. Gated again on reduced motion, so
 * that reader gets static content rather than a slower animation.
 */
@media (prefers-reduced-motion: no-preference) {
	.reveal-armed [data-reveal] {
		opacity: 0;
		transform: translateY(8px);
	}

	/* The transition lives on the revealed state only, so nothing animates
	   backwards if a class is ever removed. */
	.reveal-armed [data-reveal].is-revealed {
		opacity: 1;
		transform: none;
		transition: opacity 0.45s ease-out, transform 0.45s ease-out;
	}
}
```

- [ ] **Step 4: Mark the sections**

In `src/pages/index.astro`, add `data-reveal` to the four section elements. The hero
`<header>` is deliberately **not** marked — it is above the fold, so the observer would
fire on first observation and turn a scroll reveal into a page-load animation.

Change each of these four opening tags:

```astro
<section class="wrapper section" id="work">
<section class="wrapper section" id="timeline">
<section class="wrapper section" id="skills">
<section class="wrapper section" id="about">
```

to:

```astro
<section class="wrapper section" id="work" data-reveal>
<section class="wrapper section" id="timeline" data-reveal>
<section class="wrapper section" id="skills" data-reveal>
<section class="wrapper section" id="about" data-reveal>
```

- [ ] **Step 5: Add the observer script**

In `src/pages/index.astro`, insert this immediately before the closing `</BaseLayout>` tag:

```astro
<script>
	// Reveal-on-scroll. `data-reveal-state` is both the init guard and the hook
	// the verification asserts on: "armed" while watching, "done" once every
	// element has revealed and the observer has been dropped.
	const root = document.documentElement;

	if (!root.dataset.revealState) {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			// No hiding and no observer at all — the content is already visible.
			root.dataset.revealState = 'done';
		} else {
			root.classList.add('reveal-armed');

			const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
			let remaining = els.length;

			if (remaining === 0) {
				root.dataset.revealState = 'done';
			} else {
				root.dataset.revealState = 'armed';

				const observer = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (!entry.isIntersecting) continue;
							entry.target.classList.add('is-revealed');
							// Released as each element lands, not all at the end.
							observer.unobserve(entry.target);
							remaining -= 1;
						}
						if (remaining === 0) {
							// Nothing left to watch: no live observer remains.
							observer.disconnect();
							root.dataset.revealState = 'done';
						}
					},
					{ threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
				);

				els.forEach((el) => observer.observe(el));
			}
		}
	}
</script>
```

- [ ] **Step 6: Rebuild and re-run the check**

```bash
npm run build
```

Expected: `0 errors, 0 warnings`. Reload `http://localhost:4343/portfolio/` and evaluate:

```js
(async () => {
  const settle = () => new Promise(r => setTimeout(r, 400));
  await settle();
  const initial = {
    marked: document.querySelectorAll('[data-reveal]').length,
    state: document.documentElement.dataset.revealState,
    revealedAtTop: document.querySelectorAll('[data-reveal].is-revealed').length,
  };
  window.scrollTo({top: document.body.scrollHeight, behavior: 'instant'});
  await settle();
  return JSON.stringify({
    ...initial,
    revealedAtBottom: document.querySelectorAll('[data-reveal].is-revealed').length,
    finalState: document.documentElement.dataset.revealState,
  });
})()
```

Expected: `marked: 4`, `state: "armed"`, `revealedAtTop` less than 4, `revealedAtBottom: 4`,
`finalState: "done"`. `finalState` being `"done"` is the proof the observer disconnected.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "feat: reveal homepage sections on scroll"
```

---

### Task 2: SectionNode draw-in

**Files:**
- Modify: `src/components/SectionNode.astro:16-23` (the `<path>` element)
- Modify: `src/styles/global.css` (append)

**Interfaces:**
- Consumes: `[data-reveal].is-revealed` from Task 1.
- Produces: no JS surface. Purely visual.

The component is three separate pieces and each needs its own technique — only one is an SVG:

| Piece | What it is | Technique |
| --- | --- | --- |
| `.node::before` | CSS pseudo-element, 1px wide, `height: 5rem`, gradient | `transform: scaleY()` |
| `.hex path` | real stroked SVG path | `stroke-dashoffset` |
| `.rule` | `flex: 1` hairline span after the label | `transform: scaleX()` |

These rules go in `global.css`, not the component's scoped block, because they key off
`.reveal-armed` on `<html>` — Astro's scoping would not match an ancestor outside the component.

- [ ] **Step 1: Write the failing check**

Load `http://localhost:4343/portfolio/` and evaluate:

```js
(() => {
  const p = document.querySelector('.hex path');
  return JSON.stringify({ pathLength: p?.getAttribute('pathLength') ?? null });
})()
```

- [ ] **Step 2: Run it to confirm it fails**

Expected now: `{"pathLength":null}`.

- [ ] **Step 3: Normalise the path length**

In `src/components/SectionNode.astro`, change:

```astro
			<path
				d="M12 1.5 21 6.75 21 17.25 12 22.5 3 17.25 3 6.75 Z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"></path>
```

to:

```astro
			<path
				d="M12 1.5 21 6.75 21 17.25 12 22.5 3 17.25 3 6.75 Z"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linejoin="round"
				pathLength="1"></path>
```

`pathLength="1"` lets the dash values be `1` and `0` instead of the real perimeter (~62.7),
which would silently break if the hexagon geometry were ever edited.

- [ ] **Step 4: Add the draw-in rules**

Append to `src/styles/global.css`:

```css
/* --- Section node draw-in ------------------------------------------------
 * The connector sits ABOVE its node (bottom: calc(100% + 0.35rem)) and its
 * gradient runs transparent-to-solid downward, so it has to grow from the node
 * upward. transform-origin: top would animate the faded end and read as a
 * rendering fault.
 */
@media (prefers-reduced-motion: no-preference) {
	.reveal-armed [data-reveal] .node::before {
		transform: scaleY(0);
		transform-origin: bottom;
	}

	.reveal-armed [data-reveal].is-revealed .node::before {
		transform: scaleY(1);
		transition: transform 0.5s ease-out 0.05s;
	}

	.reveal-armed [data-reveal] .hex path {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
	}

	.reveal-armed [data-reveal].is-revealed .hex path {
		stroke-dashoffset: 0;
		transition: stroke-dashoffset 0.6s ease-out 0.15s;
	}

	.reveal-armed [data-reveal] .rule {
		transform: scaleX(0);
		transform-origin: left;
	}

	.reveal-armed [data-reveal].is-revealed .rule {
		transform: scaleX(1);
		transition: transform 0.6s ease-out 0.2s;
	}
}
```

- [ ] **Step 5: Rebuild and verify**

```bash
npm run build
```

Expected: `0 errors, 0 warnings`. Reload and evaluate:

```js
(async () => {
  const settle = () => new Promise(r => setTimeout(r, 400));
  const sec = document.querySelector('#timeline');
  const read = () => {
    const hex = sec.querySelector('.hex path');
    const rule = sec.querySelector('.rule');
    return {
      revealed: sec.classList.contains('is-revealed'),
      dashoffset: getComputedStyle(hex).strokeDashoffset,
      ruleTransform: getComputedStyle(rule).transform,
    };
  };
  window.scrollTo({top: 0, behavior: 'instant'});
  await settle();
  const before = read();
  sec.scrollIntoView({behavior: 'instant'});
  await new Promise(r => setTimeout(r, 1200));
  return JSON.stringify({ before, after: read() }, null, 1);
})()
```

Expected: `before.revealed` is `false` with `dashoffset` of `"1"` and a `ruleTransform` matrix
whose horizontal scale is `0` (`matrix(0, 0, 0, 1, 0, 0)`). `after.revealed` is `true`,
`dashoffset` is `"0"`, and `ruleTransform` is `"none"` or an identity matrix.

- [ ] **Step 6: Commit**

```bash
git add src/components/SectionNode.astro src/styles/global.css
git commit -m "feat: draw section nodes in as they reveal"
```

---

### Task 3: Back-to-top control

**Files:**
- Create: `src/components/ScrollTop.astro`
- Modify: `src/layouts/BaseLayout.astro:21-25`

**Interfaces:**
- Consumes: nothing from Tasks 1–2. Independent.
- Produces: `.scroll-top` button carrying `.is-visible` when the reader is past the first viewport.

- [ ] **Step 1: Write the failing check**

Load `http://localhost:4343/portfolio/work/practice-saas/` and evaluate:

```js
(() => JSON.stringify({ button: !!document.querySelector('.scroll-top') }))()
```

- [ ] **Step 2: Run it to confirm it fails**

Expected now: `{"button":false}`.

- [ ] **Step 3: Create the component**

Create `src/components/ScrollTop.astro`:

```astro
---
// Back-to-top. Visibility comes from an IntersectionObserver on a sentinel that
// spans the first viewport, so no scroll listener is added and nothing competes
// with the rAF handler in Nav.astro.
---

<span class="scroll-top-sentinel" aria-hidden="true"></span>

<button type="button" class="scroll-top" aria-label="Back to top">
	<svg viewBox="0 0 24 24" class="hex" aria-hidden="true">
		<path
			d="M12 1.5 21 6.75 21 17.25 12 22.5 3 17.25 3 6.75 Z"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linejoin="round"></path>
	</svg>
	<svg viewBox="0 0 24 24" class="arrow" aria-hidden="true">
		<path
			d="M12 16.25 12 8.25 M8.5 11.75 12 8.25 15.5 11.75"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"></path>
	</svg>
</button>

<script>
	const btn = document.querySelector<HTMLButtonElement>('.scroll-top');
	const sentinel = document.querySelector<HTMLElement>('.scroll-top-sentinel');

	if (btn && sentinel && !btn.dataset.bound) {
		btn.dataset.bound = 'true';

		// Deliberately long-lived: this is a continuous state signal — is the
		// reader past the first screen? — not a one-shot reveal. It must NOT be
		// disconnected after the first entry, unlike the reveal observer.
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry) btn.classList.toggle('is-visible', !entry.isIntersecting);
			},
			{ threshold: 0 },
		);
		observer.observe(sentinel);

		btn.addEventListener('click', () => {
			// scrollTo's `behavior` overrides the CSS scroll-behavior rule, so the
			// preference has to be read here rather than relied on.
			const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
			scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });

			// Move focus with the viewport. Leaving it on a button at the bottom
			// means the reader's next Tab returns them to where they just left.
			const target = document.querySelector<HTMLElement>('h1');
			if (target) {
				target.setAttribute('tabindex', '-1');
				target.focus({ preventScroll: true });
			}
		});
	}
</script>

<style>
	/* Spans the first viewport. Absolute, so it is out of flow and cannot affect
	   layout; .sheet is position: relative, so top: 0 is the top of the page. */
	.scroll-top-sentinel {
		position: absolute;
		top: 0;
		left: 0;
		width: 1px;
		height: 100vh;
		pointer-events: none;
	}

	.scroll-top {
		position: fixed;
		right: max(1.25rem, env(safe-area-inset-right));
		bottom: max(1.25rem, env(safe-area-inset-bottom));
		/* Below the nav's 9999, above page content. */
		z-index: 40;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border: 0;
		background: color-mix(in srgb, var(--gray-999) 82%, transparent);
		backdrop-filter: blur(10px);
		color: var(--accent-regular);
		cursor: pointer;

		/* visibility rather than the [hidden] attribute: it removes the control
		   from the tab order AND still participates in transitions, so the fade
		   needs no JS timing to coordinate. */
		visibility: hidden;
		opacity: 0;
		pointer-events: none;
	}

	.scroll-top.is-visible {
		visibility: visible;
		opacity: 1;
		pointer-events: auto;
	}

	.scroll-top:hover,
	.scroll-top:focus-visible {
		color: var(--gray-100);
	}

	.scroll-top:focus-visible {
		outline: 1px solid var(--accent-regular);
		outline-offset: 3px;
	}

	.hex,
	.arrow {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	@media (prefers-reduced-motion: no-preference) {
		.scroll-top {
			transition: opacity 0.25s ease-out, visibility 0.25s, color var(--transition-fast);
		}
	}
</style>
```

- [ ] **Step 4: Render it site-wide**

In `src/layouts/BaseLayout.astro`, add the import to the frontmatter after the `Footer` import:

```astro
import ScrollTop from '../components/ScrollTop.astro';
```

and render it inside `.stack.sheet` so it shares that stacking context, changing:

```astro
		<div class="stack sheet">
			<Nav />
			<slot />
			<Footer />
		</div>
```

to:

```astro
		<div class="stack sheet">
			<Nav />
			<slot />
			<Footer />
			<ScrollTop />
		</div>
```

- [ ] **Step 5: Rebuild and verify**

```bash
npm run build
```

Expected: `0 errors, 0 warnings`. Load `http://localhost:4343/portfolio/work/practice-saas/`
and evaluate:

```js
(async () => {
  const settle = () => new Promise(r => setTimeout(r, 400));
  const btn = document.querySelector('.scroll-top');
  const vis = () => getComputedStyle(btn).visibility;
  window.scrollTo({top: 0, behavior: 'instant'});
  await settle();
  const atTop = vis();
  window.scrollTo({top: innerHeight * 2, behavior: 'instant'});
  await settle();
  const scrolled = vis();
  btn.click();
  await new Promise(r => setTimeout(r, 1200));
  return JSON.stringify({
    atTop, scrolled,
    afterClickScrollY: Math.round(scrollY),
    focused: document.activeElement?.tagName,
  });
})()
```

Expected: `atTop: "hidden"`, `scrolled: "visible"`, `afterClickScrollY: 0`, `focused: "H1"`.
`atTop` being `hidden` is what keeps the control out of the tab order.

- [ ] **Step 6: Commit**

```bash
git add src/components/ScrollTop.astro src/layouts/BaseLayout.astro
git commit -m "feat: back-to-top control, shown once past the first screen"
```

---

### Task 4: Cross-cutting verification

**Files:**
- Modify: none unless a check fails.

**Interfaces:**
- Consumes: everything from Tasks 1–3.
- Produces: nothing.

- [ ] **Step 1: Reduced motion — no hiding, no observer**

In Playwright, emulate `prefers-reduced-motion: reduce`, load
`http://localhost:4343/portfolio/`, and evaluate:

```js
(() => {
  const secs = [...document.querySelectorAll('[data-reveal]')];
  return JSON.stringify({
    state: document.documentElement.dataset.revealState,
    armed: document.documentElement.classList.contains('reveal-armed'),
    opacities: secs.map(s => getComputedStyle(s).opacity),
  });
})()
```

Expected: `state: "done"`, `armed: false`, every opacity `"1"`. No element was hidden and
no observer was created.

- [ ] **Step 2: Scripting off — content still visible**

In Playwright, disable JavaScript, load `http://localhost:4343/portfolio/`, and confirm the
section headings are present in the rendered text (`Selected work`, `Career`, `Skills`,
`Languages`). Nothing may be hidden, because `.reveal-armed` is never added.

- [ ] **Step 3: Nav scroll-spy regression**

The reveal work sits beside the handler fixed in `f16de6e`. Load
`http://localhost:4343/portfolio/` and evaluate:

```js
(async () => {
  const read = () => [...document.querySelectorAll('.link')]
    .filter(a => a.classList.contains('active')).map(a => a.textContent.trim());
  const settle = () => new Promise(r => setTimeout(r, 400));
  const out = {};
  window.scrollTo({top: 0, behavior: 'instant'}); await settle(); out.top = read();
  document.querySelector('#timeline').scrollIntoView({behavior:'instant'}); await settle(); out.timeline = read();
  document.querySelector('#skills').scrollIntoView({behavior:'instant'}); await settle(); out.skills = read();
  window.scrollTo({top: 0, behavior: 'instant'}); await settle(); out.backToTop = read();
  return JSON.stringify(out);
})()
```

Expected: exactly one entry in every array — `["Home"]`, `["Career"]`, `["Skills"]`, `["Home"]`.

- [ ] **Step 4: Project page has no reveals**

Load `http://localhost:4343/portfolio/work/practice-saas/` and evaluate:

```js
(() => JSON.stringify({
  marked: document.querySelectorAll('[data-reveal]').length,
  armed: document.documentElement.classList.contains('reveal-armed'),
  button: !!document.querySelector('.scroll-top'),
}))()
```

Expected: `marked: 0`, `armed: false`, `button: true`. Reveals are homepage-only; the button
is site-wide.

- [ ] **Step 5: Full build**

```bash
npm run build
```

Expected: `0 errors, 0 warnings` and `19 page(s) built`.

- [ ] **Step 6: Commit any fixes**

Only if a step above required a change:

```bash
git add -A
git commit -m "fix: address scroll motion verification findings"
```
