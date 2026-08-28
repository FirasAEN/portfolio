---
title: Automated VPS Backups Behind a Trust Boundary
publishDate: 2026-08-28 00:00:00
tech:
  - n8n
  - Bash
  - Docker
  - PostgreSQL
  - Traefik
  - cron
tags:
  - Tooling
  - Security
  - Architecture
diagram: backup-boundary
description: |
  Scheduled backups for every app on my VPS, built so the automation names what to
  back up and the host alone decides how — because the process that runs the
  commands runs as root.
company: independent
---

## The automation names what; the host decides how

Every application on my VPS — databases and data directories alike — is backed
up on a schedule, uploaded off-box, pruned to a per-app retention, and reported
by email. The orchestration is n8n; the execution is a handful of Bash scripts
under cron.

The interesting part is not the scheduling. It is that the two halves do not
trust each other equally, and the design says so.

## The constraint that shaped everything

Backing up a Postgres container means `docker exec`. Backing up an application's
data directory means reading root-owned paths. So the process that actually runs
backups **runs as root** — there is no version of this where it does not.

That makes one question load-bearing: where does the command it runs come from?

If the answer were "the request", then anything able to write a request could
choose a command root would execute. n8n is a web application with credentials,
webhooks and an editor UI. It is exactly the component you should assume can be
compromised, and exactly the component writing the requests.

## What I traded away

The obvious design — a request that carries the command — is simpler, more
flexible, and lets a new backup be added entirely from the n8n UI. I gave that
up.

Instead a request carries **an identifier and nothing else**. The host keeps a
catalog of per-app definitions, and the poller looks the identifier up:

- the catalog directory is **owned by the host and never mounted into any
  container**, so n8n cannot read or write it;
- the identifier is validated strictly rather than tokenised, so a request of
  `myapp; rm -rf /` fails validation instead of being interpreted;
- an identifier with no catalog entry writes a failure — which is the alerting
  path, not a bug.

The cost is real: adding an app is now two steps in two places, and they have to
agree. That is the price of the boundary, and it is worth it.

## The rest of the mechanism

Two zones under `/srv`. The shared one is bind-mounted into the container a
subdirectory at a time — requests, results, archive and an upload staging area
read-write, the metrics feed read-only. The host zone holds the catalog, the
scripts and the logs, and is mounted nowhere. The canonical backup store is not
mounted either; the container only ever sees the single artifact staged for
upload.

Two details that remove whole classes of failure rather than handling them:

**Requests are written `.tmp` and renamed to `.req`.** The poller only considers
`.req`, so it can never read a half-written file. A rename is atomic; a write is
not.

**The poller claims a request by moving it into a processing directory.** Two
overlapping runs cannot both take the same job, because only one `mv` can
succeed. No lockfile, no coordination.

The poller handles one request per run and lets cron frequency pace throughput —
a queue that cannot stampede. Results are written back as JSON with ownership set
so n8n can read them, and n8n takes it from there: upload, apply the per-app
retention held in a configuration table, archive the result, delete the staged
file, and email success or failure.

The two cron jobs run as **different users on purpose**. The metrics gatherer —
disk, container health, routed services, certificate expiry — only reads state
and writes a JSON file, so it runs unprivileged. Only the poller runs as root.
Least privilege is a property of the schedule, not just the code.

## What it changed

Backups happen without me, off-box, with retention, and I hear about failures
rather than discovering them. More usefully, the thing that made it safe to
automate at all is that a compromise of the automation does not become a
compromise of the host — and that came from deciding where the boundary went
before deciding how convenient the workflow would be.
