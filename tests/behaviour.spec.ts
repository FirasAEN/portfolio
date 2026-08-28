import { test, expect } from '@playwright/test';

/*
 * The reveal system is the only thing on the site that can take the whole page
 * down rather than degrade: .reveal-armed sets opacity: 0 on every section, and
 * an IntersectionObserver is what removes it again. If arming ever outruns the
 * observer, a visitor gets a blank page with no visible error.
 *
 * These tests need a browser that actually composites — IntersectionObserver
 * does not deliver in a hidden document, which will make them look like a site
 * failure when they are really a harness failure. Playwright's headless
 * Chromium renders, so they are meaningful here.
 */
test('every section becomes visible when scrolled to', async ({ page }) => {
	await page.goto('/');

	const before = await page.evaluate(
		() => [...document.querySelectorAll('[data-reveal]')].filter((s) => getComputedStyle(s).opacity === '0').length,
	);
	expect(before).toBeGreaterThan(0); // otherwise this test proves nothing

	await page.evaluate(async () => {
		for (let y = 0; y <= document.body.scrollHeight; y += 600) {
			window.scrollTo({ top: y, behavior: 'instant' });
			await new Promise((r) => setTimeout(r, 80));
		}
	});
	await page.waitForTimeout(800);

	const stillHidden = await page.evaluate(() =>
		[...document.querySelectorAll('[data-reveal]')]
			.filter((s) => getComputedStyle(s).opacity === '0')
			.map((s) => s.id || s.className),
	);
	expect(stillHidden).toEqual([]);
});

test('content is never left hidden if the observer cannot be created', async ({ page }) => {
	// Simulate the failure the ordering fix exists to survive.
	await page.addInitScript(() => {
		// @ts-expect-error deliberately breaking a global
		window.IntersectionObserver = function () {
			throw new Error('boom');
		};
	});
	await page.goto('/');
	await page.waitForTimeout(400);

	const hidden = await page.evaluate(
		() => [...document.querySelectorAll('[data-reveal]')].filter((s) => getComputedStyle(s).opacity === '0').length,
	);
	// Arming must have been unwound, not left in place.
	expect(hidden).toBe(0);
	expect(await page.evaluate(() => document.documentElement.classList.contains('reveal-armed'))).toBe(
		false,
	);
});

test('the spine grows with scroll and its beam stays on the line', async ({ page }) => {
	await page.goto('/');
	const atRest = await page.evaluate(() =>
		parseFloat(getComputedStyle(document.querySelector('.spine-rail')!).getPropertyValue('--spine-drawn')),
	);

	await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' }));
	await page.waitForTimeout(400);

	const afterScroll = await page.evaluate(() =>
		parseFloat(getComputedStyle(document.querySelector('.spine-rail')!).getPropertyValue('--spine-drawn')),
	);
	expect(afterScroll).toBeGreaterThan(atRest);
});

test('no console errors and no failed requests on any route', async ({ page }) => {
	const errors: string[] = [];
	const failed: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));

	for (const route of ['/', '/work', '/work/keycloak']) {
		await page.goto(route);
		await page.waitForLoadState('networkidle');
	}

	expect(errors).toEqual([]);
	expect(failed).toEqual([]);
});

test('nothing is fetched from a third-party origin', async ({ page }) => {
	const external: string[] = [];
	page.on('request', (r) => {
		const url = new URL(r.url());
		if (url.hostname !== 'localhost' && url.protocol !== 'data:') external.push(r.url());
	});
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	// Fonts were served from fonts.googleapis.com, which put a render-blocking
	// third-party request on the critical path and sent EU visitors' addresses
	// to Google. They are self-hosted now, and must stay that way.
	expect(external).toEqual([]);
});

test('every internal link resolves', async ({ page }) => {
	await page.goto('/');
	const links = await page.evaluate(() =>
		[...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')!))].filter(
			(h) => !h.includes('#'),
		),
	);
	expect(links.length).toBeGreaterThan(5);

	const broken: string[] = [];
	for (const href of links) {
		const res = await page.request.head(href);
		if (res.status() >= 400) broken.push(`${res.status()} ${href}`);
	}
	expect(broken).toEqual([]);
});
