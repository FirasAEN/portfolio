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

		/*
		 * One sparse grid rather than a minor/major pair. A 28px mesh with a
		 * heavier line every fifth cell reads as texture at a glance and as
		 * noise once you try to read over it; at 72px and a third of the
		 * contrast it sits behind the page instead of competing with it.
		 */
		--grid-line: color-mix(in srgb, var(--gray-100) 5%, transparent);
		--grid-size: 72px;
	}

	:root.theme-dark {
		--grid-line: color-mix(in srgb, var(--gray-100) 6%, transparent);
	}
`;
