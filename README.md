# Shadab Ali — Portfolio

Portfolio for Shadab Ali, Shopify Full-Stack Developer.
Live at <https://portfolionew-omega-rouge.vercel.app/>.

## Stack

Static HTML, one stylesheet and one small vanilla JS file. No frameworks, no animation libraries, no third-party fonts (fonts are self-hosted in `assets/fonts/`).

The HTML files in the repository root are **generated**. Edit the sources, then rebuild:

```sh
python3 tools/build.py
```

| Source | What it controls |
| --- | --- |
| `src/data/site.json` | Site URL, contact links, navigation, each page's title and meta description |
| `src/data/projects.json` | Every project: homepage/projects cards **and** the full case-study page (`case-*.html`) |
| `src/pages/<page>.html` | The `<main>` content of regular pages (home, projects, services, about, …) |
| `tools/build.py` | Shared `<head>` (SEO, Open Graph, JSON-LD), header, mobile menu, footer, card and case-study templates; also writes `sitemap.xml` and `robots.txt` |

Markers you can use inside `src/pages/*.html`: `<!-- @cards:featured -->`, `<!-- @cards:shopify -->`, `<!-- @cards:wordpress -->`, `<!-- @process -->`, and `{{resume}}`, `{{whatsapp}}`, `{{linkedin}}`, `{{github}}`, `{{email}}`.

Commit the generated HTML along with the sources: Vercel serves the files as they are, with no build step. `.vercelignore` keeps `src/` and `tools/` out of the deployment.

### Adding a project

1. Add screenshots to `assets/projects/` named `<slug>-desktop.webp`, `<slug>-mobile.webp`, `<slug>-desktop-thumb.webp`, `<slug>-mobile-thumb.webp` (see below).
2. Add an entry to `src/data/projects.json` under `projects`, and add the slug to `order` (and to `featured` to show it on the homepage).
3. Run `python3 tools/build.py`.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Hosted on Vercel; pushing to the default branch deploys. `vercel.json` sets cache headers (fonts: 1 year, other assets: 1 week) and the sitemap content type.

## Contact form

The form on `contact.html` sends through [EmailJS](https://www.emailjs.com/) using the keys at the top of `script.js`.
Budget and timeline are optional fields: they are appended to the `message` parameter, so they arrive with the existing template, and are also sent as `budget` and `timeline` if you want to add `{{budget}}` / `{{timeline}}` to the template.
The public key is meant to be visible, but restrict **Allowed origins** to the site's domain in the EmailJS dashboard.
If EmailJS fails to load, the form falls back to opening the visitor's email app.

## Project screenshots

Each project has four images in `assets/projects/`:

| File | Used for |
| --- | --- |
| `<name>-desktop-thumb.webp` (1200×750) | Card preview on desktop |
| `<name>-mobile-thumb.webp` (720×1280) | Card preview on mobile |
| `<name>-desktop.webp` (1400px wide, full page) | Gallery popup on desktop |
| `<name>-mobile.webp` (800px wide, full page) | Gallery popup on mobile |

To add a project, take full-page screenshots, then make the thumbnails from the top of each:

```sh
convert name-desktop.webp -resize 1200x -crop 1200x750+0+0 +repage -quality 80 name-desktop-thumb.webp
convert name-mobile.webp  -resize 720x -crop 720x1280+0+0 +repage -quality 80 name-mobile-thumb.webp
```

## SEO checklist when adding a page

- Add it to `pages` in `src/data/site.json` with a unique title and description; the build adds canonical, Open Graph/Twitter tags, JSON-LD and the sitemap entry
- Keep one `<h1>` and don't skip heading levels

## Content rules

Only publish numbers that are backed by real project work: counts such as live projects, products managed and custom sections. Don't add performance percentages, conversion figures, revenue or testimonials unless they can be verified.
