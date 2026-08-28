# Deploying to the VPS

The site is served by nginx from a two-stage image: node builds, nginx serves.
Traefik terminates TLS and routes to it on the shared `web` network.

## One-time

```bash
sudo git clone --depth 1 -b dev https://github.com/FirasAEN/portfolio.git /opt/apps/portfolio
cd /opt/apps/portfolio && sudo deploy/deploy.sh
```

The checkout *is* the deploy directory — the compose build context is the repo
root, so there is no separate copy to keep in sync.

## Every deploy after that

```bash
cd /opt/apps/portfolio && sudo deploy/deploy.sh
```

It fast-forwards to `origin/dev`, rebuilds, and recreates the container.
`docker compose pull` is not a deploy here: the image is built, not published,
so pull has nothing to fetch and would change nothing.

## DNS

`firas-aen.portfolio.cyberonix.dev` needs an A record pointing at the VPS, set
to **DNS only** (grey cloud) in Cloudflare — Traefik issues certificates over
the HTTP-01 challenge, which has to reach it directly. A `*.cyberonix.dev`
wildcard would not cover a fourth-level name, but HTTP-01 issues per hostname,
so that is not a problem here.

## Changing the hostname

It is baked into the build, not the container: canonical URLs, `og:` tags, the
sitemap, the JSON-LD, and the text rendered inside `public/og-image.png`. To
move hosts, update `TARGETS.vps` in `astro.config.mjs` and `canonicalOrigin` in
`src/config/deploy.ts`, regenerate the OG card, then redeploy. A restart alone
will not do it.
