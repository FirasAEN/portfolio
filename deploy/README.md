# Deploying to the VPS

The site is served by nginx from a two-stage image: node builds it, nginx serves
the result. The runtime image carries no node, no source and no `node_modules` —
about 94MB. Traefik terminates TLS and routes to it over the shared `web`
network; the container publishes no host ports.

Host: `https://firas-aen.portfolio.cyberonix.dev`

The checkout **is** the deploy directory. `/opt/apps/portfolio` is this repo, and
the compose build context is the repo root, so there is no second copy to keep in
sync.

---

## 1. DNS, first

The certificate cannot be issued until the name resolves, so do this before
deploying. Add an A record for `firas-aen.portfolio.cyberonix.dev` pointing at
the VPS, set to **DNS only (grey cloud)** in Cloudflare — Traefik issues
certificates over the HTTP-01 challenge, which has to reach it directly. An
orange-clouded record proxies through Cloudflare and the challenge fails.

Confirm it returns the VPS address and not a Cloudflare one:

```bash
dig +short firas-aen.portfolio.cyberonix.dev
```

A `*.cyberonix.dev` wildcard would not cover a fourth-level name, but HTTP-01
issues per hostname, so that is not a problem here.

## 2. Check Traefik and the shared network

```bash
docker network inspect web >/dev/null && docker ps --filter name=traefik --format '{{.Names}} {{.Status}}'
```

`deploy.sh` creates the `web` network if it is missing, but Traefik itself has to
be running already.

## 3. Clone, once

```bash
sudo git clone --depth 1 -b dev https://github.com/FirasAEN/portfolio.git /opt/apps/portfolio
```

If that asks for credentials the repo is private: use the SSH URL with a deploy
key on the VPS instead. Nothing downstream changes.

## 4. Deploy

```bash
cd /opt/apps/portfolio && sudo deploy/deploy.sh
```

This is also the command for **every** subsequent deploy. It fast-forwards to
`origin/dev`, rebuilds the image and recreates the container.

`docker compose pull` is **not** a deploy here. The image is built from source,
not published, so pull has nothing to fetch — it reports success and changes
nothing.

## 5. Verify from outside

```bash
curl -sI https://firas-aen.portfolio.cyberonix.dev | head -1
```

---

## Troubleshooting

### The build is killed part-way through

Almost always memory. The build runs `npm ci`, `astro check` and Vite inside the
container; on a 2GB box that is tight, and an OOM kill looks like the build
stopping mid-step rather than a clear error. Add swap and retry:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

Make it survive a reboot:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### HTTPS fails or serves the wrong certificate

Traefik requests the certificate on the first request, so the first few seconds
can fail. If it has not settled after a minute, the answer is almost always DNS
(see step 1) and the log will say so:

```bash
docker logs traefik --tail 40 | grep -iE "acme|certificate|error"
```

### The site is up but wrong, or the container will not start

```bash
docker logs portfolio --tail 50
```

### Confirming which commit is live

```bash
cd /opt/apps/portfolio && git rev-parse --short HEAD
```

`deploy.sh` prints this at the end of every run.

---

## Changing the hostname

The host is baked into the **build**, not the container: canonical URLs, the
`og:` tags, the sitemap, the JSON-LD, and the text rendered inside
`public/og-image.png`. A restart will not change it. To move hosts:

1. `TARGETS.vps` in `astro.config.mjs` — `site`
2. `canonicalOrigin` in `src/config/deploy.ts`
3. The Traefik `Host(...)` rule in `deploy/docker-compose.yml`
4. Regenerate `public/og-image.png`, which has the URL drawn into it as text
5. Commit, push, and run `deploy/deploy.sh`

## Two hosts, one canonical

The same source also builds for GitHub Pages, which serves from a `/portfolio`
subpath — `DEPLOY_TARGET` selects `site` and `base` (see `astro.config.mjs`).

Both builds emit the **VPS** URL as canonical, so the Pages copy consolidates
into this one rather than competing with it in search. That is deliberate: if
this host goes away, update `canonicalOrigin` before relying on the mirror.
