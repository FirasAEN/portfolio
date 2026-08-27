/**
 * Background image URLs, resolved through Vite.
 *
 * These live in `src/assets` rather than `public/` on purpose. CSS `url()` is
 * resolved relative to the *stylesheet*, not to the document or its `<base>`
 * tag — so a bare `url('assets/…')` inside a scoped `<style>` breaks the moment
 * Astro extracts that CSS to `/_astro/…`, which is exactly what shipped to
 * production. Importing the files instead lets Vite emit absolute, base-aware,
 * content-hashed URLs that resolve from anywhere.
 *
 * `.svg` needs the explicit `?url` suffix: a bare SVG import returns a
 * component in Astro 5+, not an `ImageMetadata` object.
 */
import noise from '../assets/backgrounds/noise.png';

import mainLight800 from '../assets/backgrounds/bg-main-light-800w.jpg';
import mainLight1440 from '../assets/backgrounds/bg-main-light-1440w.jpg';
import mainDark800 from '../assets/backgrounds/bg-main-dark-800w.jpg';
import mainDark1440 from '../assets/backgrounds/bg-main-dark-1440w.jpg';

import curvesLight from '../assets/backgrounds/bg-main-light.svg?url';
import curvesDark from '../assets/backgrounds/bg-main-dark.svg?url';

import subtle1Light800 from '../assets/backgrounds/bg-subtle-1-light-800w.jpg';
import subtle1Light1440 from '../assets/backgrounds/bg-subtle-1-light-1440w.jpg';
import subtle1Dark800 from '../assets/backgrounds/bg-subtle-1-dark-800w.jpg';
import subtle1Dark1440 from '../assets/backgrounds/bg-subtle-1-dark-1440w.jpg';

import subtle2Light800 from '../assets/backgrounds/bg-subtle-2-light-800w.jpg';
import subtle2Light1440 from '../assets/backgrounds/bg-subtle-2-light-1440w.jpg';
import subtle2Dark800 from '../assets/backgrounds/bg-subtle-2-dark-800w.jpg';
import subtle2Dark1440 from '../assets/backgrounds/bg-subtle-2-dark-1440w.jpg';

import footerLight800 from '../assets/backgrounds/bg-footer-light-800w.jpg';
import footerLight1440 from '../assets/backgrounds/bg-footer-light-1440w.jpg';
import footerDark800 from '../assets/backgrounds/bg-footer-dark-800w.jpg';
import footerDark1440 from '../assets/backgrounds/bg-footer-dark-1440w.jpg';

/** Noise texture URL, exposed for the pages that layer it themselves. */
export const noiseUrl = noise.src;

/** `background-image` triplet for the lazily-loaded below-the-fold layers. */
function belowTheFold(subtle1: string, subtle2: string, footer: string): string {
	return `
		--bg-image-subtle-1: url(${subtle1});
		--bg-image-subtle-2: url(${subtle2});
		--bg-image-footer: url(${footer});
	`;
}

/**
 * Every `--bg-*` custom property, as a stylesheet.
 *
 * Rendered via `<style is:inline>` so it is never extracted, and so it owns
 * these variables outright — no specificity interplay with the scoped styles
 * that consume them.
 */
export const backgroundVarsCss = `
	:root {
		--_placeholder-bg: linear-gradient(transparent, transparent);
		--bg-image-noise: url(${noise.src});
		--bg-image-main: url(${mainLight800.src});
		--bg-image-main-curves: url(${curvesLight});
		--bg-image-subtle-1: var(--_placeholder-bg);
		--bg-image-subtle-2: var(--_placeholder-bg);
		--bg-image-footer: var(--_placeholder-bg);
		--bg-svg-blend-mode: overlay;
		--bg-blend-mode: darken;
		--bg-image-aspect-ratio: 2.25;
		--bg-scale: 1.68;
		--bg-aspect-ratio: calc(var(--bg-image-aspect-ratio) / var(--bg-scale));
		--bg-gradient-size: calc(var(--bg-scale) * 100%);
	}

	:root.theme-dark {
		--bg-image-main: url(${mainDark800.src});
		--bg-image-main-curves: url(${curvesDark});
		--bg-svg-blend-mode: darken;
		--bg-blend-mode: lighten;
	}

	/* Below the fold, so loaded only once the document has finished loading. */
	:root.loaded {${belowTheFold(subtle1Light800.src, subtle2Light800.src, footerLight800.src)}}
	:root.loaded.theme-dark {${belowTheFold(subtle1Dark800.src, subtle2Dark800.src, footerDark800.src)}}

	@media (min-width: 50em) {
		:root {
			--bg-scale: 1;
			--bg-image-main: url(${mainLight1440.src});
		}
		:root.theme-dark {
			--bg-image-main: url(${mainDark1440.src});
		}
		:root.loaded {${belowTheFold(subtle1Light1440.src, subtle2Light1440.src, footerLight1440.src)}}
		:root.loaded.theme-dark {${belowTheFold(subtle1Dark1440.src, subtle2Dark1440.src, footerDark1440.src)}}
	}
`;
