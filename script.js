/* ============================================================
   SHADAB ALI — script.js  v6
   Theme, navigation, restrained scroll reveal, contact form,
   FAQ and screenshot gallery. No animation libraries.
   ============================================================ */

/* Content must never stay hidden: .reveal starts hidden only once JS runs,
   and the safety net below shows everything if initReveal never ran. */
document.documentElement.classList.add('js');
let revealReady = false;
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!revealReady) document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }, 1200);
});

/* ── EmailJS config (public key — restrict allowed origins in the EmailJS dashboard) ── */
const EJS_KEY = '9N3i_f0SElYf7cada';
const EJS_SERVICE = 'service_nvfzojd';
const EJS_TEMPLATE = 'template_rwslztc';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

document.addEventListener('DOMContentLoaded', () => {
  const safe = fn => {
    try { fn(); } catch (err) { console.warn('Portfolio init skipped:', err); }
  };

  safe(initTheme);
  safe(initNav);
  safe(initMobileMenu);
  safe(initScrollProgress);
  safe(initBackToTop);
  safe(initReveal);
  safe(initCopyEmail);
  safe(initContactForm);
  safe(initFAQ);
  safe(initProjectGallery);
  safe(initFooterYear);

  safe(() => {
    if (typeof emailjs !== 'undefined' && EJS_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EJS_KEY);
    }
  });
});

/* ══════════════════════════════════════════════════════════
   1. THEME  — light (default) / dark, localStorage
   ══════════════════════════════════════════════════════════ */
function initTheme() {
  const html = document.documentElement;
  const btns = document.querySelectorAll('.theme-toggle');

  // Restore saved theme or default to light (storage can throw in private mode)
  let saved = 'light';
  try { saved = localStorage.getItem('sa_theme') || 'light'; } catch {}
  html.setAttribute('data-theme', saved);

  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.classList.add('theme-transitioning');
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('sa_theme', next); } catch {}
      window.dispatchEvent(new CustomEvent('sa-theme-change', { detail: { theme: next } }));
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 320);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   2. NAV  — scrolled state + current page
   ══════════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  // Case-study pages belong to the Projects section
  const file = window.location.pathname.split('/').pop() || 'index.html';
  const page = file.startsWith('case-') ? 'projects.html' : file;
  document.querySelectorAll('.nav-links-desk a, .mob-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href === page) a.setAttribute('aria-current', 'page');
  });

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   3. MOBILE MENU  — focus moves in on open, back on close
   ══════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn   = document.querySelector('.hbg');
  const menu  = document.getElementById('mobMenu');
  const close = document.getElementById('mobClose');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    menu.removeAttribute('inert');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    (close || menu.querySelector('a'))?.focus();
  };
  const shut = (returnFocus = true) => {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    menu.setAttribute('inert', '');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (returnFocus) btn.focus();
  };

  menu.setAttribute('inert', '');
  btn.addEventListener('click', () => menu.classList.contains('open') ? shut() : open());
  close?.addEventListener('click', () => shut());
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => shut(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
  window.matchMedia('(min-width: 1024px)').addEventListener?.('change', e => { if (e.matches) shut(false); });
}

/* ══════════════════════════════════════════════════════════
   4. SCROLL PROGRESS BAR
   ══════════════════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const max      = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   5. BACK TO TOP
   ══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════════════════
   6. SCROLL REVEAL  — one short fade/rise per element
   ══════════════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  revealReady = true;
  if (!els.length) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   7. COPY EMAIL BUTTON
   ══════════════════════════════════════════════════════════ */
function initCopyEmail() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute('data-copy');
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   8. CONTACT FORM
   ══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();

  const name    = val('f-name');
  const email   = val('f-email');
  const service = val('f-service');
  const url     = val('f-url');
  const message = val('f-message');
  const budget   = val('f-budget');
  const timeline = val('f-timeline');
  const btn     = document.getElementById('submitBtn');
  const note    = document.getElementById('formNote');

  clearAlerts();

  if (!name)                                  return showAlert('Please enter your name.');
  if (!email || !/\S+@\S+\.\S+/.test(email)) return showAlert('Please enter a valid email address.');
  if (!message)                               return showAlert('Please write a message.');

  const orig = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled    = true;
  if (note) note.textContent = 'Sending…';

  if (typeof emailjs !== 'undefined' && EJS_KEY !== 'YOUR_PUBLIC_KEY') {
    try {
      await emailjs.send(EJS_SERVICE, EJS_TEMPLATE, {
        from_name:  name,
        from_email: email,
        service:    service || 'Not specified',
        store_url:  url     || 'Not provided',
        message: withProjectDetails(message, budget, timeline),
        budget:   budget   || 'Not specified',
        timeline: timeline || 'Not specified',
      });
      showSuccess(email);
    } catch {
      btn.textContent = orig;
      btn.disabled    = false;
      if (note) note.textContent = 'Something went wrong — try WhatsApp instead.';
    }
  } else {
    // Fallback: hand off to the visitor's email app — nothing is sent until they hit send there
    const subject = encodeURIComponent(`Portfolio Enquiry — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nService: ${service || 'N/A'}\nURL: ${url || 'N/A'}\n\n${withProjectDetails(message, budget, timeline)}`
    );
    window.location.href = `mailto:shadab18ali@gmail.com?subject=${subject}&body=${body}`;
    btn.textContent = orig;
    btn.disabled    = false;
    if (note) note.textContent = 'Your email app should open with this message — press send there to deliver it.';
  }
}

/* Budget/timeline are appended to the message so they arrive even if the
   EmailJS template only renders the original fields. */
function withProjectDetails(message, budget, timeline) {
  const extra = [
    budget   ? `Budget: ${budget}`     : '',
    timeline ? `Timeline: ${timeline}` : '',
  ].filter(Boolean).join('\n');
  return extra ? `${message}\n\n${extra}` : message;
}

function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function showSuccess(email) {
  const formBody = document.getElementById('contactForm');
  const success  = document.getElementById('formSuccess');
  const replyEl  = document.getElementById('replyEmail');
  if (formBody) formBody.style.display = 'none';
  if (replyEl)  replyEl.textContent    = email;
  if (success)  success.classList.add('show');
}

function showAlert(msg) {
  clearAlerts();
  const p = document.createElement('p');
  p.className = 'form-alert';
  p.textContent = '⚠ ' + msg;
  Object.assign(p.style, {
    fontFamily: 'var(--mono)', fontSize: '.72rem', color: 'var(--accent-text)',
    textTransform: 'uppercase', letterSpacing: '.1em',
    margin: '-.5rem 0 .65rem',
  });
  document.getElementById('submitBtn')?.before(p);
  setTimeout(() => p.remove(), 4500);
}

function clearAlerts() {
  document.querySelectorAll('.form-alert').forEach(el => el.remove());
}

/* ══════════════════════════════════════════════════════════
   9. FAQ ACCORDION (services page)
   ══════════════════════════════════════════════════════════ */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach((item, i) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q) return;
    if (a) {
      a.id = a.id || `faq-a-${i}`;
      q.setAttribute('aria-controls', a.id);
    }
    q.setAttribute('aria-expanded', String(item.classList.contains('open')));
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) {
          o.classList.remove('open');
          o.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !wasOpen);
      q.setAttribute('aria-expanded', String(!wasOpen));
    });
  });
}

/* ══════════════════════════════════════════════════════════
   10. FOOTER YEAR
   ══════════════════════════════════════════════════════════ */
function initFooterYear() {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
}

/* ══════════════════════════════════════════════════════════
   11. SCREENSHOT GALLERY MODAL
   ══════════════════════════════════════════════════════════ */
function initProjectGallery() {
  const items = Array.from(document.querySelectorAll('.project-img-wrap, .case-side-img, .cs-shots .shot'));
  if (!items.length) return;

  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Project image preview');
  modal.innerHTML = `
    <button class="gallery-close" type="button" aria-label="Close project preview">&times;</button>
    <button class="gallery-nav gallery-prev" type="button" aria-label="Previous project">‹</button>
    <figure class="gallery-frame">
      <img alt="Project preview" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
      <figcaption></figcaption>
    </figure>
    <button class="gallery-nav gallery-next" type="button" aria-label="Next project">›</button>
  `;
  document.body.appendChild(modal);

  const img = modal.querySelector('img');
  const caption = modal.querySelector('figcaption');
  const closeBtn = modal.querySelector('.gallery-close');
  const prevBtn = modal.querySelector('.gallery-prev');
  const nextBtn = modal.querySelector('.gallery-next');
  let activeIndex = 0;
  let opener = null;

  const makePreviewSvg = (title, url) => {
    const safeTitle = String(title || 'Project').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    const safeUrl = String(url || 'Project Preview').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ef3d2e"/><stop offset="0.55" stop-color="#171018"/><stop offset="1" stop-color="#d9a441"/></linearGradient>
        <radialGradient id="r" cx="30%" cy="18%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".28"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
        <filter id="shadow"><feDropShadow dx="0" dy="35" stdDeviation="30" flood-color="#000" flood-opacity=".35"/></filter>
      </defs>
      <rect width="1400" height="900" fill="url(#g)"/>
      <rect width="1400" height="900" fill="url(#r)"/>
      <g opacity=".22"><path d="M0 730 C260 560 470 860 760 650 S1160 520 1400 650 V900 H0Z" fill="#fff"/><circle cx="1130" cy="160" r="190" fill="#fff"/></g>
      <rect x="120" y="105" width="1160" height="690" rx="42" fill="#fff" opacity=".12" stroke="#fff" stroke-opacity=".32" filter="url(#shadow)"/>
      <rect x="178" y="170" width="1044" height="470" rx="28" fill="#0b0b12" opacity=".70"/>
      <text x="700" y="385" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="84" font-weight="800" fill="#fff">${safeTitle}</text>
      <text x="700" y="470" text-anchor="middle" font-family="monospace" font-size="30" letter-spacing="6" fill="#ffd5cf">${safeUrl}</text>
      <rect x="492" y="565" width="416" height="74" rx="37" fill="#ef3d2e"/>
      <text x="700" y="612" text-anchor="middle" font-family="monospace" font-size="24" font-weight="700" letter-spacing="4" fill="#fff">PROJECT PREVIEW</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const getData = (el) => {
    const card = el.closest('.case-study, .project-card') || el;
    const title = el.dataset.galleryTitle || card.querySelector('h2, h3')?.textContent?.trim() || 'Project Preview';
    const url = el.dataset.galleryUrl || card.querySelector('.project-url')?.textContent?.trim() || '';
    const realImg = el.querySelector('img');
    const fullSrc = (IS_MOBILE && el.dataset.gallerySrcMobile) || el.dataset.gallerySrc;
    const src = fullSrc || realImg?.currentSrc || realImg?.src || makePreviewSvg(title, url);
    return { title, url, src };
  };

  const openAt = (index) => {
    if (!modal.classList.contains('open')) opener = document.activeElement;
    activeIndex = (index + items.length) % items.length;
    const data = getData(items[activeIndex]);
    img.src = data.src;
    img.alt = `${data.title} project preview`;
    caption.textContent = data.url ? `${data.title} — ${data.url}` : data.title;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  };

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    opener?.focus?.({ preventScroll: true });
  };

  items.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open ${item.dataset.galleryTitle || 'project'} screenshot`);
    if (!item.querySelector('.gallery-hint')) {
      const hint = document.createElement('span');
      hint.className = 'gallery-hint';
      hint.textContent = 'View Project';
      item.appendChild(hint);
    }
    item.addEventListener('click', () => openAt(index));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAt(index);
      }
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => openAt(activeIndex - 1));
  nextBtn.addEventListener('click', () => openAt(activeIndex + 1));
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  window.addEventListener('keydown', event => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') openAt(activeIndex - 1);
    if (event.key === 'ArrowRight') openAt(activeIndex + 1);
  });
}
