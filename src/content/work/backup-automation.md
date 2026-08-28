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
  back up and the host alone decides how, because the process that runs the commands
  runs as root.
company: independent
---

Every application on my VPS, databases and data directories alike, is backed up
on a schedule, uploaded off-box, pruned to a per-app retention, and reported by
email. n8n does the orchestration; a handful of Bash scripts under cron do the
execution.

## The automation names what; the host decides how

Backing up a Postgres container means `docker exec`. Backing up an application's
data directory means reading root-owned paths. So the process that actually runs
backups runs as root, and there is no version of this where it does not.

Which makes one question load-bearing: where does the command it runs come from?
If the answer is "the request", then anything able to write a request can choose
a command root will execute. n8n is a web application with credentials, webhooks
and an editor UI. It is the component I would assume can be compromised, and it
is the component writing the requests.

The design that carries the command in the request is simpler, more flexible, and
lets me add a new backup entirely from the n8n UI. I gave that up. A request
carries an identifier and nothing else, and the host keeps a catalogue of per-app
definitions that the poller looks the identifier up in:

- the catalogue directory is owned by the host and never mounted into any
  container, so n8n cannot read or write it;
- the identifier is validated against a strict pattern instead of being
  tokenised, so a request of `myapp; rm -rf /` fails validation instead of being
  interpreted;
- an identifier with no catalogue entry writes a failure, which is the alerting
  path.

Adding an app is now two steps in two places, and they have to agree.

## The rest of the mechanism

Two zones under `/srv`. The shared one is bind-mounted into the container a
subdirectory at a time: requests, results, archive and an upload staging area
read-write, the metrics feed read-only. The host zone holds the catalogue, the
scripts and the logs, and is mounted nowhere. The canonical backup store is not
mounted either, so the container only ever sees the single artifact staged for
upload.

Two details remove whole classes of failure instead of handling them.

Requests are written `.tmp` and renamed to `.req`. The poller only considers
`.req`, so it can never read a half-written file. A rename is atomic; a write is
not.

The poller claims a request by moving it into a processing directory. Two
overlapping runs cannot both take the same job, because only one `mv` can
succeed. No lockfile, no coordination.

The poller handles one request per run and lets cron frequency pace throughput,
so the queue cannot stampede. Results go back as JSON with ownership set so n8n
can read them, and n8n takes it from there: upload, apply the per-app retention
held in a configuration table, archive the result, delete the staged file, email
success or failure.

The two cron jobs run as different users. The metrics gatherer — disk, container
health, routed services, certificate expiry — only reads state and writes a JSON
file, so it runs unprivileged. Only the poller runs as root.

Backups now happen without me, off-box, with retention, and I hear about failures
instead of finding them.
