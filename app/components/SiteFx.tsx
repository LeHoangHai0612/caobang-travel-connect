"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
// Light site-wide enhancements: broken-image fallback, scroll reveal, custom
// cursor (desktop only). No smooth-scroll library (native scroll). No layout changes.

import { useEffect } from "react";

export default function SiteFx() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // ── broken-image fallback (site-wide) ──
    // Hotlinked images (Facebook/news sites) can 403/404; swap to a stable photo,
    // then to an inline SVG placeholder so a broken image never shows blank.
    const FALLBACK_PHOTO = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=70&auto=format";
    const PLACEHOLDER_SVG =
      "data:image/svg+xml," +
      encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#e3ece6'/><path d='M0 600 L300 360 L450 480 L600 290 L800 600 Z' fill='#9fb6a9'/><path d='M0 600 L180 470 L340 560 L520 430 L800 600 Z' fill='#7d9a8b'/><circle cx='650' cy='150' r='56' fill='#cfdcd4'/></svg>"
      );
    const onImgError = (e: Event) => {
      const img = e.target as HTMLElement;
      if (!(img instanceof HTMLImageElement)) return;
      const stage = img.dataset.fbk;
      if (stage === "2") return;
      if (stage === "1") { img.dataset.fbk = "2"; img.src = PLACEHOLDER_SVG; return; }
      img.dataset.fbk = "1"; img.src = FALLBACK_PHOTO;
    };
    document.addEventListener("error", onImgError, true);
    cleanups.push(() => document.removeEventListener("error", onImgError, true));

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

    return () => cleanups.forEach((f) => { try { f(); } catch { /* */ } });
  }, []);
  return null;
}
