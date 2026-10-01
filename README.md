# Shadab Ali — Portfolio

Portfolio for Shadab Ali, Shopify developer focused on performance, conversion and automation.
Live at <https://portfolionew-omega-rouge.vercel.app/>.

## Stack

Plain static site — no build step, no frameworks, no animation libraries.

- `index.html` — hero, proof metrics, featured projects, specialisations, capabilities, experience preview, testimonials, recruiter/client CTA
- `projects.html` — Shopify case-study overview, then WordPress/WooCommerce projects
- `case-diviniti.html`, `case-portrait-on-gold.html`, `case-ratanarpan.html` — full case studies
- `experience.html`, `services.html`, `about.html`, `skills.html`, `work-with-me.html`, `contact.html`
- `style.css` — all styles; light/dark themes via `[data-theme]`; the `v8` section at the end holds the current layout components
- `script.js` — theme toggle, navigation, scroll reveal (IntersectionObserver), contact form, FAQ, screenshot gallery
- `assets/` — portrait (`profile.webp`, `profile-680.webp`), social image (`og-image.jpg`), project screenshots

Every page repeats the same `<head>` metadata pattern, header, mobile menu and footer. When you change navigation or footer links, change them on every page.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Hosted on Vercel; pushing to the default branch deploys. `vercel.json` only sets the sitemap content type.

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

- Add it to `sitemap.xml`
- Give it a unique `<title>` and meta description, a canonical URL, Open Graph/Twitter tags and a `BreadcrumbList` in its JSON-LD, like the existing pages
- Keep one `<h1>` and don't skip heading levels

## Content rules

Only publish numbers that are backed by real project work. The LCP metric is written as "Up to 40% LCP improvement" in general contexts and "40% LCP improvement" when it refers to Diviniti.
