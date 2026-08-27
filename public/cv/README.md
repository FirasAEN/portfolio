# Published CV

Drop the **phone-free** CV PDF here, then point `cv.href` in
`src/config/site.ts` at it — the hero button appears automatically.

    public/cv/firas-abed-el-nabi-cv.pdf
    →  cv: { href: '/cv/firas-abed-el-nabi-cv.pdf', label: 'Download CV' }

`computeUrl()` adds the `/portfolio` base path, so write the path as it appears
above, with a leading slash and no base.

## Why phone-free

The CV in `career-ops` carries `+33 7 86 33 49 23`. The email and LinkedIn are
already public on this site; the phone number is not, and anything published
here is indexable and scrapeable — that is a one-way door.

To produce a phone-free build from the existing pipeline, blank the phone in
`career-ops/config/profile.yml`:

    candidate:
      phone: ""

and regenerate. That file is the single source of truth for contact details
across every mode, so nothing else needs editing. `cv.md` line 7 and
`cv-gulf.md` also carry the number literally if a variant is built from those
directly.

This directory is committed so the location is obvious; the PDF itself is not
tracked until you add it.
