/* ============================================================
   SHADAB ALI — script.js  v5  (Clean · Complete · No debt)
   ============================================================ */


/* Safety: content should never stay invisible if JavaScript/CDN animation fails. */
document.documentElement.classList.add('js');
function initRevealFallback() {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}
window.addEventListener('load', () => {
  setTimeout(() => initRevealFallback(), 900);
});

/* ── EmailJS config (replace with your real keys) ─────────── */
const EJS_KEY = '9N3i_f0SElYf7cada';
const EJS_SERVICE = 'service_nvfzojd';
const EJS_TEMPLATE = 'template_rwslztc';

/* ── Globals ──────────────────────────────────────────────── */
const IS_MOBILE  = window.matchMedia('(max-width: 768px)').matches;
const REDUCED    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Boot ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const safe = fn => {
    try { fn(); } catch (err) { console.warn('Portfolio init skipped:', err); }
  };

  safe(initTheme);
  safe(initNav);
  safe(initMobileMenu);
  safe(initScrollProgress);
  safe(initBackToTop);
  safe(initCounters);
  safe(initCopyEmail);
  safe(initContactForm);
  safe(initFAQ);
  safe(initSkillBars);
  safe(initParticles);
  safe(initProjectGallery);
  safe(initMagneticCards);

  try {
    if (!REDUCED) {
      initGSAP();
      safe(initHeroParallax);
      safe(initPageHero);
    } else {
      initRevealFallback();
    }
  } catch (err) {
    console.warn('Animation fallback enabled:', err);
    initRevealFallback();
  }

  safe(() => {
    if (typeof emailjs !== 'undefined' && EJS_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EJS_KEY);
    }
  });
});

/* ══════════════════════════════════════════════════════════
   1. THEME  — light (default) / dark, localStorage, smooth transition
   ══════════════════════════════════════════════════════════ */
function initTheme() {
  const html = document.documentElement;
  const btns = document.querySelectorAll('.theme-toggle');

  // Restore saved theme or default to light
  const saved = localStorage.getItem('sa_theme') || 'light';
  html.setAttribute('data-theme', saved);

  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.classList.add('theme-transitioning');
      html.setAttribute('data-theme', next);
      localStorage.setItem('sa_theme', next);
      window.dispatchEvent(new CustomEvent('sa-theme-change', { detail: { theme: next } }));
      setTimeout(() => document.body.classList.remove('theme-transitioning'), 320);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   2. NAV  — scrolled state + active page highlight
   ══════════════════════════════════════════════════════════ */
function initNav() {
  const nav   = document.getElementById('nav');
  const links = document.querySelectorAll('.icon-rail a, .mob-menu a');
  if (!nav) return;

  // Active link by current page filename (multi-page site)
  const path    = window.location.pathname.split('/').pop();
  const current = path === '' ? 'index.html' : path;
  links.forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', href === current);
  });

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   3. MOBILE MENU
   ══════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn   = document.querySelector('.hbg');
  const menu  = document.getElementById('mobMenu');
  const close = document.getElementById('mobClose');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.add('open');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const shut = () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => menu.classList.contains('open') ? shut() : open());
  close?.addEventListener('click', shut);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
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
   6. ANIMATED COUNTERS
   ══════════════════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => io.observe(el));
}

function animateCounter(el) {
  const target   = parseFloat(el.getAttribute('data-counter'));
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 1600;
  const start    = performance.now();

  const tick = now => {
    const p  = Math.min((now - start) / duration, 1);
    const ep = 1 - Math.pow(1 - p, 3); // ease-out cubic
    el.textContent = Math.round(target * ep) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
        message,
      });
      showSuccess(email);
    } catch {
      btn.textContent = orig;
      btn.disabled    = false;
      if (note) note.textContent = 'Something went wrong — try WhatsApp instead.';
    }
  } else {
    // Fallback: open mailto
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nService: ${service || 'N/A'}\nURL: ${url || 'N/A'}\n\n${message}`
    );
    window.open(`mailto:shadab18ali@gmail.com?subject=Portfolio Enquiry — ${name}&body=${body}`);
    showSuccess(email);
  }
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
    fontFamily: 'var(--mono)', fontSize: '.6rem', color: 'var(--red)',
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
   9. GSAP SCROLL ANIMATIONS
   ══════════════════════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    initRevealFallback();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ── Hero entrance (home page only) ── */
  if (document.getElementById('hero')) {
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .from('.hero-badge',   { opacity: 0, y: 14, duration: 0.6, ease: 'power2.out' })
      .from('.hero-title-top',    { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' }, '-=0.3')
      .from('.hero-title-main-sm',{ opacity: 0, y: 40, skewY: 1.5, duration: 0.8, ease: 'power4.out' }, '-=0.4')
      .from('.hero-desc',       { opacity: 0, y: 18, duration: 0.6, ease: 'power2.out' }, '-=0.35')
      .from('.hero-actions .btn', { opacity: 0, y: 16, stagger: 0.07, duration: 0.55, ease: 'power2.out' }, '-=0.3')
      .from('.orbit-badge',     { opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.2')
      .from('.hero-photo-wrap', { opacity: 0, x: 30, duration: 0.9, ease: 'power3.out' }, 0.15)
      .from('.hero-badge-float', { opacity: 0, scale: 0.8, stagger: 0.12, duration: 0.6, ease: 'back.out(1.4)' }, 0.6)
      .from('.hero-stats-bar .hero-stat', { opacity: 0, y: 16, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  }

  /* ── Generic .reveal via ScrollTrigger ── */
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30, filter: 'blur(3px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 0.75, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
    el.classList.add('gsap-handled');
  });

  /* ── Section titles ── */
  document.querySelectorAll('h2.section-title').forEach(h2 => {
    gsap.fromTo(h2,
      { opacity: 0, y: 36, skewY: 1.5 },
      {
        opacity: 1, y: 0, skewY: 0,
        duration: 0.85, ease: 'power4.out',
        scrollTrigger: { trigger: h2, start: 'top 87%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Project cards — stagger in row ── */
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.75, ease: 'power3.out', delay: (i % 2) * 0.1,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Service cards ── */
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0,
        duration: 0.65, ease: 'power3.out', delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Experience items ── */
  gsap.utils.toArray('.exp-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: -28 },
      {
        opacity: 1, x: 0,
        duration: 0.65, ease: 'power2.out', delay: i * 0.07,
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Testimonial cards ── */
  gsap.utils.toArray('.testi-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 35, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.7, ease: 'power3.out', delay: i * 0.09,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Tech tags scatter ── */
  gsap.utils.toArray('.tech-tag').forEach((tag, i) => {
    gsap.fromTo(tag,
      { opacity: 0, scale: 0.8, y: 8 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.4, ease: 'back.out(2)', delay: i * 0.03,
        scrollTrigger: { trigger: tag, start: 'top 95%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Stats count + scale (about page stats only; hero/page-hero stats handled in their own timelines) ── */
  gsap.utils.toArray('.about-stat').forEach((stat, i) => {
    gsap.fromTo(stat,
      { opacity: 0, scale: 0.88, y: 16 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.55, ease: 'back.out(1.4)', delay: i * 0.09,
        scrollTrigger: { trigger: stat, start: 'top 92%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Why cards ── */
  gsap.utils.toArray('.why-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.65, ease: 'power3.out', delay: i * 0.1,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Pricing cards ── */
  gsap.utils.toArray('.price-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power2.out', delay: i * 0.08,
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  /* ── Footer brand ── */
  const footerBrand = document.querySelector('.footer-brand');
  if (footerBrand) {
    gsap.fromTo(footerBrand,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: footerBrand, start: 'top 92%', toggleActions: 'play none none none' },
      }
    );
  }

}

/* ══════════════════════════════════════════════════════════
   10. SCROLL REVEAL FALLBACK (no GSAP)
   ══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   11. HERO MOUSE PARALLAX (floating badges + photo)
   ══════════════════════════════════════════════════════════ */
function initHeroParallax() {
  if (IS_MOBILE || !('ontouchstart' in window) === false) return;

  const hero   = document.getElementById('hero');
  const photo  = document.querySelector('.hero-photo-tilt');
  const badges = document.querySelectorAll('.hero-badge-float');
  if (!hero || !photo) return;

  let mx = 0, my = 0, cx = 0, cy = 0, rafId;
  const MAX_TILT = 10; // degrees

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    my = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
  }, { passive: true });

  hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });

  const loop = () => {
    cx += (mx - cx) * 0.07;
    cy += (my - cy) * 0.07;
    const rotY =  cx * MAX_TILT;   // left/right mouse movement -> rotate around Y
    const rotX = -cy * MAX_TILT;   // up/down mouse movement -> rotate around X
    photo.style.transform =
      `perspective(1400px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0) translate(${cx * 8}px, ${cy * 5}px)`;
    badges.forEach((b, i) => {
      const f = (i % 2 === 0) ? -1 : 1;
      b.style.transform = `translate(${cx * 9 * f}px, ${cy * 6 * f}px) translateZ(40px)`;
    });
    rafId = requestAnimationFrame(loop);
  };
  loop();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else loop();
  });
}

/* ══════════════════════════════════════════════════════════
   12. PAGE HERO ENTRANCE (subpages)
   ══════════════════════════════════════════════════════════ */
function initPageHero() {
  if (typeof gsap === 'undefined') return;
  const hero = document.querySelector('.page-hero');
  if (!hero) return;

  const tl = gsap.timeline({ delay: 0.1 });
  tl.from('.breadcrumb', { opacity: 0, y: -10, duration: 0.5, ease: 'power2.out' })
    .from('.page-hero-num', { opacity: 0, y: 14, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .from('.page-hero h1', { opacity: 0, y: 36, skewY: 1.5, duration: 0.8, ease: 'power4.out' }, '-=0.25')
    .from('.page-hero-desc', { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .from('.page-hero-stats .hero-stat', { opacity: 0, y: 16, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.3');
}

/* ══════════════════════════════════════════════════════════
   13. FAQ ACCORDION (services page)
   ══════════════════════════════════════════════════════════ */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) o.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   14. SKILL PROFICIENCY BARS (skills page)
   ══════════════════════════════════════════════════════════ */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const level = e.target.getAttribute('data-level') || '0';
        e.target.style.width = level + '%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(b => io.observe(b));
}

/* ══════════════════════════════════════════════════════════
   15. PARTICLE / CONSTELLATION NETWORK BACKGROUND
   ══════════════════════════════════════════════════════════ */
function initParticles() {
  const canvases = document.querySelectorAll('.particles-canvas');
  if (!canvases.length) return;
  if (REDUCED) return; // skip animation for reduced-motion users

  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let w, h, particles, rafId;
    let rgb = getParticleRGB();
    const density = IS_MOBILE ? 22000 : 13000; // px^2 per particle (fewer on mobile)
    const maxDist = IS_MOBILE ? 110 : 150;

    function getParticleRGB() {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--particle-rgb').trim();
      return v || '217,164,65';
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width  = Math.max(1, rect.width);
      h = canvas.height = Math.max(1, rect.height);
      const count = Math.max(18, Math.min(90, Math.floor((w * h) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // Update + draw dots
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.6)`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${rgb},${0.28 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    resize();
    step();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        step();
      }, 200);
    }, { passive: true });

    window.addEventListener('sa-theme-change', () => { rgb = getParticleRGB(); });
  });
}

/* ══════════════════════════════════════════════════════════
   Project section: 3D magnetic hover + gallery modal
   Static HTML adaptation of the scroll-expansion/gallery idea.
   ══════════════════════════════════════════════════════════ */
function initMagneticCards() {
  const cards = document.querySelectorAll('.project-card, .case-study, .price-card, .addon-card, .service-card, .teaser-card, .why-card');
  if (!cards.length || REDUCED) return;

  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width;
      const py = y / rect.height;
      const rx = (0.5 - py) * 7;
      const ry = (px - 0.5) * 9;

      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      card.style.setProperty('--rx', `${rx}deg`);
      card.style.setProperty('--ry', `${ry}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

function initProjectGallery() {
  const items = Array.from(document.querySelectorAll('.project-img-wrap, .case-side-img'));
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
      <img alt="Project preview" loading="lazy">
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
    const src = el.dataset.gallerySrc || realImg?.currentSrc || realImg?.src || makePreviewSvg(title, url);
    return { title, url, src };
  };

  const openAt = (index) => {
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
  };

  items.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Open project preview gallery');
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
