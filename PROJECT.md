# Project Documentation — ashok-profile

Reference doc for this repo's structure and conventions. Purpose: share this
file (plus `PROFILE.md` for bio content) as context when asking Claude for a
new feature, so it can generate an accurate, scoped prompt or plan without
re-discovering the codebase from scratch each time.

## What this is

Ashok Kumar's personal portfolio site — a single-page, vanilla HTML/CSS/JS
site (no framework, no build step) deployed on Vercel. Sections: Hero → About
→ Experience → Certifications → Solutions → Education → Footer, plus a
lightbox-style screenshot viewer for the Solutions section.

Live structure follows the "v3 — Editorial" design documented in
`VERSIONS.md`, inspired by riccardozanutta.com.

## Tech stack

- **No framework, no bundler, no package.json.** Plain HTML, CSS, and one
  vanilla JS file. Fonts are loaded from Google Fonts (League Spartan, Libre
  Baskerville, IBM Plex Mono).
- **Hosting:** Vercel (project linked via `.vercel/project.json`). Static
  site — push to `main` and Vercel deploys automatically.
- **No server, no database, no API routes.** Everything is client-side.

## File map

```
index.html        All markup: hero, about, experience, certifications,
                   solutions, education, footer, and the shared shot viewer.
                   Inline <svg><symbol> defs at the top hold reusable icons
                   (icon-web, icon-ios, icon-macos, icon-cli, icon-ml,
                   icon-doc, icon-linkedin, icon-globe, logo-xebia).
styles.css         All styling. Organized in banner-commented sections that
                   mirror index.html's structure (search for "=================").
                   CSS custom properties for color/font/easing live in :root
                   at the top.
app.js             All behavior, IIFE-wrapped, organized by feature with
                   comment headers: intro curtain, signal-network canvas
                   animation, pointer parallax, sticky top bar, active-nav
                   scroll-spy, solution screenshot discovery + lightbox
                   viewer, and scroll-reveal animations. No dependencies.
assets/            Certification images (flat, referenced by filename from
                   index.html) plus assets/shots/ for solution screenshots.
assets/shots/      Screenshots for the Solutions section (see below).
VERSIONS.md        History of past full-redesigns, kept as annotated git tags.
PROFILE.md         Ashok's bio/experience/certs, for sharing as Claude.ai
                   Project knowledge — not meant to be linked from the site.
PROJECT.md         This file.
```

## Key conventions

### Solution screenshots are auto-discovered, not listed in code

Each `<li class="work" data-shots="SLUG">` in the Solutions section
(`index.html`) is matched to screenshots purely by filename convention. At
page load, `app.js` probes `assets/shots/SLUG-1.{jpg,png,jpeg,webp}`,
`SLUG-2...`, etc., stopping at the first missing number (hard cap: 12).

**To add screenshots to a solution:** just drop files named
`assets/shots/<slug>-1.jpg`, `<slug>-2.jpg`, ... into `assets/shots/` — no
JS or HTML change needed. The `slug` must exactly match the `data-shots`
value on that solution's `<li>`.

**Screenshots containing real personal data (the Expense Tracker ones, for
example) must have sensitive values redacted before committing.** The
established technique (not a flat solid box — see `12-expense-tracker-*.jpg`
for reference) is a heavy downsample-then-blur-then-upscale pass over just
the sensitive region, feathered at the edges, so it visually reads as a soft
color smear rather than a hard redaction box. A flat Gaussian blur alone is
**not** sufficient — high-contrast bold text survives visually recognizable
even under a strong blur; the region must be reduced to near-flat color first
(shrink to a handful of pixels, then upscale) before blurring for softness.

### Adding a new solution

1. Add a new `<li class="work" data-shots="NN-slug">` inside `<ol class="works">`
   in `index.html`, following the existing pattern (work-num, work-kind icon
   + label, title, description, tech tags).
2. Pick an existing `icon-*` symbol for `work-kind` (web, ios, macos, cli, ml,
   doc) or add a new one to the `<svg><defs>` block at the top of `index.html`.
3. Optionally drop screenshots into `assets/shots/` using the slug (see above).
4. Update the "15 things" / stat counts in the About section and page
   `<meta description>` if the total count changes.
5. Update `PROFILE.md`'s Solutions list to match.

### Adding a new certification

Add a `<li class="cert">` to the relevant `<ul class="cert-grid">` group
(Appian / AI & Claude / Security, Networking & Foundations — or a new
`<h3 class="cert-group">` for a new category), with the cert image dropped
flat into `assets/`. Update the "18 certifications" stat in About and
`PROFILE.md` to match.

### Motion & accessibility

Every animated feature (intro curtain, signal-network canvas, pointer
parallax, scroll-reveal) checks `prefers-reduced-motion` and degrades to a
static state — preserve this pattern for any new motion.

### Design system

- Colors, fonts, and easing curves are CSS custom properties in `styles.css`
  `:root` — reuse these rather than hardcoding new values.
- Sections alternate `band-paper` (light) / `band-ink` (dark) backgrounds.
- Headings use League Spartan (`--display`), body copy uses Libre Baskerville
  (`--serif`), and small mono accents use IBM Plex Mono (`--mono`).

## Working with past design versions

See `VERSIONS.md` — every full redesign is kept as an annotated git tag, so
older versions can be previewed or restored without losing history.

## Deployment

Static site, no build step. Pushing to `main` triggers a Vercel deploy
automatically (`vercel.json`/build config not needed for a plain static
site). Local preview: `python3 -m http.server 8000` from the repo root.

## When asking Claude for a new feature

Share this file (`PROJECT.md`) for codebase context, and `PROFILE.md` if the
feature touches bio/experience/certification content. Useful things to state
up front: which section is affected, whether it needs a new icon symbol,
whether it needs new assets, and whether it should follow the "auto-discovery"
pattern (like screenshots) or be hardcoded in the markup (like certs/roles).
