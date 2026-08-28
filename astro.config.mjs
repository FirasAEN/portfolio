import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const isDev = import.meta.env.DEV;

/*
 * Two deploy targets from one source.
 *
 * A static site bakes its origin into every page at BUILD time — canonical, the
 * og: tags, the sitemap, the JSON-LD — so the host cannot be a runtime env var
 * the way it is for the other apps on the VPS. It has to be chosen here.
 *
 * `vps` is the real home; `pages` is the GitHub mirror, which serves from a
 * /portfolio subpath. Canonical points at the VPS in BOTH builds (see
 * src/config/deploy.ts), so the mirror consolidates into it rather than
 * competing with it for the same content.
 */
const TARGETS = {
	vps: { site: 'https://firas-aen.portfolio.cyberonix.dev', base: '/' },
	pages: { site: 'https://firasaen.github.io', base: '/portfolio' },
};

const target = process.env.DEPLOY_TARGET ?? 'vps';

// Throws rather than falling back: a typo here would silently bake the wrong
// host into every canonical, sitemap entry and share card on the site.
if (!TARGETS[target]) {
	throw new Error(
		`Unknown DEPLOY_TARGET "${target}". Expected one of: ${Object.keys(TARGETS).join(', ')}`,
	);
}

const { site, base: targetBase } = TARGETS[target];
const base = isDev ? '/' : targetBase;

// https://astro.build/config
export default defineConfig({
	site,
	base,
	/*
	 * Astro 7 changed this default to 'jsx', which strips whitespace between
	 * inline elements. Measured on this site: the nav's social links render 8px
	 * narrower and shift left, and the document is 15px shorter — their spacing
	 * came from those whitespace text nodes, not from a flex gap (the parent is
	 * display:block, gap:normal).
	 *
	 * `true` is the v6 behaviour. Kept deliberately rather than re-spacing the
	 * nav, because the compression only saves ~15px of markup here and the
	 * failure mode is silent.
	 */
	compressHTML: true,
	trailingSlash: 'ignore', // Use to always append '/' at end of url
	// 404 is a real route but not a page anyone should be sent to from search.
	integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
	// Timeline and About are now sections of the homepage narrative; the old
	// routes still resolve so existing links and bookmarks keep working.
	// Redirect targets are not base-prefixed automatically, so build them from
	// the same `base` value the rest of the site uses.
	redirects: {
		'/about': `${base.replace(/\/$/, '')}/#about`,
		'/timeline': `${base.replace(/\/$/, '')}/#timeline`,
	},
});
