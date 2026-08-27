import type { iconPaths } from '../components/IconPaths';

/**
 * Site identity — one source of truth.
 *
 * The name previously appeared verbatim in eleven places across nav, footer,
 * page titles and meta descriptions, which is the same drift risk the hardcoded
 * company lists had. Socials were duplicated between Nav and Footer.
 */
export const site = {
	/** Display name used in the nav, footer and titles. */
	name: 'Firas François',
	/** Full legal name, for the copyright line and structured metadata. */
	fullName: 'Firas François Abed El Nabi',
	role: 'Tech Lead & Full-Stack Engineer',
	location: 'Grenoble, France',
	email: 'francois.aen@gmail.com',
	description:
		'Tech Lead and full-stack engineer in Grenoble. PhD in computational material science turned software engineer — Java/Spring, Angular, and DDD/Hexagonal architecture.',
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
