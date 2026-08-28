/**
 * Page ground: an ambient drift.
 *
 * This replaced a drafting grid, which in turn replaced the starter's 18 JPEG
 * and SVG gradient layers. The grid was fixed to the viewport while content
 * scrolled, so the page's own hairlines — section rules, the timeline spine,
 * the node connectors — drifted in and out of near-coincidence with grid lines
 * as you moved. Measured: one section rule passed 4.1px, 5.9px, 15.9px and
 * 31.9px from the nearest grid line across 36px of scroll. Too far apart to
 * read as one line, too close to read as two.
 *
 * Nothing here is drawn as a line, so there is nothing left to collide.
 */
import noise from '../assets/backgrounds/noise.png';

/** Noise texture URL, layered over panels so surfaces read as material. */
export const noiseUrl = noise.src;

export const backgroundVarsCss = `
	:root {
		--bg-image-noise: url(${noise.src});

		/*
		 * The two grounds are not symmetric, so they do not share a value. On
		 * near-black the accent reads as a faint glow; the same figure on
		 * near-white reads as a smudge. Both were settled by measuring body-text
		 * contrast over the shapes, not by eye.
		 */
		--ambient-opacity: 0.07;

		/* Native UI follows the theme: without this the browser paints a light
		   scrollbar over the dark ground, which is the tell that a site only
		   *looks* dark. */
		color-scheme: light;
		--scrollbar-thumb: color-mix(in srgb, var(--gray-100) 24%, transparent);
	}

	:root.theme-dark {
		--ambient-opacity: 0.12;
		color-scheme: dark;
		--scrollbar-thumb: color-mix(in srgb, var(--gray-100) 22%, transparent);
	}
`;
