/* ============================================================
   SHADAB ALI — script.js  v6
   Theme, navigation, restrained scroll reveal, contact form,
   FAQ and screenshot gallery, plus the homepage effects: line
   reveal, layered parallax, card arc carousel and the 3D model.
   No animation libraries; the 3D model is its own lazy-loaded file.
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
  safe(initLines);
  safe(initParallax);
  safe(initArc);
  // Replaced the abstract knot with portrait-led scenes in each homepage section.
  safe(initPortfolioScenes);
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
  menu.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const items = Array.from(menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'))
      .filter(el => !el.hidden && el.getAttribute('tabindex') !== '-1');
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
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
  const service = form.querySelector('#f-service');
  const projectFields = form.querySelector('#projectScopeFields');
  const budget = form.querySelector('#f-budget');
  const timeline = form.querySelector('#f-timeline');
  const syncInquiryFields = () => {
    const isFullTime = service?.value === 'Full-time opportunity';
    if (projectFields) projectFields.hidden = Boolean(isFullTime);
    if (isFullTime) {
      if (budget) budget.value = '';
      if (timeline) timeline.value = '';
    }
  };
  service?.addEventListener('change', syncInquiryFields);
  syncInquiryFields();
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
        ...(service === 'Full-time opportunity' ? {} : {
          budget: budget || 'Not specified',
          timeline: timeline || 'Not specified',
        }),
      });
      showSuccess(email);
    } catch {
      btn.textContent = orig;
      btn.disabled    = false;
      if (note) note.textContent = 'Something went wrong. Please try WhatsApp instead.';
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
    if (note) note.textContent = 'Your email app should open with this message. Press send there to deliver it.';
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

/* ══════════════════════════════════════════════════════════
   12. LINE-BY-LINE TEXT REVEAL
   Every word goes in a clipping mask. We work out which line each word sits
   on, then slide the words up line by line as the text scrolls into view.
   Inline markup (em, strong, links) is kept, and the text is plain and visible
   when JavaScript or animation is off.
   ══════════════════════════════════════════════════════════ */
const LINE_TARGETS = [
  '.hero-h1', '.hero-desc', '.page-hero h1', '.page-hero-desc',
  'h2.section-title', '.section-lead', '.split-cta-head h2', '.split-cta-head p',
].join(', ');

function initLines() {
  if (REDUCED || !('IntersectionObserver' in window)) return;
  const els = Array.from(document.querySelectorAll(LINE_TARGETS));
  if (!els.length) return;

  // Hidden (CSS) until split, so unsplit text never flashes. This replaces the plain fade.
  els.forEach(el => { el.classList.remove('reveal'); el.classList.add('lines'); });

  // Safety net: text must never stay hidden.
  const showAll = () => els.forEach(el => el.classList.add('is-split', 'in'));
  const net = setTimeout(() => { if (els.some(el => !el.classList.contains('is-split'))) showAll(); }, 2500);

  const wrapWords = root => {
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const mask = document.createElement('span');
            const inner = document.createElement('span');
            mask.className = 'lw';
            inner.textContent = part;
            mask.appendChild(inner);
            frag.appendChild(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !/^(BR|SVG|IMG|SCRIPT|STYLE)$/i.test(child.tagName) && !child.classList.contains('lw')) {
          walk(child);
        }
      });
    };
    walk(root);
  };

  // Give each word the number of the line it sits on, used to stagger the delay.
  const measure = el => {
    let line = -1, lineMid = null;
    el.querySelectorAll('.lw').forEach(word => {
      const r = word.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (lineMid === null || Math.abs(mid - lineMid) > r.height * 0.55) { line++; lineMid = mid; }
      word.style.setProperty('--l', line);
    });
  };

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      // Also show text the visitor has already scrolled past (for example after a jump down the page).
      if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  // Wait for the fonts, because line breaks depend on them.
  const fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))])
    : Promise.resolve();
  fontsReady.then(() => {
    els.forEach(el => { wrapWords(el); measure(el); el.classList.add('is-split'); io.observe(el); });
    clearTimeout(net);
  }).catch(showAll);

  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => els.forEach(el => { if (el.classList.contains('is-split')) measure(el); }), 150);
  });
}

/* ══════════════════════════════════════════════════════════
   13. LAYERED PARALLAX
   Elements with data-depth inside a [data-parallax] block move at their own
   speed. "top" blocks (the hero) also follow the mouse. Uses the CSS
   `translate` property so it never fights with an element's own transform.
   ══════════════════════════════════════════════════════════ */
function initParallax() {
  if (REDUCED) return;
  const roots = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!roots.length) return;

  const blocks = roots.map(root => ({
    root,
    top: root.dataset.parallax === 'top',
    items: Array.from(root.querySelectorAll('[data-depth]')).map(el => ({ el, depth: parseFloat(el.dataset.depth) || 0 })),
  }));
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let tx = 0, ty = 0, mx = 0, my = 0, queued = false;
  const live = new Set(roots);

  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  const frame = () => {
    queued = false;
    mx += (tx - mx) * 0.1;
    my += (ty - my) * 0.1;
    const vh = window.innerHeight;
    blocks.forEach(({ root, top, items }) => {
      if (!live.has(root)) return;
      const rect = root.getBoundingClientRect();
      const shift = top ? -rect.top : -(rect.top + rect.height / 2 - vh / 2);
      items.forEach(({ el, depth }) => {
        const x = top ? mx * depth * 90 : 0;
        const y = shift * depth + (top ? my * depth * 60 : 0);
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
    });
    if (Math.abs(tx - mx) > 0.002 || Math.abs(ty - my) > 0.002) schedule();
  };

  if ('IntersectionObserver' in window) {
    live.clear();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
      schedule();
    }, { rootMargin: '120px 0px' });
    roots.forEach(r => io.observe(r));
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (mouse) {
    window.addEventListener('pointermove', e => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    }, { passive: true });
    document.addEventListener('mouseleave', () => { tx = ty = 0; schedule(); });
  }
  schedule();
}

/* ══════════════════════════════════════════════════════════
   14. CARD ARC CAROUSEL
   Cards sit on an arc and rotate around it. Arrow buttons, dots, drag or
   swipe, and the left/right arrow keys all move it. Only the front card's
   links are in the tab order. Without JavaScript it is a plain scroll row.
   ══════════════════════════════════════════════════════════ */
function initArc() {
  document.querySelectorAll('[data-arc]').forEach(setupArc);
}

function setupArc(root) {
  const stage = root.querySelector('.arc-stage');
  const cards = Array.from(root.querySelectorAll('.arc-card'));
  const dots = Array.from(root.querySelectorAll('.arc-dot'));
  const status = root.querySelector('[data-arc-status]');
  const n = cards.length;
  if (!stage || n < 2) return;

  root.classList.add('is-arc');
  // Links and images would start a native browser drag and cancel our own drag.
  stage.querySelectorAll('a, img').forEach(el => el.setAttribute('draggable', 'false'));
  const names = cards.map(c => c.querySelector('h3')?.textContent.trim() || '');
  const wrap = d => (((d + n / 2) % n) + n) % n - n / 2;   // shortest way round the loop
  const norm = i => ((i % n) + n) % n;

  let geo, spacing;
  const measureArc = () => {
    const small = root.clientWidth < 640;
    geo = small ? { R: 480, step: 0.49, drop: 0.55, tilt: 0.9 } : { R: 920, step: 0.35, drop: 0.55, tilt: 1 };
    spacing = geo.R * Math.sin(geo.step);                  // px between neighbouring cards
  };
  measureArc();

  let pos = 0, target = 0, active = -1, raf = 0, drag = null, suppressClick = false;

  const render = () => {
    cards.forEach((card, i) => {
      const d = wrap(i - pos);
      const a = Math.abs(d);
      const th = d * geo.step;
      const x = geo.R * Math.sin(th);
      const y = geo.R * (1 - Math.cos(th)) * geo.drop;
      const scale = 1 - Math.min(a, 2.5) * 0.085;
      const opacity = a <= 1 ? 1 - 0.2 * a : a <= 2 ? 0.8 - 0.4 * (a - 1) : Math.max(0, (0.4 * (2.5 - a)) / 0.5);
      card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((th * geo.tilt * 180) / Math.PI).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = String(Math.round(100 - a * 10));
      card.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
    });
  };

  const setActive = i => {
    if (i === active) return;
    const first = active === -1;
    active = i;
    cards.forEach((card, k) => {
      const on = k === i;
      card.classList.toggle('is-active', on);
      card.querySelectorAll('.arc-actions a').forEach(a => { a.tabIndex = on ? 0 : -1; });
    });
    dots.forEach((dot, k) => dot.setAttribute('aria-current', k === i ? 'true' : 'false'));
    if (status && !first) status.textContent = `Project ${i + 1} of ${n}: ${names[i]}`;
  };

  const tick = () => {
    raf = 0;
    if (!drag) {
      pos += REDUCED ? target - pos : (target - pos) * 0.14;
      if (Math.abs(target - pos) < 0.002) pos = target;
    }
    render();
    setActive(norm(Math.round(pos)));
    if (drag || pos !== target) raf = requestAnimationFrame(tick);
  };
  const go = t => { target = t; if (!raf) raf = requestAnimationFrame(tick); };
  const step = dir => go(Math.round(target) + dir);
  const goTo = i => go(Math.round(target) + Math.round(wrap(i - norm(Math.round(target)))));

  root.querySelector('.arc-prev')?.addEventListener('click', () => step(-1));
  root.querySelector('.arc-next')?.addEventListener('click', () => step(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // Drag or swipe
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, start: pos, moved: 0, lastX: e.clientX, lastT: performance.now(), v: 0 };
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved <= 6) return;
    if (!stage.classList.contains('is-dragging')) {
      stage.classList.add('is-dragging');
      try { stage.setPointerCapture(e.pointerId); } catch {}
    }
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
    drag.lastX = e.clientX;
    drag.lastT = now;
    pos = drag.start - dx / spacing;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    stage.classList.remove('is-dragging');
    if (d.moved > 6) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 60);
      const carry = Math.max(-1, Math.min(1, (d.v * 90) / spacing)); // a quick flick carries on, by at most one card
      go(Math.round(pos - carry));
    }
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // A click on a side card brings it to the front instead of following its link.
  stage.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    const card = e.target.closest('.arc-card');
    if (!card) return;
    const i = cards.indexOf(card);
    if (i !== active) { e.preventDefault(); goTo(i); }
  }, true);

  window.addEventListener('resize', () => { measureArc(); render(); });
  render();
  setActive(0);
}

/* ══════════════════════════════════════════════════════════
   15. FIXED 3D MODEL
   assets/js/model3d.js (three.js, about 125 KB gzipped) loads only on wide
   screens, when motion is allowed, data saver is off, and the page has
   finished loading. Without WebGL it quietly does nothing.
   ══════════════════════════════════════════════════════════ */
function initModel3D() {
  const host = document.getElementById('model3d');
  if (!host) return;
  const wide = window.matchMedia('(min-width: 900px)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (REDUCED || !wide || saveData) return;

  const load = () => import('./assets/js/model3d.js')
    .then(mod => { if (mod.start(host)) document.body.classList.add('has-model3d'); })
    .catch(err => console.warn('3D model skipped:', err));
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 4000 }) : setTimeout(load, 1500));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

/* Personal 3D scenes: geometric motion surrounds, never edits, the portrait. */
function initPortfolioScenes() {
  const hero=document.querySelector('#hero .hero-visual');
  if(hero&&!hero.querySelector('.sa-avatar-stage')){
    const stage=document.createElement('div'); stage.className='sa-avatar-stage'; stage.setAttribute('aria-hidden','true');
    stage.innerHTML='<span class="sa-orbit-ring"></span><span class="sa-orbit-ring ring-two"></span><span class="sa-orbit-node node-one"></span><span class="sa-orbit-node node-two"></span><span class="sa-hero-arrow">↗</span>';
    hero.appendChild(stage);
  }
  const scenes=[
    ['#work','projects','01 / PROJECTS','Digital products','assets/portfolio-3d-poses/02-projects-crossed-arms.png'],
    ['#impact','build','02 / WHAT I BUILD','Full-stack systems','assets/portfolio-3d-poses/03-what-i-build-wave.png'],
    ['#services-preview','services','03 / SERVICES','Shopify & web','assets/portfolio-3d-poses/04-services-presenting.png'],
    ['#about-preview','about','05 / ABOUT','The developer','assets/portfolio-3d-poses/05-about-seated.png']
  ];
  const makeScene=(host,type,kicker,label,imagePath)=>{
    if(!host||host.querySelector('.sa-figure-scene'))return;
    const art=document.createElement('div'); art.className='sa-figure-scene'; art.dataset.scene=type; art.setAttribute('aria-hidden','true');
    art.innerHTML='<span class="sa-figure-grid"></span><span class="sa-figure-orbit orbit-a"></span><span class="sa-figure-orbit orbit-b"></span><span class="sa-figure-panel panel-a"></span><span class="sa-figure-panel panel-b"></span><span class="sa-figure-arrow">↗</span><span class="sa-figure-label">'+kicker+'<b>'+label+'</b></span><span class="sa-figure-photo"><img src="'+imagePath+'" alt="" loading="lazy" decoding="async"></span><span class="sa-figure-node node-a"></span><span class="sa-figure-node node-b"></span>';
    host.appendChild(art);
  };
  scenes.forEach(([sel,type,kicker,label,imagePath])=>{
    const section=document.querySelector(sel),host=section&&(section.querySelector('.container')||section);
    makeScene(host,type,kicker,label,imagePath);
  });
  document.querySelectorAll('.final-cta .container').forEach(host=>makeScene(host,'contact','06 / CONTACT','Let’s build','assets/portfolio-3d-poses/06-contact-welcome.png'));
  const arts=document.querySelectorAll('.sa-figure-scene');
  if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('is-visible',e.isIntersecting);e.target.classList.toggle('is-active',e.isIntersecting);}),{threshold:.18});arts.forEach(a=>io.observe(a));}
  else arts.forEach(a=>a.classList.add('is-visible','is-active'));
  if(REDUCED||IS_MOBILE||!hero)return;
  const wrap=hero.querySelector('.hero-photo-wrap'); if(!wrap)return;
  let rect=null,raf=0,point=null;
  hero.addEventListener('pointermove',e=>{
    rect=rect||hero.getBoundingClientRect(); point={x:(e.clientX-rect.left)/rect.width-.5,y:(e.clientY-rect.top)/rect.height-.5};
    if(raf)return; raf=requestAnimationFrame(()=>{raf=0;if(!point)return;const x=point.x,y=point.y;wrap.style.transform='translate3d('+(x*12).toFixed(1)+'px,'+(y*9).toFixed(1)+'px,0) rotateY('+(x*-5).toFixed(2)+'deg) rotateX('+(y*3).toFixed(2)+'deg)';});
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{point=null;rect=null;wrap.style.transform='';});
}