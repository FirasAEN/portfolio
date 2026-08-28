import { test, expect, type Page } from '@playwright/test';

const ROUTES = ['/', '/work', '/work/keycloak', '/404'];

/**
 * WCAG contrast for every text sample, against the background it is actually
 * composited over — the ambient layer at its most saturated point, not the flat
 * ground. Measuring against the flat ground overstates every ratio by ~0.3,
 * which is the difference between passing and failing at the margin.
 */
async function contrastReport(page: Page) {
	return page.evaluate(() => {
		const parse = (s: string) => {
			let m = /^color\(srgb\s+([-\d.eE]+)\s+([-\d.eE]+)\s+([-\d.eE]+)(?:\s*\/\s*([-\d.eE]+))?\)$/.exec(
				s.trim(),
			);
			if (m) return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] === undefined ? 1 : +m[4] };
			m = /^rgba?\(([^)]+)\)$/.exec(s.trim());
			if (m) {
				const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
				return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] };
			}
			return null;
		};
		const toLin = (c: number) => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		};
		const lum = (c: { r: number; g: number; b: number }) =>
			0.2126 * toLin(c.r) + 0.7152 * toLin(c.g) + 0.0722 * toLin(c.b);
		const mix = (f: any, b: any, a: number) => ({
			r: f.r * a + b.r * (1 - a),
			g: f.g * a + b.g * (1 - a),
			b: f.b * a + b.b * (1 - a),
		});
		const ratio = (f: any, b: any) => {
			const [hi, lo] = [lum(f), lum(b)].sort((x, y) => y - x);
			return (hi + 0.05) / (lo + 0.05);
		};

		const probe = document.createElement('span');
		document.body.appendChild(probe);
		const resolve = (v: string) => {
			probe.style.color = '';
			probe.style.color = v;
			return parse(getComputedStyle(probe).color)!;
		};

		const rs = getComputedStyle(document.documentElement);
		const ground = resolve(rs.getPropertyValue('--gray-999').trim());
		const accent = resolve(rs.getPropertyValue('--accent-regular').trim());
		const ambient = parseFloat(rs.getPropertyValue('--ambient-opacity')) || 0;
		const worst = mix(accent, ground, ambient);

		const failures: { text: string; px: number; ratio: number }[] = [];
		const seen = new Set<string>();

		for (const el of document.querySelectorAll<HTMLElement>('p, li, a, h1, h2, h3, h4, dt, dd, span')) {
			const text = (el.textContent || '').trim();
			if (!text || el.children.length > 0) continue; // leaf text nodes only
			const cs = getComputedStyle(el);
			if (cs.visibility === 'hidden' || cs.display === 'none') continue;
			if (el.getBoundingClientRect().width === 0) continue;
			const fg = parse(cs.color);
			if (!fg || fg.a === 0) continue; // background-clip: text paints via a gradient

			const px = parseFloat(cs.fontSize);
			const bold = +cs.fontWeight >= 700;
			const need = px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5;
			const r = ratio(mix(fg, worst, fg.a), worst);

			const key = `${cs.color}|${px}`;
			if (seen.has(key)) continue;
			seen.add(key);

			if (r < need) failures.push({ text: text.slice(0, 40), px, ratio: +r.toFixed(2) });
		}
		probe.remove();
		return failures;
	});
}

for (const theme of ['light', 'dark'] as const) {
	test(`every text sample clears WCAG AA in the ${theme} theme`, async ({ page }) => {
		/*
		 * The theme is set before the page loads, not toggled afterwards.
		 * MainHead's inline script reads localStorage and applies the class
		 * before first paint, so this renders natively in the target theme —
		 * which is what a visitor gets. Toggling the class mid-flight produced
		 * nonsense: nav links measured 1.34 when they are actually 15.75.
		 */
		await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
		await page.goto('/');
		await page.waitForFunction(
			(t) => document.documentElement.classList.contains('theme-dark') === (t === 'dark'),
			theme,
		);

		const failures = await contrastReport(page);
		expect(failures, JSON.stringify(failures, null, 1)).toEqual([]);
	});
}

for (const route of ROUTES) {
	test(`${route} has exactly one main landmark`, async ({ page }) => {
		await page.goto(route);
		await expect(page.locator('main')).toHaveCount(1);
	});
}

test('the skip link is first in the tab order and moves focus to main', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');

	const focused = await page.evaluate(() => document.activeElement?.className);
	expect(focused).toContain('skip-link');

	// Hidden by transform, not display/visibility — those would remove it from
	// the tab order, which is the one thing it exists to be in.
	const box = await page.locator('.skip-link').boundingBox();
	expect(box!.y).toBeGreaterThanOrEqual(0);

	await page.keyboard.press('Enter');
	const moved = await page.evaluate(() => document.activeElement?.id);
	expect(moved).toBe('main');
});

test('the document outline has no skipped heading levels', async ({ page }) => {
	await page.goto('/');
	const levels = await page.evaluate(() =>
		[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]),
	);
	expect(levels[0]).toBe(1);
	for (let i = 1; i < levels.length; i++) {
		expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
	}
});
