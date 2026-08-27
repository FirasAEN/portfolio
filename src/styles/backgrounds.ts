/**
 * Page ground: a drafting grid.
 *
 * This replaces the starter's decorative gradient washes (18 JPEG/SVG layers at
 * two breakpoints and two themes). The grid is drawn in CSS — nothing to load,
 * nothing to 404, and it scales to any viewport.
 *
 * The motif is not arbitrary. The work on this site is node-and-edge schematics
 * of data lineage, dependency graphs and task orchestration, so the page reads
 * as the sheet those drawings sit on.
 */
import noise from '../assets/backgrounds/noise.png';

/** Noise texture URL, layered over panels so surfaces read as material. */
export const noiseUrl = noise.src;

export const backgroundVarsCss = `
	:root {
		--bg-image-noise: url(${noise.src});

		/* Drafting grid: 1px hairlines, a heavier line every 5th cell. */
		--grid-line: color-mix(in srgb, var(--gray-100) 8%, transparent);
		--grid-line-major: color-mix(in srgb, var(--gray-100) 13%, transparent);
		--grid-size: 28px;
	}

	:root.theme-dark {
		--grid-line: color-mix(in srgb, var(--gray-100) 9%, transparent);
		--grid-line-major: color-mix(in srgb, var(--gray-100) 15%, transparent);
	}
`;
