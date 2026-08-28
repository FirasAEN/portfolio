# Published CV

`firas-abed-el-nabi-cv.pdf` is the web-publication variant, served from the hero
button via `cv.href` in `src/config/site.ts`.

## What makes it the *web* variant

It omits two things the CV sent to employers carries:

- **the phone number** — the email and LinkedIn are already public on this site;
  the phone is not, and anything published here is indexable and scrapeable,
  which is a one-way door
- **the citizenship / work-authorisation line** — relevant to a recruiter
  assessing a specific role, not to a public page

Everything else is the master CV unchanged. The per-role "Technical environment"
lines are dropped as well, purely to hold the document to two pages; the same
ground is covered by the Skills section.

## Regenerating it

From the `career-ops` checkout — that repo owns the CV, this one only publishes it:

    node build-cv-html.mjs /tmp/cv-firas-abed-el-nabi-portfolio.json \
      output/cv-firas-abed-el-nabi-portfolio.html templates/cv-template.html
    node verify-cv-facts.mjs output/cv-firas-abed-el-nabi-portfolio.html
    node generate-pdf.mjs output/cv-firas-abed-el-nabi-portfolio.html \
      output/cv-firas-abed-el-nabi-portfolio-<date>.pdf \
      --format=a4 --max-pages=2 --allow-reorder

then copy the PDF here as `firas-abed-el-nabi-cv.pdf`.

**Do not blank `phone` in `career-ops/config/profile.yml`** — an earlier version
of this file said to, which was wrong. That file feeds every mode, so blanking it
strips the number from the CVs you send to employers too. The phone is omitted by
leaving `candidate.phone` out of the *render payload* instead; `build-cv-html.mjs`
gates on `if (c.phone)` and drops the contact-row separator cleanly with it.

`--allow-reorder` is needed because the template emits Education before Skills
while `cv.md` has them the other way round. It downgrades that parity check to a
warning for the run. Setting `cv.sections` in `profile.yml` would fix the order
permanently, but that changes every CV the pipeline produces, so it is left alone.

## Before replacing this file

Check the text layer, don't trust the source:

    pdftotext firas-abed-el-nabi-cv.pdf - | grep -inE '\+33|phone|citizen|visa'

Silence is the pass condition.
