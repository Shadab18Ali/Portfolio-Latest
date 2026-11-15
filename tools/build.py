#!/usr/bin/env python3
"""Build the static site.

Every page shares the same <head> metadata, header, mobile menu and footer, and
the project cards and case-study pages all come from src/data/projects.json.
This script writes plain HTML files to the repository root, so the site still
deploys as static files with no build step on Vercel.

    python3 tools/build.py

Edit:
  src/data/site.json      site URL, contact links, page titles/descriptions, navigation
  src/data/projects.json  projects: card fields + case-study content
  src/pages/<page>.html   the <main> content of each regular page

Markers inside src/pages files:
  <!-- @cards:featured -->   cards for projects.json "featured", in that order
  <!-- @cards:shopify -->    cards for every project in group "shopify"
  <!-- @cards:webapp -->     cards for every project in group "webapp"
  <!-- @cards:wordpress -->  cards for every project in group "wordpress"
  {{resume}} {{whatsapp}} {{linkedin}} {{github}} {{email}}  values from site.json
"""
import html
import json
import os
import re
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
SITE = json.load(open(os.path.join(SRC, 'data', 'site.json'), encoding='utf-8'))
DATA = json.load(open(os.path.join(SRC, 'data', 'projects.json'), encoding='utf-8'))
PROJECTS = DATA['projects']
URL = SITE['url'].rstrip('/')
TODAY = date.today().isoformat()

ICON = {
    'linkedin': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
    'github': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.78 10.78.57.1.78-.25.78-.55v-2.1c-3.17.69-3.84-1.36-3.84-1.36-.52-1.3-1.27-1.65-1.27-1.65-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.53-.29-5.19-1.27-5.19-5.63 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.21 5.62.41.35.77 1.04.77 2.1v3.11c0 .3.2.66.79.55A11.03 11.03 0 0 0 23 11.52C23 5.24 18.27.5 12 .5Z"/></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>',
    'wa': '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
    'sun': '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    'moon': '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
}


def esc(text):
    return html.escape(text, quote=True)


def page_url(file):
    return f'{URL}/' if file == 'index.html' else f'{URL}/{file}'


# ── <head> ────────────────────────────────────────────────────────────────
PERSON = {
    '@type': 'Person', '@id': f'{URL}/#person', 'name': SITE['name'], 'jobTitle': SITE['jobTitle'],
    'url': f'{URL}/', 'image': f'{URL}/assets/portrait-900.webp', 'email': f"mailto:{SITE['email']}",
    'telephone': SITE['phone'],
    'address': {'@type': 'PostalAddress', 'addressLocality': 'Delhi', 'addressCountry': 'IN'},
    'worksFor': {'@type': 'Organization', 'name': SITE['worksFor']},
    'alumniOf': {'@type': 'CollegeOrUniversity', 'name': SITE['alumniOf']},
    'knowsAbout': SITE['knowsAbout'], 'sameAs': [SITE['linkedin'], SITE['github']],
}


def schema(file, crumbs, extra=None):
    graph = [PERSON]
    if file == 'index.html':
        graph.append({'@type': 'WebSite', '@id': f'{URL}/#website', 'url': f'{URL}/',
                      'name': f"{SITE['name']}, {SITE['jobTitle']}", 'inLanguage': 'en',
                      'publisher': {'@id': f'{URL}/#person'}})
    if crumbs:
        items = [('Home', f'{URL}/')] + crumbs
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(items)]})
    if extra:
        graph.append(extra)
    return json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=1)


def head(file, title, desc, crumbs, og_type='website', extra_schema=None, extra_head=''):
    og_image = f"{URL}/{SITE['ogImage']}"
    return f'''<!DOCTYPE html>
<html lang="en-IN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="author" content="{esc(SITE['name'])}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#fff8f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#090a14" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="{page_url(file)}">

<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{esc(SITE['name'])}, {esc(SITE['jobTitle'])}">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="{page_url(file)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(SITE['name'])}, {esc(SITE['jobTitle'])}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{og_image}">

<script type="application/ld+json">
{schema(file, crumbs, extra_schema)}
</script>

<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/bebas-neue-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
<script src="script.js" defer></script>
{extra_head}
</head>
'''


# ── Header / footer ───────────────────────────────────────────────────────
def header():
    desk = '\n'.join(f'    <a href="{h}">{n}</a>' for h, n in SITE['nav'])
    mob = '\n'.join(f'  <a href="{h}">{n}</a>' for h, n in SITE['mobileNav'])
    wa = SITE['whatsapp']
    return f'''<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
<button class="back-to-top" id="backToTop" type="button" aria-label="Back to top"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg></button>
<a href="{wa}" target="_blank" rel="noopener" class="wa-float" aria-label="Chat on WhatsApp (opens in a new tab)">{ICON['wa']}</a>

<nav id="nav" aria-label="Main navigation">
  <a href="index.html" class="logo" aria-label="Shadab Ali, home">shadab <span>ali.</span></a>
  <div class="nav-links-desk">
{desk}
  </div>
  <div class="nav-right">
    <div class="nav-social">
      <a href="{SITE['linkedin']}" target="_blank" rel="noopener" aria-label="LinkedIn (opens in a new tab)">{ICON['linkedin']}</a>
      <a href="{SITE['github']}" target="_blank" rel="noopener" aria-label="GitHub (opens in a new tab)" class="gh">{ICON['github']}</a>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle light and dark theme">
      {ICON['sun']}
      {ICON['moon']}
    </button>
    <a href="contact.html" class="btn btn-primary nav-cta">Hire Me</a>
    <button class="hbg" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobMenu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="mob-menu" id="mobMenu" role="dialog" aria-modal="true" aria-label="Site menu">
  <button class="mob-close" id="mobClose" type="button" aria-label="Close menu">✕</button>
{mob}
  <div class="mob-actions">
    <a href="contact.html" class="btn btn-primary">Hire Me</a>
    <a href="{wa}" target="_blank" rel="noopener" class="btn btn-wa">{ICON['wa']} WhatsApp</a>
  </div>
  <div class="mob-social">
    <a href="{SITE['linkedin']}" target="_blank" rel="noopener">LinkedIn</a>
    <a href="{SITE['github']}" target="_blank" rel="noopener">GitHub</a>
    <a href="{SITE['resume']}" target="_blank" rel="noopener">Résumé</a>
  </div>
</div>

<main id="main">
'''


def footer():
    work = '\n'.join(f'          <a href="{PROJECTS[s]["file"]}">{PROJECTS[s]["name"]}</a>' for s in DATA['order'])
    return f'''</main>

<footer>
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">shadab <span>ali.</span></div>
        <p>{SITE['jobTitle']} building Shopify stores, web apps, APIs, headless commerce, integrations and e-commerce automation. Based in Delhi, India.</p>
        <div class="footer-social">
          <a href="{SITE['linkedin']}" target="_blank" rel="noopener" aria-label="LinkedIn (opens in a new tab)">{ICON['linkedin']}</a>
          <a href="{SITE['github']}" target="_blank" rel="noopener" aria-label="GitHub (opens in a new tab)">{ICON['github']}</a>
          <a href="mailto:{SITE['email']}" aria-label="Email {SITE['email']}">{ICON['mail']}</a>
        </div>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h2 class="footer-h">Work</h2>
          <a href="projects.html">All Projects</a>
{work}
        </div>
        <div class="footer-col">
          <h2 class="footer-h">Site</h2>
          <a href="services.html">Services</a>
          <a href="about.html">About</a>
          <a href="experience.html">Experience</a>
          <a href="skills.html">Skills</a>
          <a href="work-with-me.html">Work With Me</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer-col">
          <h2 class="footer-h">Connect</h2>
          <a href="{SITE['linkedin']}" target="_blank" rel="noopener">LinkedIn</a>
          <a href="{SITE['github']}" target="_blank" rel="noopener">GitHub</a>
          <a href="mailto:{SITE['email']}">Email</a>
          <a href="{SITE['whatsapp']}" target="_blank" rel="noopener">WhatsApp</a>
          <a href="{SITE['resume']}" target="_blank" rel="noopener">Résumé</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© <span data-year>{date.today().year}</span> Shadab Ali</span>
      <span>{SITE['jobTitle']} · Delhi, India</span>
    </div>
  </div>
</footer>
</body>
</html>
'''


# ── Project cards ─────────────────────────────────────────────────────────
def card(slug):
    p = PROJECTS[slug]
    c = p['card']
    tags = ''.join(f'<li><span>{esc(t)}</span></li>' for t in c['tags'])
    media = c['media']
    return f'''      <article class="feature-card reveal">
        <div class="feature-body">
          <p class="feature-built"><span>Built in</span> <strong>{esc(p['builtIn'])}</strong></p>
          <h3>{esc(p['name'])}</h3>
          <p class="feature-kicker">{esc(p['domain'])}</p>
          <p class="feature-role"><span>Owned</span> {esc(c['owned'])}</p>
          <p class="feature-role"><span>Changed</span> {esc(c['changed'])}</p>
          <ul class="project-tags" aria-label="Technologies">{tags}</ul>
          <div class="feature-actions">
            <a href="{p['file']}" class="btn btn-primary">View Case Study</a>
            <a href="{p['url']}" target="_blank" rel="noopener" class="btn btn-ghost" aria-label="View live project: {esc(p['domain'])} (opens in a new tab)">View Live Project</a>
          </div>
        </div>
        <figure class="feature-media">
          <a class="fm-link" href="{p['file']}" tabindex="-1" aria-hidden="true"><span class="fm-desktop"><img src="{esc(media['src'])}" alt="" width="1200" height="750" loading="lazy" decoding="async"></span></a>
          <figcaption class="fm-cap">Screenshot · {esc(media['caption'])}</figcaption>
        </figure>
      </article>
'''


def slug_img(slug):
    return slug  # image files are named after the project slug


def cards(which):
    if which == 'featured':
        slugs = DATA['featured']
    else:
        slugs = [s for s in DATA['order'] if PROJECTS[s]['group'] == which]
    return '    <div class="feature-list">\n' + '\n'.join(card(s) for s in slugs) + '    </div>\n'


# ── Case-study page ───────────────────────────────────────────────────────
def section_html(sec):
    out = []
    if sec.get('lead'):
        out.append(f'          <p class="cs-lead">{sec["lead"]}</p>')
    for para in sec.get('paras', []):
        out.append(f'          <p>{para}</p>')
    if sec.get('items'):
        out.append('          <ul>\n' + '\n'.join(f'            <li>{i}</li>' for i in sec['items']) + '\n          </ul>')
    if sec.get('steps'):
        steps = '\n'.join(f'            <div class="cs-step"><div><h3>{t}</h3><p>{d}</p></div></div>' for t, d in sec['steps'])
        out.append(f'          <div class="cs-steps">\n{steps}\n          </div>')
    if sec.get('code'):
        out.append(f'          <p class="cs-code-note">{sec["code"]["note"]}</p>\n<pre class="cs-code"><code>{sec["code"]["html"]}</code></pre>')
    if sec.get('quote'):
        q = sec['quote']
        out.append(f'          <figure class="cs-callout">\n            <blockquote><p>“{q["text"]}”</p></blockquote>\n'
                   f'            <figcaption class="cs-code-note cs-quote-by">{q["by"]}</figcaption>\n          </figure>')
    return '\n'.join(out)


def case_main(slug, index):
    p = PROJECTS[slug]
    order = DATA['order']
    nxt = PROJECTS[order[(order.index(slug) + 1) % len(order)]]
    built_in = p['builtIn']
    facts = '\n'.join(f'      <div><dt>{esc(k)}</dt><dd>{esc(v)}</dd></div>' for k, v in p['facts'])
    metrics = '\n'.join(
        f'      <div class="cs-metric{" is-primary" if m.get("primary") else ""} reveal" role="listitem"><strong>{esc(m["value"])}</strong><span>{esc(m["label"])}</span></div>'
        for m in p['metrics'])
    metrics_block = (f'    <div class="cs-metrics" role="list" aria-label="Key facts">\n{metrics}\n    </div>\n'
                     if p.get('metrics') else '')
    glance_block = ''
    g = p.get('glance')
    if g:
        link = g.get('link')
        link_html = ''
        if link:
            link_html = (f'\n      <p class="cs-glance-link"><a class="inline-link" href="{esc(link["url"])}" target="_blank" rel="noopener">'
                         f'{esc(link["label"])}<span class="sr-only"> (opens in a new tab)</span></a></p>')
        glance_block = f'''    <section class="cs-glance" aria-labelledby="glance-title">
      <h2 class="sr-only" id="glance-title">At a glance</h2>
      <dl class="cs-glance-list">
        <div><dt>Problem</dt><dd>{esc(g['problem'])}</dd></div>
        <div><dt>My contribution</dt><dd>{esc(g['contribution'])}</dd></div>
        <div><dt>Outcome</dt><dd>{esc(g['outcome'])}</dd></div>
      </dl>{link_html}
    </section>
'''
    sections = []
    for sec in p['sections']:
        sections.append(f'''      <section class="cs-section" aria-labelledby="{sec['id']}">
        <h2 id="{sec['id']}">{sec['title']}</h2>
        <div class="cs-content">
{section_html(sec)}
        </div>
      </section>''')
    stack = ''.join(f'<li>{esc(t)}</li>' for t in p['stack'])
    sections.append(f'''      <section class="cs-section" aria-labelledby="stack">
        <h2 id="stack">Technology</h2>
        <div class="cs-content">
          <ul class="cs-stack">{stack}</ul>
        </div>
      </section>''')
    img = slug_img(slug)
    sections.append(f'''      <section class="cs-section" aria-labelledby="shots">
        <h2 id="shots">Screenshots</h2>
        <div class="cs-content cs-wide">
          <div class="cs-shots">
            <figure>
              <div class="shot shot-desktop" data-gallery-title="{esc(p['name'])}, desktop" data-gallery-url="{p['domain']}" data-gallery-src="assets/projects/{img}-desktop.webp">
                <img src="assets/projects/{img}-desktop-thumb.webp" alt="{esc(p['name'])} homepage on desktop" width="1200" height="750" loading="lazy" decoding="async">
              </div>
              <figcaption>Desktop · select to view larger</figcaption>
            </figure>
            <figure>
              <div class="shot shot-mobile" data-gallery-title="{esc(p['name'])}, mobile" data-gallery-url="{p['domain']}" data-gallery-src="assets/projects/{img}-mobile.webp">
                <img src="assets/projects/{img}-mobile-thumb.webp" alt="{esc(p['name'])} homepage on mobile" width="720" height="1280" loading="lazy" decoding="async">
              </div>
              <figcaption>Mobile</figcaption>
            </figure>
          </div>
        </div>
      </section>''')
    if p.get('takeaway'):
        sections.append(f'''      <section class="cs-section" aria-labelledby="takeaway">
        <h2 id="takeaway">Takeaway</h2>
        <div class="cs-content">
          <p>{p['takeaway']}</p>
        </div>
      </section>''')
    lc = p.get('liveCheck')
    if lc:
        check = {'id': 'live-check', 'title': 'Checked on the Live Site', 'paras': lc.get('paras', []), 'items': lc.get('items', [])}
        if lc.get('quote'):
            check['quote'] = lc['quote']
        sections.append(f'''      <section class="cs-section" aria-labelledby="{check['id']}">
        <h2 id="{check['id']}">{check['title']}</h2>
        <div class="cs-content">
{section_html(check)}
        </div>
      </section>''')
    extra_links = ''.join(
        f'\n          <p><a class="inline-link" href="{esc(l["url"])}" target="_blank" rel="noopener">{esc(l["label"])}'
        f'<span class="sr-only"> (opens in a new tab)</span></a></p>' for l in p.get('liveLinks', []))
    sections.append(f'''      <section class="cs-section" aria-labelledby="live">
        <h2 id="live">Live Website</h2>
        <div class="cs-content">
          <p><a class="inline-link" href="{p['url']}" target="_blank" rel="noopener">{p['domain']}</a></p>{extra_links}
        </div>
      </section>''')
    return f'''<div class="page-hero cs-hero">
  <div class="page-hero-inner">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span class="sep" aria-hidden="true">/</span><a href="projects.html">Projects</a><span class="sep" aria-hidden="true">/</span><span class="current" aria-current="page">{esc(p['name'])}</span>
    </nav>
    <p class="page-hero-num">Case study {index:02d} · Built in {esc(built_in)}</p>
    <h1>{p['hero']['h1']}</h1>
    <p class="page-hero-desc">{p['hero']['lede']}</p>
    <dl class="cs-facts">
{facts}
    </dl>
    <div class="cs-hero-actions">
      <a href="contact.html" class="btn btn-primary">Start a Similar Project</a>
      <a href="{p['url']}" target="_blank" rel="noopener" class="btn btn-outline">View Live Project</a>
    </div>
  </div>
</div>

<section class="cs-body" aria-label="{esc(p['name'])} case study">
  <div class="container">
{glance_block}{metrics_block}    <div class="cs-sections">
{chr(10).join(sections)}
    </div>
  </div>
</section>

<section class="home-section" aria-labelledby="next-title">
  <div class="container">
    <div class="section-eyebrow">Keep reading</div>
    <h2 class="section-title" id="next-title">Next <em>Project</em></h2>
    <div class="cs-next">
      <a class="cs-next-card" href="{nxt['file']}">
        <span>{esc(nxt['card']['kicker'])}</span>
        <strong>{esc(nxt['name'])}</strong>
        <p>{esc(nxt['card']['position'])}.</p>
      </a>
      <a class="cs-next-card" href="contact.html">
        <span>Similar problem?</span>
        <strong>Start a Project</strong>
        <p>Tell me what you're building or what needs fixing. I reply within 24 hours.</p>
      </a>
    </div>
  </div>
</section>
'''


# ── How I work (shared by home and services) ──────────────────────────────
PROCESS = [
    ('Discover', 'We go through the store, the goal and what isn\'t working today.'),
    ('Plan', 'A written scope with priorities, timeline and cost before any code.'),
    ('Build', 'Development in stages, with regular check-ins instead of one big handoff.'),
    ('Test', 'Cross-device QA, speed checks and tracking verification.'),
    ('Launch', 'Go live, then check the live store, forms and tracking straight away.'),
    ('Optimise', 'Measure what changed and keep fixing what the data points to.'),
]


def process():
    steps = '\n'.join(f'      <li class="pf-step reveal"><span class="pf-num">{i:02d}</span><h3>{t}</h3><p>{d}</p></li>'
                      for i, (t, d) in enumerate(PROCESS, 1))
    return f'    <ol class="process-flow" aria-label="Project process">\n{steps}\n    </ol>\n'


# ── Write files ───────────────────────────────────────────────────────────
def fill(text):
    for key in ('resume', 'whatsapp', 'linkedin', 'github', 'email', 'phoneLabel'):
        text = text.replace('{{' + key + '}}', SITE[key])
    text = text.replace('<!-- @process -->\n', process())
    return re.sub(r'<!-- @cards:(\w+) -->\n?', lambda m: cards(m.group(1)), text)


def write(file, content):
    with open(os.path.join(ROOT, file), 'w', encoding='utf-8') as fh:
        fh.write(content)
    print('built', file)


def build():
    sitemap = []
    for file, meta in SITE['pages'].items():
        main = open(os.path.join(SRC, 'pages', file), encoding='utf-8').read().strip('\n') + '\n'
        crumbs = [(meta['crumb'], page_url(file))] if meta.get('crumb') else []
        out = (head(file, meta['title'], meta['description'], crumbs, meta.get('ogType', 'website'),
                    extra_head=meta.get('extraHead', '')) + header() + fill(main) + footer())
        write(file, out)
        sitemap.append((file, meta.get('priority', '0.5')))
    for i, slug in enumerate(DATA['order'], 1):
        p = PROJECTS[slug]
        crumbs = [('Projects', page_url('projects.html')), (p['name'], page_url(p['file']))]
        work = {'@type': 'CreativeWork', 'name': f"{p['name']} case study", 'url': page_url(p['file']),
                'about': p['card']['position'], 'author': {'@id': f'{URL}/#person'},
                'keywords': ', '.join(p['stack'])}
        out = (head(p['file'], p['seo']['title'], p['seo']['description'], crumbs, 'article', work)
               + header() + case_main(slug, i) + footer())
        write(p['file'], out)
        sitemap.append((p['file'], '0.8' if p['group'] == 'shopify' else '0.6'))

    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for file, prio in sitemap:
        xml.append(f'  <url>\n    <loc>{page_url(file)}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>{prio}</priority>\n  </url>')
    xml.append('</urlset>')
    write('sitemap.xml', '\n'.join(xml) + '\n')
    write('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {URL}/sitemap.xml\n')


if __name__ == '__main__':
    build()
