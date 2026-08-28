import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

/** A grouped list of bullet points, as the CV structures them. */
const highlightGroup = z.object({
	group: z.string(),
	items: z.array(z.string()),
});

export const collections = {
	work: defineCollection({
		loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			publishDate: z.coerce.date(),
			tags: z.array(z.string()),
			/** Technologies actually used — the join that evidences the skills list. */
			tech: z.array(z.string()).default([]),
			/** Optional: only a real screenshot belongs here, never decoration. */
			img: z.string().optional(),
			imgThumbnail: z.string().optional(),
			img_alt: z.string().optional(),
			/** Id of a hand-authored SVG diagram in src/components/diagrams. */
			diagram: z.string().optional(),
			/** Matches an `experience` entry id — drives filters, labels, grouping. */
			company: z.string().optional(),
			/** Surfaced on the homepage. */
			featured: z.boolean().default(false),
			/** Lower sorts first among featured entries; ties fall back to date. */
			order: z.number().optional(),
		}),
	}),

	experience: defineCollection({
		loader: file('src/data/experience.yaml'),
		schema: z.object({
			company: z.string(),
			/** Compact label for filter pills and cards; falls back to `company`. */
			short: z.string().optional(),
			role: z.string(),
			location: z.string(),
			start: z.coerce.date(),
			/** `null` means current. */
			end: z.coerce.date().nullable().default(null),
			accent: z.string(),
			summary: z.string(),
			highlights: z.array(highlightGroup).default([]),
			stack: z.array(z.string()).default([]),
		}),
	}),

	education: defineCollection({
		loader: file('src/data/education.yaml'),
		schema: z.object({
			title: z.string(),
			institution: z.string(),
			location: z.string().optional(),
			start: z.coerce.date(),
			end: z.coerce.date(),
			/** Canonical catalogue record. Preferred over a direct file URL, which rots. */
			url: z.url().optional(),
			/** Direct full text. `bytes` exists so the link can warn before a large download. */
			fullText: z
				.object({ url: z.url(), label: z.string(), bytes: z.number().optional() })
				.optional(),
		}),
	}),

	skills: defineCollection({
		loader: file('src/data/skills.yaml'),
		schema: z.object({
			label: z.string(),
			rank: z.number(),
			groups: z.array(z.object({ name: z.string(), items: z.array(z.string()) })),
		}),
	}),

	languages: defineCollection({
		loader: file('src/data/languages.yaml'),
		schema: z.object({
			name: z.string(),
			level: z.string(),
			rank: z.number(),
		}),
	}),
};
