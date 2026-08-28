import type { APIRoute } from 'astro';
import { computeUrl } from '../utils/computeUrl';

/*
 * A route, not a file in public/.
 *
 * The Sitemap line has to name the host currently being built for, and a static
 * file can only hardcode one — it named the GitHub host even in the VPS build.
 */
export const GET: APIRoute = ({ site }) => {
	// computeUrl, not a bare join: `site` is the ORIGIN only, so on the Pages
	// target this has to pick up the /portfolio base as well or it advertises a
	// sitemap that 404s.
	const sitemap = new URL(computeUrl('/sitemap-index.xml'), site).href;

	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
