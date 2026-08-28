# Self-hosting on the VPS, with GitHub Pages kept in sync

**Goal:** serve the portfolio from `https://firas-aen.portfolio.cyberonix.dev`
behind the existing Traefik, built on the VPS from a git checkout, while the
GitHub Pages build keeps working from the same source.

## The constraint that shapes everything

Every other app on the VPS pulls a prebuilt public image and takes its hostname
at **runtime** (`${N8N_SUBDOMAIN}`). A static Astro site cannot: the domain is
baked into the HTML at **build** time — canonical, every `og:` tag, the sitemap,
the JSON-LD, `robots.txt` — and it is rendered as literal text inside the OG card
PNG. So the hostname is a **build argument**, and changing it is a rebuild rather
than a restart.

Two hosts serving identical content is also a duplicate-content problem. The fix
is one canonical home: **both builds emit the VPS URL as canonical**, so the
Pages copy consolidates into it rather than competing with it.

## Decisions

- **`DEPLOY_TARGET` selects `site` + `base`.** `vps` (default) is
  `https://firas-aen.portfolio.cyberonix.dev` at `/`; `pages` is
  `https://firasaen.github.io` at `/portfolio`. An unrecognised value throws
  rather than silently building the wrong URLs into every page.
- **Canonical is always the VPS**, in both builds, derived by stripping
  `BASE_URL` off the pathname. `og:url` follows it.
- **`og:image` stays per-target.** It is an asset, not an identity — each host
  serving its own copy keeps the Pages card working if the VPS is down.
- **`robots.txt` becomes a route**, not a static file, so its `Sitemap:` line
  follows `site` per target instead of hardcoding one host.
- **The VPS builds from a local checkout** under `/opt/apps/portfolio/src`,
  not from a git URL build context. It works whether or not the repo is public,
  and it is literally "build from a git checkout".
- **No Authentik middleware.** `it-tools` has an SSO gate; copying that compose
  as a template would put a login in front of a public CV. Called out because it
  is the obvious copy-paste mistake here.

## Files

| Repo | File | Change |
| --- | --- | --- |
| cv-astro | `astro.config.mjs` | `DEPLOY_TARGET` → `site` + `base` |
| cv-astro | `src/config/deploy.ts` | New — canonical origin and `canonicalUrl()` |
| cv-astro | `src/components/MainHead.astro` | canonical + `og:url` from `canonicalUrl()` |
| cv-astro | `src/components/PersonSchema.astro` | `url` + `mainEntityOfPage` likewise |
| cv-astro | `src/pages/robots.txt.ts` | New — replaces `public/robots.txt` |
| cv-astro | `public/og-image.png` | Regenerate with the new URL |
| cv-astro | `Dockerfile`, `nginx.conf`, `.dockerignore` | New — node build, nginx serve |
| cv-astro | `.github/workflows/deploy.yml` | Set `DEPLOY_TARGET=pages` |
| dotfiles | `selfhosted/portfolio/docker-compose.yml` | New — Traefik labels, `web` network |
| dotfiles | `selfhosted/portfolio/setup.sh` | New — clone/pull into `/opt/apps/portfolio/src` |
| dotfiles | `selfhosted/portfolio/update.sh` | New — `git pull` + `up -d --build` |
| dotfiles | `selfhosted/init.sh` | Add `portfolio` to the apps list |

`manage.sh update` is `pull && up -d`, which does not rebuild a `build:` service.
Hence the app-local `update.sh` rather than editing shared tooling.

## nginx

`trailingSlash: 'ignore'` means `/work/keycloak` and `/work/keycloak/` must both
resolve, so `try_files $uri $uri.html $uri/index.html =404` with a named 404
page. `/_astro/*` filenames are content-hashed, so they are immutable and
everything else must not be cached hard.

## Verification

1. `DEPLOY_TARGET=vps npm run build` — canonical, `og:url`, sitemap and
   `robots.txt` all carry the VPS host at `/`; no `/portfolio` anywhere.
2. `DEPLOY_TARGET=pages npm run build` — assets and internal links carry
   `/portfolio`, but canonical and `og:url` still carry the VPS host.
3. An unknown `DEPLOY_TARGET` fails the build.
4. `docker build` succeeds and the container serves `/`, a nested route with and
   without a trailing slash, `/sitemap-index.xml`, `/robots.txt`, and a real 404.
5. `astro check` reports 0 errors, 0 warnings, 0 hints on both targets.

## DNS, out of this repo's control

`firas-aen.portfolio.cyberonix.dev` needs an A record at the VPS, **grey-cloud
(DNS only)** in Cloudflare — the Traefik compose notes that the HTTP-01 challenge
must reach Traefik directly. It is a fourth-level name, which a `*.cyberonix.dev`
wildcard would not cover; HTTP-01 issues per hostname, so that is fine here.
