/**
 * Where the site canonically lives.
 *
 * The same source builds for two hosts — the VPS and the GitHub Pages mirror —
 * and two hosts serving identical content compete with each other in search
 * unless one of them is declared the original. Both builds therefore emit the
 * VPS URL as canonical, so the mirror consolidates into it.
 *
 * Deliberately NOT derived from `Astro.site`: that is the host currently being
 * built for, which is exactly the value we must not use here.
 */
export const canonicalOrigin = 'https://firas-aen.portfolio.cyberonix.dev';

/**
 * The canonical URL for a page, given the pathname of the current build.
 *
 * The Pages build serves from `/portfolio`, so its pathnames carry that prefix
 * while the canonical host serves from the root. Stripping BASE_URL is what
 * makes one function correct for both targets.
 */
export function canonicalUrl(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
	const path = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	return new URL(path || '/', canonicalOrigin).href;
}
