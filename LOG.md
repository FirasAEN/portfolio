# Outstanding work

Notes to self, written 2026-08-28. State below was verified against the live
hosts on that date, not assumed.

## State as of writing

| | |
| --- | --- |
| `firas-aen.portfolio.cyberonix.dev` | live, HTTPS 200, valid cert. **Three commits behind** — still serving the Google Fonts build. |
| `firasaen.github.io/portfolio` | live, current (Actions ran on the last push). |
| `origin/dev` | `4395f12`, everything pushed. |
| Tests | 24 Playwright specs, green across three consecutive runs. |

DNS resolves to `167.233.128.203`, grey-clouded, so the ACME HTTP-01 challenge
reaches Traefik directly.

---

## 1. Redeploy the VPS

It is behind and still serving fonts from Google.

```bash
cd /opt/apps/portfolio && deploy/deploy.sh
```

Picks up self-hosted fonts, the reveal-ordering fix, the card contrast fixes,
11px diagram labels, and the container healthcheck.

Watch the first build: `npm ci` now installs Playwright too, so it is slower and
hungrier than the last one. If it dies part-way through, that is memory — see the
swap section in [`deploy/README.md`](deploy/README.md).

## 2. Gate the deploy on the tests — a real gap

`.github/workflows/ci.yml` triggers on **`pull_request`**. Pushes go straight to
`dev`. **The suite therefore never runs**, and `deploy.yml` will publish a build
whose tests were never executed — which is precisely what the suite was added to
prevent.

Fix: make `deploy.yml`'s publish step depend on a test job, so a red suite blocks
the deploy rather than racing it. Adding a `push` trigger to `ci.yml` is not
enough on its own — it would run alongside the deploy without blocking it.

Small change, and it is what makes the suite a safety net rather than decoration.

## 3. Decide before making the repo private

**GitHub Pages on a private repo requires a paid plan.** On the free tier, going
private turns Pages off. The VPS is unaffected.

That decides whether the dual-target build is still worth keeping:

- Staying public → leave as is.
- Going private on free → drop the `pages` target, simplify `astro.config.mjs`
  back to one host, and remove `canonicalUrl()`'s reason to exist.
- Going private on Pro → keep both, and add a **read-only deploy key** on the
  VPS. The procedure is not in the runbook yet: generate on the VPS as the
  deploying user, add the public half under repo → Settings → **Deploy keys**
  (not account SSH keys — those grant access to every repo), give it a host alias
  in `~/.ssh/config` so a second deploy key later does not collide, and switch
  the remote to the SSH URL.

## Smaller backlog

- **`robots.txt` on Pages is inert.** It builds to `/portfolio/robots.txt`;
  crawlers only read the origin root, which belongs to a different repo. Harmless
  while canonical points at the VPS. Only matters if Pages ever becomes primary.
- **No performance budget.** Nothing measures LCP or bundle size, so the
  self-hosted-fonts win can quietly erode. A Lighthouse CI run or a size check on
  `dist/_astro` would hold it.
- **The travelling beam's cycle is ~30s** on the full spine — deliberate, so it
  is slow enough to follow, but it means a long wait between passes if you sit
  still mid-page. `RATE` in the spine controller is the knob.
- **`.claude/launch.json` is untracked.** Left that way deliberately; it is local
  tooling config, not project config.

## Things deliberately not done

- The Skills tiers show "Data" twice. That is Data at **Expert** level and Data
  at **Working** level — correct as it stands.
- The dotfiles repo stays untouched. Deployment config lives here instead, in
  `deploy/`, because this service is built rather than pulled and the compose
  file has to sit beside the source it builds.
