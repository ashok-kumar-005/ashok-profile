# Versions

Each design version is kept as an annotated git tag, so any of them can be
restored or previewed at any time. Newest first.

| Version | Name | Date | Tag |
| --- | --- | --- | --- |
| v2 | Split Pane (Dark) | 2026-08-20 | `v2-split-pane-2026-08-20` |
| v1 | Gradient Hero | 2026-08-20 | `v1-gradient-hero-2026-08-20` |

---

## v2 — Split Pane (Dark) · 2026-08-20

**Tag:** `v2-split-pane-2026-08-20` · **Currently live**

Two-column layout inspired by [brittanychiang.com](https://brittanychiang.com/).

- Dark navy palette (`#0a192f`) with a teal accent (`#64ffda`), Inter + IBM Plex Mono.
- Left pane is sticky on desktop: name, role, in-page nav with animated line
  indicators, and social links pinned to the bottom.
- Right pane scrolls through About / Certifications / Solutions / Education.
- Certifications and solutions are compact rows — thumbnail or category icon on
  the left, details on the right — with a lift-and-highlight card on hover and
  sibling rows dimming.
- Solutions carry tech-stack pills.
- A soft radial spotlight follows the cursor (disabled for touch and for
  `prefers-reduced-motion`).
- Nav scroll-spy highlights the section crossing the upper third of the viewport.

Files: `index.html`, `styles.css`, `app.js`

## v1 — Gradient Hero · 2026-08-20

**Tag:** `v1-gradient-hero-2026-08-20`

Light card-grid layout with a full-bleed animated hero.

- White background, certifications in a responsive card grid.
- Hero used a `<canvas>` animated gradient flow (macOS-wallpaper style) with a
  moving specular highlight, behind a frosted-glass panel holding the copy.
- Solution cards with category icons.

Files: `index.html`, `styles.css`, `bg-flow.js`

---

## Working with versions

List every version with its description:

```bash
git tag -n99
```

Preview an old version locally without changing anything:

```bash
git switch --detach v1-gradient-hero-2026-08-20
python3 -m http.server 8000     # then open http://localhost:8000
git switch main                 # back to current
```

Roll the live site back to a previous version (this deploys it):

```bash
git revert --no-commit v1-gradient-hero-2026-08-20..HEAD
git commit -m "Roll back to v1 — Gradient Hero"
git push
```

Tag a new version after a redesign:

```bash
git tag -a "v3-<name>-$(date +%F)" -m "Version 3 — <Name> ($(date +%F))

<what changed>"
git push --tags
```

> Vercel also keeps every deployment, so any past build can be previewed or
> instantly promoted from the project's Deployments tab.
