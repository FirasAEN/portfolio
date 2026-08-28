import type { iconPaths } from '../components/IconPaths';

/**
 * Site identity — one source of truth.
 *
 * The name previously appeared verbatim in eleven places across nav, footer,
 * page titles and meta descriptions, which is the same drift risk the hardcoded
 * company lists had. Socials were duplicated between Nav and Footer.
 */
export const site = {
	/** Full name, used everywhere — nav, hero, titles, footer. */
	name: 'Firas François Abed El Nabi',
	/** Duplicate of `name`, kept so callers reading `fullName` still resolve. */
	fullName: 'Firas François Abed El Nabi',
	/**
	 * The short form used on the CV, the email address and the LinkedIn handle.
	 * Stated on the page so a reader matching this site against either one is not
	 * met by two unconnected names.
	 */
	alias: 'François AEN',
	role: 'Tech Lead & Full-Stack Engineer',
	location: 'Grenoble, France',
	email: 'francois.aen@gmail.com',
	description:
		'Tech Lead and full-stack engineer in Grenoble. PhD in computational material science turned software engineer — Java/Spring, Angular, and DDD/Hexagonal architecture.',

	/**
	 * Availability signal. Set `open: false` to hide it entirely — a stale
	 * "available" badge is worse than none.
	 */
	availability: {
		open: true,
		label: 'Open to Tech Lead & senior engineering roles',
	},

	/**
	 * Downloadable CV. Set `href` to a file in `public/` to show the button.
	 * Left empty until the published PDF is decided — see the note in README.
	 */
	cv: {
		href: '/cv/firas-abed-el-nabi-cv.pdf',
		label: 'Download CV',
	},
} as const;

/** Page title in the browser tab: "Work | Firas François". */
export function pageTitle(section?: string): string {
	return section ? `${section} | ${site.name}` : `${site.name} — ${site.role}`;
}

export const socials: { label: string; href: string; icon: keyof typeof iconPaths }[] = [
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/françois-aen-phd-86b565109',
		icon: 'linkedin-logo',
	},
	{ label: 'GitHub', href: 'https://github.com/FirasAEN', icon: 'github-logo' },
	{ label: 'GitLab', href: 'https://gitlab.com/FirasAEN/nextjs-portfolio', icon: 'gitlab-logo' },
];
