/* eslint-disable @typescript-eslint/no-explicit-any */
// Interop layer for the redesigned homepage: loads Three.js / GSAP / Lenis from
// CDN at runtime and wires custom cursor, WebGL particles, scroll-telling,
// horizontal scroll, parallax and micro-interactions. Untyped on purpose.

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) { resolve(); return; }
    const sc = document.createElement("script");
    sc.src = src; sc.id = id; sc.async = true;
    sc.onload = () => resolve();
    sc.onerror = () => resolve();
    document.head.appendChild(sc);
  });
}

export function initHomeEffects(): () => void {
  const w = window as any;
  const cleanups: Array<() => void> = [];
  const on = (t: any, ev: string, fn: any, opt?: any) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };
  const q = (s: string) => document.querySelector(s) as any;
  const qa = (s: string) => Array.from(document.querySelectorAll(s)) as any[];

  // ── intro preloader ──
  (function () {
    const sc = q(".nw-intro"), ct = q(".nw-intro-count"), bar = q(".nw-intro-bar");
    if (!sc) return;
    document.body.style.overflow = "hidden";
    const t0 = performance.now(), dur = 2200;
    let raf = 0;
    const run = (t: number) => {
      const p = Math.min((t - t0) / dur, 1), v = Math.round(p * 100);
      if (ct) ct.textContent = v + "%"; if (bar) bar.style.width = v + "%";
      if (p < 1) raf = requestAnimationFrame(run);
      else setTimeout(() => { sc.classList.add("done"); document.body.style.overflow = ""; }, 420);
    };
    raf = requestAnimationFrame(run);
    cleanups.push(() => { cancelAnimationFrame(raf); document.body.style.overflow = ""; });
  })();

  // ── header shadow ──
  const hd = q(".nw-hd");
  if (hd) on(window, "scroll", () => hd.classList.toggle("scrolled", window.scrollY > 60), { passive: true });

  // ── mobile menu ──
  const burger = q(".nw-burger"), mm = q(".nw-mm");
  if (burger && mm) {
    on(burger, "click", () => { burger.classList.toggle("open"); mm.classList.toggle("open"); document.body.style.overflow = mm.classList.contains("open") ? "hidden" : ""; });
    qa(".nw-mm a").forEach((a) => on(a, "click", () => { burger.classList.remove("open"); mm.classList.remove("open"); document.body.style.overflow = ""; }));
  }

  // ── reveal ──
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
  qa(".nw-rv").forEach((el, i) => { el.style.transitionDelay = (i % 4 * 0.08) + "s"; io.observe(el); });
  cleanups.push(() => io.disconnect());

  // ── count up ──
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target as any, end = +el.dataset.count, t0 = performance.now();
    const st = (t: number) => { const p = Math.min((t - t0) / 1400, 1); const v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v.toLocaleString("vi-VN") + (end >= 100 ? "+" : ""); if (p < 1) requestAnimationFrame(st); };
    requestAnimationFrame(st); cio.unobserve(el);
  }), { threshold: 0.6 });
  qa("[data-count]").forEach((el) => cio.observe(el));
  cleanups.push(() => cio.disconnect());

  // ── custom cursor ──
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (fine) {
    const dot = q(".nw-cur-dot"), ring = q(".nw-cur-ring");
    if (dot && ring) {
      document.body.classList.add("nw-cursor");
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
      on(window, "mousemove", (e: any) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; });
      const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + "px"; ring.style.top = ry + "px"; raf = requestAnimationFrame(loop); };
      loop();
      qa("[data-hov]").forEach((el) => { on(el, "mouseenter", () => ring.classList.add("big")); on(el, "mouseleave", () => ring.classList.remove("big")); });
      qa("[data-media]").forEach((el) => { on(el, "mouseenter", () => ring.classList.add("media")); on(el, "mouseleave", () => ring.classList.remove("media")); });
      cleanups.push(() => { cancelAnimationFrame(raf); document.body.classList.remove("nw-cursor"); });
    }
  }

  // ── magnetic + tilt ──
  qa("[data-magnetic]").forEach((btn) => {
    on(btn, "mousemove", (e: any) => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px,${(e.clientY - r.top - r.height / 2) * 0.45}px)`; });
    on(btn, "mouseleave", () => { btn.style.transform = ""; });
  });
  qa("[data-tilt]").forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    on(card, "mousemove", (e: any) => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg)`; });
    on(card, "mouseleave", () => { card.style.transform = ""; });
  });

  // ── journey scroll-telling ──
  (function () {
    const sec = q(".nw-journey"); if (!sec) return;
    const stops = qa(".nw-journey [data-j]"), navs = qa(".nw-journey [data-jn]"), bar = q(".nw-jbar span");
    let cur = -1;
    const upd = () => {
      const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      const prog = Math.min(Math.max(-r.top / total, 0), 1);
      if (bar) bar.style.width = (prog * 100) + "%";
      const idx = Math.min(stops.length - 1, Math.floor(prog * stops.length - 1e-6));
      if (idx !== cur) { cur = idx; stops.forEach((s, i) => s.classList.toggle("active", i === idx)); navs.forEach((n, i) => n.classList.toggle("on", i === idx)); }
    };
    on(window, "scroll", upd, { passive: true }); on(window, "resize", upd); upd();
  })();

  // ── libs: GSAP + Lenis ──
  let lenis: any = null;
  Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", "nw-gsap"),
  ]).then(() => Promise.all([
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js", "nw-st"),
    loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js", "nw-lenis"),
  ])).then(() => {
    // GSAP + Lenis
    const gsap = w.gsap, ST = w.ScrollTrigger, Lenis = w.Lenis;
    if (gsap && ST) {
      gsap.registerPlugin(ST);
      if (Lenis) {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        lenis.on("scroll", ST.update);
        gsap.ticker.add((t: number) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }
      const mm2 = gsap.matchMedia();
      mm2.add("(min-width:768px)", () => {
        const track = q("#nw-hxTrack");
        if (track) {
          const dist = () => track.scrollWidth - innerWidth + innerWidth * 0.06;
          gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#nw-hx", start: "top top", end: () => "+=" + dist(), scrub: 1, pin: true, invalidateOnRefresh: true } });
        }
        qa(".nw-introimg img").forEach((img) => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img.closest(".nw-introimg"), start: "top bottom", end: "bottom top", scrub: true } }));
        const fq = q(".nw-feel blockquote");
        if (fq) gsap.from(fq, { y: 60, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: ".nw-feel", start: "top 65%" } });
      });
      cleanups.push(() => { try { ST.getAll().forEach((t: any) => t.kill()); mm2.revert(); } catch { /* */ } });
    }
    if (lenis) cleanups.push(() => { try { lenis.destroy(); } catch { /* */ } });
  });

  return () => cleanups.forEach((fn) => { try { fn(); } catch { /* */ } });
}
