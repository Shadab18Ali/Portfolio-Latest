# Shadab Ali — Portfolio

Personal portfolio for Shadab Ali, Shopify & WordPress developer.
Live at <https://shadab-ali-portfolio.vercel.app/>.

## Stack

Plain static site — no build step.

- `*.html` — one file per page (home, about, experience, skills, services, projects, work-with-me, contact)
- `style.css` — all styles, light/dark themes via `[data-theme]`
- `script.js` — theme toggle, nav, animations (GSAP + ScrollTrigger from cdnjs), project gallery, contact form
- `assets/` — profile photo and project screenshots

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Hosted on Vercel; pushing to the default branch deploys. `vercel.json` only sets the sitemap content type.

## Contact form

The form on `contact.html` sends through [EmailJS](https://www.emailjs.com/) using the keys at the top of `script.js`.
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
- Give it a `<title>`, meta description, canonical URL and Open Graph tags like the existing pages
