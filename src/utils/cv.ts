import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;
export type ExperienceEntry = CollectionEntry<'experience'>;

/** Most recent first; a null `end` means current and sorts to the top. */
function byRecency(a: ExperienceEntry, b: ExperienceEntry): number {
	const aEnd = a.data.end?.valueOf() ?? Infinity;
	const bEnd = b.data.end?.valueOf() ?? Infinity;
	return bEnd - aEnd || b.data.start.valueOf() - a.data.start.valueOf();
}

/** Career history, most recent first. */
export async function getExperience(): Promise<ExperienceEntry[]> {
	return (await getCollection('experience')).sort(byRecency);
}

/**
 * Company identity, keyed by the id that `work` entries reference.
 *
 * This replaces the label and colour maps that were previously duplicated
 * across the work page, the preview card, and the timeline — three copies that
 * had already drifted apart.
 */
export async function getCompanyLookup(): Promise<Map<string, { label: string; accent: string }>> {
	const experience = await getCollection('experience');
	return new Map(
		experience.map((e) => [e.id, { label: e.data.short ?? e.data.company, accent: e.data.accent }]),
	);
}

/** All work, newest first. */
export async function getWork(): Promise<WorkEntry[]> {
	return (await getCollection('work')).sort(
		(a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
	);
}

/** Work belonging to one company, newest first. */
export async function getWorkForCompany(companyId: string): Promise<WorkEntry[]> {
	return (await getWork()).filter((w) => w.data.company === companyId);
}

/**
 * Homepage selection, driven by the `featured` flag on each entry rather than a
 * hardcoded slug list that silently dropped entries when a slug was renamed.
 */
export async function getFeaturedWork(): Promise<WorkEntry[]> {
	return (await getCollection('work'))
		.filter((w) => w.data.featured)
		.sort((a, b) => {
			const ao = a.data.order ?? Number.MAX_SAFE_INTEGER;
			const bo = b.data.order ?? Number.MAX_SAFE_INTEGER;
			return ao - bo || b.data.publishDate.valueOf() - a.data.publishDate.valueOf();
		});
}

/**
 * Company filter options for the work index — only companies that actually have
 * entries, in career order.
 */
export async function getWorkFilters(): Promise<{ value: string; label: string }[]> {
	const work = await getWork();
	const present = new Set(work.map((w) => w.data.company).filter(Boolean));
	const experience = await getExperience();
	return [
		{ value: 'all', label: 'All' },
		...experience
			.filter((e) => present.has(e.id))
			.map((e) => ({ value: e.id, label: e.data.short ?? e.data.company })),
	];
}

/** A skill paired with the work entries that actually evidence it. */
export interface EvidencedSkill {
	name: string;
	projects: { id: string; title: string }[];
}

/**
 * Join the skills list to the projects that used each technology.
 *
 * This is the fix for skills being asserted but never shown: a reader can go
 * from "Hexagonal Architecture" to the entries where it was applied. The join
 * key is the `tech` array on each work entry.
 */
export async function getEvidencedSkills(): Promise<
	{ label: string; groups: { name: string; skills: EvidencedSkill[] }[] }[]
> {
	const work = await getWork();
	const tiers = (await getCollection('skills')).sort((a, b) => a.data.rank - b.data.rank);

	// "Java 11/17/21" in the skills list must match "Java" on a work entry, so a
	// trailing version token is stripped before comparing. Only a purely
	// numeric suffix is removed — "Angular" must never collide with "AngularJS".
	const key = (s: string) => s.replace(/\s+[\d/.\s]+$/, '').trim().toLowerCase();

	const evidence = (name: string) =>
		work
			.filter((w) => w.data.tech.some((t) => key(t) === key(name)))
			.map((w) => ({ id: w.id, title: w.data.title }));

	return tiers.map((tier) => ({
		label: tier.data.label,
		groups: tier.data.groups.map((group) => ({
			name: group.name,
			skills: group.items.map((name) => ({ name, projects: evidence(name) })),
		})),
	}));
}
