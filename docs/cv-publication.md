# Published CV

`public/cv/firas-abed-el-nabi-cv.pdf` is the web-publication variant, served from
the hero button via `cv.href` in `src/config/site.ts`.

It is the real CV document — `CV__Firas-AEN.docx` — with two things removed, not a
re-typesetting of the content in some other template. Fonts, spacing, small caps,
rules and right-aligned dates are the original's.

## What is removed, and why

- **the phone number**, from the contact row. Email and LinkedIn are already public
  on this site; the phone is not, and anything published here is indexable and
  scrapeable, which is a one-way door
- **the citizenship / work-authorisation line**. Relevant to a recruiter assessing a
  specific role, not to a public page

Nothing else is touched. The footers are additionally blanked, for a mechanical
reason given below.

## Source of truth

`career-ops/CV__Firas-AEN__Web.docx` — the edited Word document. It sits beside
`CV__Firas-AEN.docx` and `CV__Firas-AEN__Gulf.docx` so all three variants live
together. Edit it in Word like any other, then re-render.

**Do not blank `phone` in `career-ops/config/profile.yml`.** An earlier version of
this note said to; that was wrong. `profile.yml` feeds every career-ops mode, so
blanking it strips the number from the CVs sent to employers too.

## Rendering it

There is no LibreOffice, Word, or `pandoc` on this machine, so the docx is rendered
in a browser by `docx-preview` and printed by Playwright.

    npm install docx-preview            # pulls jszip with it
    # build an HTML page that base64-embeds the .docx and calls
    # docx.renderAsync(buf, el, null, { breakPages: true, experimental: true })
    # then: page.pdf({ format: 'A4', margin: 0, printBackground: true })

Two things that are load-bearing:

- **`experimental: true`, plus a settle delay before `page.pdf()`.** Tab stops are
  resolved in JavaScript after `renderAsync` resolves. Print immediately and every
  right-aligned date collapses inline next to the company name.
- **Footers are blanked in the docx.** They contain Word `PAGE`/`NUMPAGES` field
  codes, which only Word evaluates — `docx-preview` renders the literal surrounding
  text, so the page foot reads `Page  of` with two holes in it. The original PDF
  shows no footer text at all, so blanking loses nothing.

## Known limitation

The small-caps tagline extracts from the text layer as `Tech L ead & Full-S tack
E ngineer` — the renderer's letter-spacing inserts breaks that the original export
does not have. It looks correct on screen and in print; only copy-paste and ATS text
extraction see it. It affects that one line. The body text extracts cleanly, and the
overall count of extraction-fragmented lines is 12 against the original's 11.

## Before replacing this file

Check the artifact, not the source:

    pdftotext firas-abed-el-nabi-cv.pdf - | grep -inE '\+33|phone|citizen|visa|Page'

Silence is the pass condition — `Page` is in there to catch the footer regression.
