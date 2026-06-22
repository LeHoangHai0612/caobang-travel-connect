"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Light site-wide enhancements: scroll reveal, custom cursor (desktop), and
// Lenis smooth scrolling (loaded from CDN). No layout changes, performance-light.

import { useEffect } from "react";

export default function SiteFx() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ── scroll reveal (.fade-up -> .visible) ──
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".fade-up:not(.visible)").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ── custom cursor (desktop only) ──
    if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
      const dot = document.createElement("div"); dot.className = "sfx-dot";
      const ring = document.createElement("div"); ring.className = "sfx-ring";
      document.body.append(dot, ring);
      document.body.classList.add("sfx-on");
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
      const mm = (e: any) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; };
      const loop = () => { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; ring.style.left = rx + "px"; ring.style.top = ry + "px"; raf = requestAnimationFrame(loop); };
      const sel = "a,button,[role=button],input,select,textarea,label";
      const over = (e: any) => { if (e.target.closest && e.target.closest(sel)) ring.classList.add("hov"); };
      const out = (e: any) => { if (e.target.closest && e.target.closest(sel)) ring.classList.remove("hov"); };
      window.addEventListener("mousemove", mm);
      window.addEventListener("mouseover", over);
      window.addEventListener("mouseout", out);
      loop();
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", mm); window.removeEventListener("mouseover", over); window.removeEventListener("mouseout", out);
        dot.remove(); ring.remove(); document.body.classList.remove("sfx-on");
      });
    }

    // ── Lenis smooth scroll (CDN) ──
    let lenis: any = null, rafL = 0, stop = false;
    const sc = document.createElement("script");
    sc.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"; sc.async = true;
    sc.onload = () => {
      const L = (window as any).Lenis; if (!L || stop) return;
      lenis = new L({ duration: 1.05, smoothWheel: true });
      const raf = (t: number) => { lenis.raf(t); rafL = requestAnimationFrame(raf); };
      rafL = requestAnimationFrame(raf);
    };
    document.head.appendChild(sc);
    cleanups.push(() => { stop = true; cancelAnimationFrame(rafL); if (lenis) { try { lenis.destroy(); } catch { /* */ } } });

    return () => cleanups.forEach((f) => { try { f(); } catch { /* */ } });
  }, []);
  return null;
}
