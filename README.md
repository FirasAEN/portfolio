# cv-astro

Personal portfolio and CV site for François Abed El Nabi — Tech Lead & Full-Stack
Engineer, Grenoble.

Built with [Astro](https://astro.build) as a static site. No UI framework, no CSS
framework: styling is hand-rolled CSS custom properties in `src/styles/global.css`.

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
```

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check (`astro check`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |

Node 22+ (`.nvmrc`, and `engines` in `package.json`).

## Deployment

Pushing to **`dev`** triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages at **https://firasaen.github.io/portfolio**.

Note `main` is not the deploy branch.

### The base path

The site is served from the `/portfolio` sub-path, so **every internal URL must
go through `computeUrl()`** (`src/utils/computeUrl.ts`). There is no `<base>` tag —
it was removed because it silently rewrites every relative URL and cannot affect
external stylesheets.

Background images live in `src/assets/` rather than `public/` for the same reason:
CSS `url()` resolves relative to the *stylesheet*, so an extracted stylesheet at
`/_astro/…` would resolve `assets/…` to the wrong place. Importing them through
Vite (`src/styles/backgrounds.ts`) yields absolute, base-aware, hashed URLs.

## Content

All CV data lives in content collections, defined in `src/content.config.ts`:

| Collection | Source | Holds |
| --- | --- | --- |
| `work` | `src/content/work/*.md` | Project entries |
| `experience` | `src/data/experience.yaml` | Career history — **also the company registry** |
| `education` | `src/data/education.yaml` | Degrees |
| `skills` | `src/data/skills.yaml` | Expert / Working / Familiar tiers |
| `languages` | `src/data/languages.yaml` | Spoken languages |

`work` entries reference a company by the `experience` entry's `id`. That single
link drives the work-page filters, the card labels and accent colours, and the
timeline groupings — so adding a company means adding it to `experience.yaml` only.

Set `featured: true` (and optionally `order:`) on a `work` entry to surface it on
the homepage.

Derived lookups live in `src/utils/cv.ts`; prefer them over re-querying collections
in a page.
