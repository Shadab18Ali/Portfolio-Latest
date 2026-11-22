/* Homepage 3D model: one fixed, scroll-driven object (a knot inside a wire shell).
   This is the source for assets/js/model3d.js.
   Rebuild after editing:  cd tools/model3d && npm install && npm run build

   script.js loads the built file only on wide screens, only when the visitor has not
   asked for reduced motion, and only after the page has finished loading. */
import {
  ACESFilmicToneMapping, AmbientLight, BackSide, BoxGeometry, DirectionalLight, Group,
  IcosahedronGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, PerspectiveCamera, PMREMGenerator, Scene, SphereGeometry,
  TorusKnotGeometry, WebGLRenderer, WireframeGeometry,
} from 'three';

/* Colours per theme (the site toggles data-theme on <html>). */
const THEMES = {
  light: { knot: 0xef3d2e, wire: 0x15161f, wireOpacity: 0.3, nodeA: 0x15161f, nodeB: 0xb9822f, dome: 0xcfcbc0, exposure: 1.0 },
  dark:  { knot: 0xff5a45, wire: 0xffffff, wireOpacity: 0.36, nodeA: 0xffffff, nodeB: 0xd9a441, dome: 0x23264a, exposure: 1.1 },
};

/* Where the model sits as the page scrolls. p = scroll progress (0 top, 1 bottom);
   x and y are fractions of the viewport, s is scale, o is opacity. */
const PATH = [
  { p: 0.00, x: 0.76, y: 0.47, s: 1.00, o: 1.00 },   // hero: behind the portrait
  { p: 0.09, x: 1.00, y: 0.34, s: 0.62, o: 0.80 },   // leaves the hero for the right edge
  { p: 0.30, x: 1.02, y: 0.62, s: 0.55, o: 0.60 },   // holds at the right edge
  { p: 0.40, x: 1.02, y: 0.66, s: 0.55, o: 0.60 },
  { p: 0.46, x: -0.02, y: 0.50, s: 0.55, o: 0.60 },  // crosses quickly to the left edge
  { p: 0.64, x: -0.02, y: 0.38, s: 0.55, o: 0.60 },  // holds at the left edge
  { p: 0.70, x: 1.02, y: 0.40, s: 0.58, o: 0.60 },   // crosses back
  { p: 0.90, x: 1.02, y: 0.32, s: 0.55, o: 0.55 },
  { p: 1.00, x: 0.97, y: 0.30, s: 0.50, o: 0.50 },
];

const ease = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function samplePath(p) {
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].p) i++;
  const a = PATH[i], b = PATH[i + 1];
  const e = ease(clamp((p - a.p) / (b.p - a.p), 0, 1));
  const mix = k => a[k] + (b[k] - a[k]) * e;
  return { x: mix('x'), y: mix('y'), s: mix('s'), o: mix('o') };
}

export function start(host) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    canvas.remove();
    return null; // no WebGL: the page simply has no model
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.z = 6.4;

  /* A tiny studio for reflections, so the metal has something to reflect. */
  const pmrem = new PMREMGenerator(renderer);
  let envTarget = null;
  const buildEnvironment = domeColor => {
    const env = new Scene();
    env.add(new Mesh(new SphereGeometry(10, 32, 16), new MeshBasicMaterial({ color: domeColor, side: BackSide })));
    const panel = (w, h, x, y, z, power) => {
      const m = new Mesh(new BoxGeometry(w, h, 0.1), new MeshBasicMaterial());
      m.material.color.setScalar(power);
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(6, 3, 0, 6, 2, 7);    // big overhead softbox
    panel(2, 6, -7, 1, 2, 4);   // left strip
    panel(2, 5, 7, -1, 3, 3);   // right fill
    const target = pmrem.fromScene(env, 0.04);
    envTarget?.dispose();
    envTarget = target;
    scene.environment = target.texture;
  };

  const group = new Group();
  scene.add(group);

  const knotMat = new MeshPhysicalMaterial({ metalness: 0.55, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12 });
  const knot = new Mesh(new TorusKnotGeometry(0.78, 0.26, 260, 36, 2, 3), knotMat);
  group.add(knot);

  const shellMat = new LineBasicMaterial({ transparent: true });
  const shell = new LineSegments(new WireframeGeometry(new IcosahedronGeometry(1.62, 1)), shellMat);
  group.add(shell);

  const orbit = new Group();
  orbit.rotation.z = 0.5;
  group.add(orbit);
  const nodeMats = [new MeshBasicMaterial(), new MeshBasicMaterial(), new MeshBasicMaterial()];
  const nodes = nodeMats.map(m => {
    const n = new Mesh(new SphereGeometry(0.085, 24, 16), m);
    orbit.add(n);
    return n;
  });

  const key = new DirectionalLight(0xffffff, 1.3);
  key.position.set(3, 4, 5);
  scene.add(key, new AmbientLight(0xffffff, 0.35));

  const setTheme = name => {
    const t = THEMES[name] || THEMES.light;
    knotMat.color.setHex(t.knot);
    shellMat.color.setHex(t.wire);
    shellMat.opacity = t.wireOpacity;
    nodeMats[0].color.setHex(t.nodeA);
    nodeMats[1].color.setHex(t.nodeB);
    nodeMats[2].color.setHex(t.knot);
    renderer.toneMappingExposure = t.exposure;
    buildEnvironment(t.dome);
  };
  setTheme(document.documentElement.getAttribute('data-theme'));
  const onTheme = e => setTheme(e.detail?.theme);
  window.addEventListener('sa-theme-change', onTheme);

  /* Size and position. The canvas is a square that follows the scroll path,
     so the GPU never has to draw a full-screen canvas. */
  let size = 0, vw = 0, vh = 0, progress = 0;
  const resize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    size = Math.round(clamp(Math.min(vw, vh * 1.25) * 0.52, 320, 640));
    host.style.width = host.style.height = size + 'px';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    onScroll();
  };
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  };

  /* Pointer: a gentle tilt, mouse only. */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };

  let cur = samplePath(0); // current, damped values
  const born = performance.now();
  let last = born;
  let t = 0;

  const tick = time => {
    const dt = Math.min(0.05, (time - last) / 1000);
    last = time;
    t += dt;
    const damp = 1 - Math.exp(-dt * 5);

    const target = samplePath(progress);
    for (const k of ['x', 'y', 's', 'o']) cur[k] += (target[k] - cur[k]) * damp;
    pointer.x += (pointer.tx - pointer.x) * damp;
    pointer.y += (pointer.ty - pointer.y) * damp;

    host.style.transform = `translate3d(${(vw * cur.x - size / 2).toFixed(1)}px, ${(vh * cur.y - size / 2).toFixed(1)}px, 0) scale(${cur.s.toFixed(3)})`;
    host.style.opacity = (cur.o * ease(clamp((time - born) / 1400, 0, 1))).toFixed(3); // fades in on load

    group.rotation.y = t * 0.14 + progress * Math.PI * 5 + pointer.x * 0.5;
    group.rotation.x = 0.35 + progress * 1.2 + pointer.y * 0.3;
    shell.rotation.y = -t * 0.08;
    nodes.forEach((n, i) => {
      const a = t * 0.55 + i * 2.1;
      n.position.set(Math.cos(a) * 1.95, Math.sin(a * 1.3) * 0.25, Math.sin(a) * 1.95);
    });

    renderer.render(scene, camera);
  };

  const run = () => renderer.setAnimationLoop(tick);
  const onVisibility = () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else { last = performance.now(); run(); }
  };

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  cur = samplePath(progress);
  run();

  return {
    destroy() {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('sa-theme-change', onTheme);
      document.removeEventListener('visibilitychange', onVisibility);
      envTarget?.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
