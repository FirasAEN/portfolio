# Portfolio overhaul — design spec

## Context

`cv-astro` is an Astro 6 static site deployed to GitHub Pages at
`firasaen.github.io/portfolio` (CI on push to `dev`). It was scaffolded from the
official Astro `portfolio` starter and adapted with real content.

The owner's concern, in their words: they are *"not sure if it reads as a personal
portfolio and exposes true skills."* Review confirms both halves:

1. **It reads as the starter template.** Section names, the three-box Skills grid,
   the hero-with-portrait, and the ContactCTA are unmodified scaffolding. The only
   substantive customization is a swapped accent colour — `--gradient-accent-orange`
   in [global.css](src/styles/global.css) still carries its original name while
   holding cyan values.
2. **It undersells the owner.** The distinctive story — computational material
   science PhD → particle physics → retrained as a Java developer → now Tech Lead of
   5 — is reduced to a "PhD" pill and one buried About paragraph. Work entries
   explain *patterns* rather than proving *contribution*:
   [ddd-architecture.md](src/content/work/ddd-architecture.md) is a textbook account
   of hexagonal architecture with no scale, constraint, trade-off, or outcome. For a
   Tech Lead, the evidence of seniority is exactly what is missing.
3. **Two production bugs**, both verified live against the deployed site.

**Phase 1 (this plan)** covers everything that does not depend on content: the bug
fixes, the structural refactors, and the new design-system foundation.
**Phase 2**, planned separately once the owner supplies their CV, covers information
architecture, page compositions, the eleven entry rewrites, and a skills↔projects
cross-index. Nothing in Phase 1 is invalidated by Phase 2 decisions.

## Settled direction

- **New design language**, keeping the Astro + CSS-custom-property foundation.
  **No new dependencies.**
- **Art direction: editorial × systems.** Magazine-grade typography — large
  headlines, generous whitespace, a real type scale — detailed with engineering
  cues: hairline grid rules, monospace metadata, numbered entries.
- **Typography: Instrument Serif (display) + Inter (body) + JetBrains Mono
  (metadata)**, replacing Rubik + Public Sans via the existing Google Fonts link.
  Note: Instrument Serif ships 400 weight only — fine for display, so headline
  emphasis must come from size and spacing, not weight.

---

## 1. Fix background images 404ing in production

[BaseLayout.astro:37-104](src/layouts/BaseLayout.astro:37) declares
`url('assets/backgrounds/…')` inside a scoped `<style>`. Astro extracts that to
`/portfolio/_astro/BaseLayout.<hash>.css`, and CSS `url()` resolves against the
**stylesheet**, not the `<base>` tag. Verified against production:

| URL | Status |
| --- | --- |
| `/portfolio/_astro/assets/backgrounds/bg-main-dark-800w.jpg` (what resolves) | **404** |
| `/portfolio/assets/backgrounds/bg-main-dark-800w.jpg` (correct) | 200 |

All 19 background assets fail, so the site renders flat black. Same defect for the
noise texture in [index.astro](src/pages/index.astro).

**Approach:** move `public/assets/backgrounds/**` to `src/assets/backgrounds/**`,
`import` each image in the component frontmatter, and pass the resolved URLs into
the stylesheet with Astro's `define:vars`:

```astro
---
import bgMainDark from '../assets/backgrounds/bg-main-dark-800w.jpg';
---
<style define:vars={{ bgMainDark: `url(${bgMainDark.src})` }}>
  :root.theme-dark { --bg-image-main: var(--bgMainDark); }
</style>
```

Vite then emits hashed, base-aware absolute URLs, so resolution no longer depends on
stylesheet location *or* the `<base>` tag — and the assets gain cache-busting.

Do **not** fix this by relying on `<base>`: it cannot affect external stylesheets,
which is the actual failure.

Note `define:vars` makes the style block non-hoistable, so it inlines per page.
Acceptable for `BaseLayout`, and it removes a render-blocking request.

**Gotcha:** two of the backgrounds are SVGs (`bg-main-light.svg`, `bg-main-dark.svg`).
In Astro 5+, a bare `import x from './a.svg'` yields an SVG *component*, not
`ImageMetadata` — so it has no `.src`. Import those with the explicit `?url` suffix
(`import curves from '../assets/backgrounds/bg-main-light.svg?url'`) and use the
string directly.

## 2. Fix the favicon 404

[MainHead.astro:22](src/components/MainHead.astro:22) uses `href="/favicon.ico"`.
Root-relative URLs ignore `<base>`, so it resolves to `firasaen.github.io/favicon.ico`
— **404**, outside the project. It also declares `type="image/svg+xml"` on a `.ico`
file, while `public/favicon.svg` is referenced nowhere.

Serve the SVG with the correct type and a base-aware path, keeping the `.ico` as the
fallback link.

## 3. Consolidate base-path handling

Two mechanisms currently solve one problem: the `<base>` tag in `MainHead.astro`
*and* [computeUrl.ts](src/utils/computeUrl.ts) prefixing `BASE_URL` onto every link.

**Keep `computeUrl`, drop the `<base>` tag.** `<base>` silently rewrites *every*
relative URL on the page (including in-page anchors), it cannot help CSS, and its
effects are invisible at the call site. Explicit prefixing is greppable.

Then:
- Harden `computeUrl` — the current `` `${baseHref}/${link}`.replace('//', '/') ``
  replaces only the **first** occurrence, so it works today only by luck. Join the
  segments properly and collapse duplicate slashes globally.
- Route the remaining raw relative references through it — notably
  `src="assets/portrait.jpg"` in [index.astro](src/pages/index.astro) and the work
  images in `PortfolioPreview.astro` and `work/[...slug].astro`, which currently
  depend on `<base>` and will break the moment it is removed.
- Fix `base: '.'` in dev ([astro.config.mjs](astro.config.mjs)) — not a valid Astro
  base path; use `'/'`.
- Settle the trailing-slash inconsistency: `PortfolioPreview.astro` links to
  `/work/${id}` while `timeline.astro` uses `/work/${slug}/`. Standardise on **no
  trailing slash**, matching `trailingSlash: 'ignore'` and the majority of call
  sites.

## 4. Remove the manual parallel indexes

Four hand-maintained lists duplicate what the collection already knows. Rename a
slug and links vanish silently, because `getWorkBySlug` returns `null` and the
markup renders nothing.

| Location | Hardcoded list | Derive from |
| --- | --- | --- |
| [timeline.astro](src/pages/timeline.astro) | `slugs[]` per employer | `company` field |
| [index.astro](src/pages/index.astro) | `featuredSlugs` | new `featured` flag |
| [work.astro](src/pages/work.astro) | `companies` | distinct `company` values |
| `PortfolioPreview.astro` | `companyLabels` | shared company map |

Extend the `work` schema in [content.config.ts](src/content.config.ts) with
`featured: z.boolean().default(false)` and an optional `order` for deterministic
homepage sequencing. Introduce a single company registry (slug → display label) that
`work.astro`, `PortfolioPreview.astro`, and the timeline all read from — one source
of truth for the three places that currently disagree.

## 5. Move hardcoded CV data into content

The career timeline, education, and skills are hardcoded markup in
[timeline.astro](src/pages/timeline.astro) and [about.astro](src/pages/about.astro),
so CV data has two sources of truth and the same facts are restated across pages.

Move them into content collections using Astro's `file()` loader over YAML/JSON,
defined alongside the existing `work` collection in `content.config.ts` — same
pattern, no new tooling. Zod schemas keep them typed. This is also what makes the
Phase 2 skills↔projects cross-index possible.

## 6. Design-system foundation

Rework the token layer in [global.css](src/styles/global.css):

- **Typography** — swap the Google Fonts link in `MainHead.astro` to Instrument
  Serif + Inter + JetBrains Mono. Add `--font-mono`. Rebuild the type scale on a
  consistent ratio; the current `--text-sm … --text-5xl` steps are the starter's.
- **Palette** — replace the swapped-accent tokens with a deliberately derived set,
  and **rename `--gradient-accent-orange`** (it holds cyan; the name is a direct
  artifact of the template). Used in `CallToAction.astro`, `index.astro`,
  `timeline.astro`.
- **Primitives** — add the hairline rule, mono-metadata label, and numbered-entry
  patterns the art direction depends on.
- Verify contrast in **both** themes; the theme toggle is a real feature here.

Layout composition is deliberately **not** in this phase — it belongs with the
content decisions in Phase 2.

## 7. Repo cruft

- **`.playwright-mcp/` is committed** — 11 debug screenshots and logs from a March
  session, tracked in git and absent from `.gitignore`. Untrack and ignore. (Also
  contradicts the global instruction routing screenshots to
  `.playwright-screenshots/`.)
- `README.md` is the **verbatim unmodified Astro starter README**, still instructing
  the reader to delete it. Replace with real project docs: the `/portfolio` base
  path, the `dev`-branch deploy trigger, and local setup.
- `package.json` name is still the scaffold's `"mechanical-moon"`.
- Delete dead code: `public/assets/stock-1..4.jpg`, `Grid.astro`'s never-passed
  `variant` prop, the `.mention-card` CSS in `index.astro` (markup was deleted), the
  `img {}` rule in `about.astro` (page has no images).
- [Nav.astro](src/components/Nav.astro): two `<noscript>` blocks carry **stale**
  active-link logic that disagrees with the JS `isCurrentRoute()` path — the
  base-prefixed `href` can never match the `'/'` comparison. Reconcile.
- [404.astro](src/pages/404.astro) is a bare "Not found" with no way back.
- Add a Node version pin (CI uses `node-version: 22`; nothing pins it locally).
- Rename the 7 `Gemini_Generated_Image_*.png` files to meaningful names. **Whether
  to replace the AI art entirely is a Phase 2 content decision** — generic AI
  imagery on an engineering portfolio undercuts credibility, but the replacement
  (diagrams, screenshots) depends on the entry rewrites.

## Verification

1. `npm run build` — runs `astro check` first; must pass clean.
2. Serve `dist/` under a `/portfolio/` prefix and confirm **zero 404s** in the
   network panel: all 19 backgrounds, the noise texture, both favicons. This is the
   regression test for §1–3 — the current build fails it.
3. Toggle light/dark and cross the 800w→1440w breakpoint; confirm backgrounds swap.
4. Click every internal link on every page, including the timeline achievement
   pills, to confirm base-path handling survives removing `<base>`.
5. Rename one work entry's slug and confirm nothing silently disappears — the
   regression test for §4.
6. Disable JavaScript and check the `<noscript>` nav renders with correct active
   state (§7).
7. Push to `dev`, then confirm the deployed GitHub Pages build renders backgrounds.

---

# Phase 2 — pending

Unblocked now that the CV is available (`~/projects/review/career-ops/cv.md`).
Open decisions and the evidence to build on are recorded here.

## Information architecture — undecided

Three candidates were presented; the owner deferred until the CV was read:

- **A — Narrative spine.** Home carries the whole argument top to bottom; Work is
  the deep index; Timeline and About are absorbed.
- **B — Distinct jobs per page.** Keep four routes, remove the overlap.
- **C — Case-study-first.** Projects are the portfolio; Timeline and About collapse
  into one Background page.

**The CV strengthens the case for A.** It carries both a clear arc (PhD → 9 years →
Tech Lead) and projects with real weight, and A is the only option that keeps those
two working together instead of splitting them across routes.

## What the CV has that the site does not

The CV is written outcome-first — the exact frame the work entries lack:

- "Enabled 5 applications to build and release independently from one codebase"
- "Removed the AngularJS dependency… migrating 7 legacy modules over 18 months"
- "A Storybook-documented design system of 23 components (15 atomic, 8 integration)"
- "Centralised authentication for hundreds of users across 5 tenants"
- "4 engineers onboarded to date"

Compare `src/content/work/ddd-architecture.md`, which explains hexagonal
architecture in the abstract and never says what was shipped.

**An entire CV section is missing from the site:** *Independent Engineering &
Self-Hosting (2024–present)* — AI-assisted tooling, Claude Code/MCP/custom agents,
VPS self-hosting, CI/CD. It is now in `src/data/experience.yaml` and appears on the
timeline, but has no work entries behind it. It is the most current and most
differentiating thread available, and deserves real entries.

## Site/CV discrepancies to resolve

| Site | CV |
| --- | --- |
| "8+ years" | "9 years" — **fixed** in `about.astro` |
| "Fluent: English, French, Arabic" | French is **Native** — **fixed** via `languages.yaml` |
| "Francois ABED EL NABI" | "Firas François Abed El Nabi" — **unresolved**, a naming decision |
| Skills as one flat list | Expert / Working / Familiar tiers — **fixed** via `skills.yaml` |
| Missing Redis, Scala, Spark, Neo4J, NextJS, NestJS, D3JS, GitLab CI | Present — **fixed** |

## Decisions (locked)

1. **IA: A — narrative spine.** Home carries the whole argument top to bottom:
   hook → proof (featured work) → arc (career + education) → skills evidenced by
   the projects that prove them → contact. `/work` stays as the deep, filterable
   index plus detail pages. `/about` and `/timeline` stop being separate routes and
   become anchored sections on Home; the old URLs redirect so nothing breaks.
2. **Name: "Firas François"** — replaces "Francois ABED EL NABI" sitewide.
3. **Imagery: diagrams or nothing.** See below.

## Imagery

Audit of the 15 existing images found the problem is not that they are
AI-generated — it is that half contain **false specifics**:

| Image | Defect |
| --- | --- |
| `ipm2.png` | **Depicts the wrong project** — a CodeMirror DSL editor; IPM2 is Eaton UPS/data-centre monitoring |
| `formula-editor.png` | Gibberish code in the fake editor: `<urk`, `<ppuor(DSL>`, `assignee ()` |
| `ddd-architecture.png` | Fabricated metrics — "02.724", "06.47%", "KEW" |
| `nx-monorepo.png` | Fabricated metrics — "205%", "1855", "1096", "2245", "19.3%" |
| `wiser-energy.png` | Misspelling baked into the pixels: "Oneboarding" |
| `spark-ar.png` | Shows BLE/mobile — that is the Schneider project, not SPARK's AR projection |
| `design-system.png`, `dev-team-training.png`, `angularJS-angular-migration-2.png` | Generic decoration, no information |

Separately, the set weighs **55 MB** (41 MB of it loaded by the work page alone) —
2048×2048 PNGs served unoptimised from `public/`.

**Rule adopted: an image is evidence or it is absent.** Decoration that imitates
evidence is worse than white space.

- Delete every image with fabricated detail.
- Author real SVG architecture diagrams for entries where a diagram teaches
  something: hexagonal ports/adapters, the Nx dependency graph, the Keycloak
  OAuth2 + custom token mapper flow, the Lezer→CodeMirror→Spark pipeline, the
  AngularJS→Angular migration path, the JointJS workflow model.
- These are publishable — they describe patterns and decisions, not client IP,
  which matters because the Adobis/Schneider/Eaton work is under NDA and real
  screenshots are unavailable.
- Diagrams are themeable via the palette tokens and weigh ~5 KB rather than ~5 MB.
- Entries without a diagram get a typographic card; `img` becomes optional.
- **Every diagram must be reviewed by the owner for technical accuracy before it
  ships.** The whole point is that they are true.

## Evidence frame for work entries

Each of the 11 entries is rewritten to lead with contribution, not with a
description of the pattern. Source facts come from the CV, so nothing is invented:

| Entry | Evidence from the CV |
| --- | --- |
| `nx-monorepo` | 5 applications building and releasing independently from one codebase |
| `ddd-architecture` | Back-end services testable independently of database and framework |
| `design-system` | 23 components (15 atomic, 8 integration), Storybook-documented |
| `formula-editor` | Business DSL on a Lezer parser + CodeMirror, checked before Spark executes |
| `workflow` | Automation reconfigurable without a code change, via a visual JointJS editor |
| `keycloak` | Hundreds of users across 5 tenants, one OAuth2/OIDC flow, custom token mapper |
| `migration` | 7 legacy modules off end-of-life AngularJS over 18 months |
| `dev-training` | Onboarding programme built and run; 4 engineers onboarded |
| `wiser-energy` | PV monitoring + BLE home automation across EMEA; WiserEnergy/WiserOne |
| `ipm2` | UPS-backed data centres incl. Eaton's Grenoble-Montbonnot; NgRx under streaming |
| `spark-ar` | EU research project; Spring MVC/Data + Apache Storm; ActiveMQ bridging Java/C# |

**Gap:** the *Independent Engineering & Self-Hosting* thread has no work entries.
It is the most current and differentiating material available and needs entries the
owner supplies or approves.

## Still open

- **The Gulf CV variant.** `cv-gulf.md` reorders languages, adds a GCC relocation
  line, and foregrounds the Schneider/Eaton energy work. Should the site stay
  neutral, or carry that emphasis?

---

# Phase 2 — delivered

- **IA A implemented.** Home is the narrative spine: hook → selected work →
  career arc → skills evidenced by projects → languages → contact. `/about` and
  `/timeline` are gone as routes and redirect to `#about` / `#timeline`.
- **Name** is now `Firas François`, centralised in `src/config/site.ts` along
  with role, location, email and the socials that Nav and Footer both duplicated.
- **Imagery**: 14 AI-generated PNGs deleted. Six hand-authored SVG diagrams in
  `src/components/diagrams/`. `workflow.png` kept — it is a genuine capture.
- **All 11 entries rewritten** on the evidence frame from CV facts.
- **Skills cross-index** via a new `tech` field per work entry; each skill shows
  a mark per project that used it, linking to the entry.
- **Weight: ~57 MB → 1.3 MB.**

## Owner decisions still outstanding

1. **`workflow.png` may be confidential.** It is a real screenshot showing
   internal task identifiers (`TA_4_DATABLOCK_3634_PERSIST`) and French product
   UI from client work. Genuine evidence, but publishing it may breach NDA.
   Either confirm it is cleared, or replace it with an anonymised diagram.
2. **Unevidenced skills are now visibly unevidenced.** Technologies with no
   project behind them (PostgreSQL, Docker, Jenkins, Python…) render without
   marks. This is honest, and it also draws the eye to the gaps. Options: leave
   as is, sort evidenced skills first, or drop the unevidenced ones.
3. **Diagram accuracy review.** All six diagrams state architectural claims and
   trade-offs. They were written from the CV and the entry text, not from the
   systems themselves — they need checking before this ships.
4. **The Independent Engineering thread still has no work entries.**
5. **The Gulf CV variant** — neutral site, or GCC emphasis?
