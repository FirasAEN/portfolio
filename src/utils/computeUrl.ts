/**
 * Base URL, normalised to exactly one leading and one trailing slash
 * (`/portfolio/` in production, `/` in dev).
 */
const BASE = `/${import.meta.env.BASE_URL}/`.replace(/\/{2,}/g, '/');

/**
 * Build a root-relative URL that respects the configured `base`.
 *
 * This is the single mechanism for base-path handling — the `<base>` tag was
 * removed because it silently rewrites every relative URL on the page and
 * cannot affect external stylesheets, which is where it mattered most.
 *
 * Trailing slashes are stripped so links are consistent across call sites
 * (`trailingSlash: 'ignore'` means the server accepts either form).
 */
export function computeUrl(link: string): string {
	const path = link.replace(/^\/+/, '').replace(/\/+$/, '');
	return path ? `${BASE}${path}` : BASE;
}
