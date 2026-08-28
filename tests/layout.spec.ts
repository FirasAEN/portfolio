import { test, expect } from '@playwright/test';

/*
 * The geometric invariants.
 *
 * Every number in this file was arrived at by measuring a defect and fixing it,
 * and each was previously protected by nothing at all. The marker gutter in
 * particular has broken twice: once when a connector read a custom property
 * declared on its own child (16px out), and once when the marker and the
 * timeline spine were positioned from two independent sums (8px out). Both were
 * invisible in review and obvious in a measurement.
 */

const DESKTOP = { width: 1280, height: 900 };

test.describe('spine alignment', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(DESKTOP);
		await page.goto('/');
	});

	test('the line, every section marker and every timeline marker share one x', async ({
		page,
	}) => {
		// Scroll the page so the spine is drawn its full length before measuring.
		await page.evaluate(async () => {
			for (let y = 0; y <= document.body.scrollHeight; y += 700) {
				window.scrollTo({ top: y, behavior: 'instant' });
				await new Promise((r) => setTimeout(r, 60));
			}
		});
		await page.waitForTimeout(500);

		const xs = await page.evaluate(() => {
			const cx = (el: Element) => {
				const r = el.getBoundingClientRect();
				return +((r.left + r.right) / 2).toFixed(1);
			};
			return {
				line: cx(document.querySelector('.spine-line')!),
				markers: [...document.querySelectorAll('.node .marker, .entry-marker')].map(cx),
			};
		});

		expect(xs.markers.length).toBeGreaterThanOrEqual(9);
		for (const x of xs.markers) expect(x).toBe(xs.line);
	});

	test('the spine is masked open at every marker and nowhere else', async ({ page }) => {
		// Wait for the reveal to finish before measuring. Unrevealed sections carry
		// a translateY(8px), so their markers sit 8px off the mask the controller
		// computed — the controller re-measures on reveal-done for the same reason.
		await page.evaluate(async () => {
			for (let y = 0; y <= document.body.scrollHeight; y += 600) {
				window.scrollTo({ top: y, behavior: 'instant' });
				await new Promise((r) => setTimeout(r, 60));
			}
		});
		await page.waitForFunction(() => document.documentElement.dataset.revealState === 'done');
		await page.waitForTimeout(400);

		const { markers, holes } = await page.evaluate(() => {
			const line = document.querySelector('.spine-line') as HTMLElement;
			const rail = getComputedStyle(document.querySelector('.spine-rail')!);
			const top = parseFloat(rail.getPropertyValue('--spine-top'));
			const spineY = document.querySelector('.spine')!.getBoundingClientRect().top + scrollY;
			const markers = [...document.querySelectorAll('.node .marker, .entry-marker')].map((m) => {
				const r = m.getBoundingClientRect();
				return { offset: +(r.top + scrollY - spineY - top).toFixed(1), size: +r.height.toFixed(1) };
			});
			const stops = [...getComputedStyle(line).maskImage.matchAll(/(rgba?)\([^)]*\)\s+(-?[\d.]+)px/g)].map(
				(m) => ({ open: m[1] === 'rgba', at: +(+m[2]).toFixed(1) }),
			);
			const holes: number[][] = [];
			for (let i = 0; i < stops.length - 1; i++) {
				if (stops[i].open && stops[i + 1].open) holes.push([stops[i].at, stops[i + 1].at]);
			}
			return { markers, holes };
		});

		expect(holes.length).toBe(markers.length);

		/*
		 * Asserted as a property, not as arithmetic: every marker must fall
		 * inside some hole, and no hole may be wildly bigger than its marker.
		 *
		 * Pairing hole[i] to marker[i] and checking for exactly 2px of clearance
		 * was brittle — the controller computes the mask when it last measured,
		 * the test measures now, and a pixel of drift between the two says
		 * nothing about whether the line crosses a marker. This does.
		 */
		const uncovered = markers.filter(
			(m) => !holes.some(([from, to]) => from <= m.offset && to >= m.offset + m.size),
		);
		expect(uncovered, `markers the mask does not open for: ${JSON.stringify(uncovered)}`).toEqual(
			[],
		);

		const oversized = holes.filter(([from, to], i) => to - from > markers[i].size + 8);
		expect(oversized, 'a hole much larger than its marker leaves a visible gap').toEqual([]);
	});
});

test('hero columns are the same height and start on the same line', async ({ page }) => {
	await page.setViewportSize(DESKTOP);
	await page.goto('/');

	const { introH, availH, sameTop } = await page.evaluate(() => {
		const intro = document.querySelector('.hero-intro')!.getBoundingClientRect();
		const avail = document.querySelector('.availability')!.getBoundingClientRect();
		return {
			introH: +intro.height.toFixed(1),
			availH: +avail.height.toFixed(1),
			sameTop: intro.top === avail.top,
		};
	});

	// The left column used to be a single 19.8px meta line beside an 85px block,
	// leaving 66px of dead space and pushing the name 114px down the page.
	expect(introH).toBe(availH);
	expect(sameTop).toBe(true);
});

test('the name stays on one line down to the two-column breakpoint', async ({ page }) => {
	// 960 is just above the 60em breakpoint, where the columns are tightest.
	await page.setViewportSize({ width: 960, height: 900 });
	await page.goto('/');
	const lines = await page.evaluate(
		() => document.querySelector('.hero h1')!.getClientRects().length,
	);
	expect(lines).toBe(1);
});

for (const width of [1440, 1280, 960, 820, 768, 375]) {
	test(`no horizontal overflow at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/');
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth,
		);
		expect(overflow).toBe(0);
	});
}
