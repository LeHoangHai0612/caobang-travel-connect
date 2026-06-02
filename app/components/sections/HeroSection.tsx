"use client";

import React from "react";

interface HeroSectionProps {
  heroVideo: string;
  heroBg: string;
  heroMistRef: React.RefObject<HTMLDivElement | null>;
  weather: any;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function HeroSection({ heroVideo, heroBg, heroMistRef, weather, scrollToSection }: HeroSectionProps) {
  const weatherIcon = (code: number) => {
    if (code <= 3) return { icon: "fa-sun", color: "#FDE047", label: "Nắng Đẹp" };
    if (code <= 49) return { icon: "fa-cloud-sun", color: "#E2E8F0", label: "Nhiều Mây" };
    if (code <= 69) return { icon: "fa-cloud-rain", color: "#93C5FD", label: "Mưa Nhẹ" };
    if (code <= 79) return { icon: "fa-snowflake", color: "#BAE6FD", label: "Lạnh Giá" };
    if (code <= 99) return { icon: "fa-cloud-bolt", color: "#94A3B8", label: "Giông Bão" };
    return { icon: "fa-cloud", color: "#CBD5E1", label: "Nhiều Mây" };
  };

  return (
    <section className="hero" id="hero" aria-label="Ảnh bìa - Khám phá Cao Bằng">
      {heroVideo ? (
        <video
          className="hero-bg"
          autoPlay muted loop playsInline
          poster={heroBg || undefined}
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="hero-bg"
          role="img"
          aria-label="Thác Bản Giốc Cao Bằng"
          style={heroBg ? { backgroundImage: `url('${heroBg}')` } : undefined}
        />
      )}
      <div className="hero-overlay" aria-hidden="true" />
      <div ref={heroMistRef} className="hero-mist" aria-hidden="true" />
      
      <div className="hero-body">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-leaf" /> Hướng Dẫn Viên Địa Phương · Cao Bằng, Việt Nam
          </div>
          <h1>Khám Phá<br />Cao Bằng</h1>
          <p className="hero-tagline">Cùng Hướng Dẫn Viên Địa Phương</p>
          <p className="hero-sub">Chuyên Nghiệp · Am Hiểu · Tận Tâm · Hành trình trọn vẹn</p>
          <div className="hero-actions">
            <a href="#team" className="btn-hero-primary" onClick={(e) => scrollToSection(e, "team")}>
              <i className="fa-solid fa-compass" aria-hidden="true" /> XEM CÁC HDV &amp; TOUR
            </a>
            <a href="#destinations" className="btn-hero-outline" onClick={(e) => scrollToSection(e, "destinations")}>
              <i className="fa-solid fa-map-location-dot" aria-hidden="true" /> KHÁM PHÁ ĐIỂM ĐẾN
            </a>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-stats" aria-label="Thống kê dịch vụ">
          <div className="hero-stat"><strong>50+</strong><span>Hướng Dẫn Viên</span></div>
          <div className="hero-stat"><strong>2000+</strong><span>Du Khách Hài Lòng</span></div>
          <div className="hero-stat"><strong>30+</strong><span>Điểm Tham Quan</span></div>
          <div className="hero-stat"><strong>5★</strong><span>Đánh Giá TB</span></div>
        </div>
      </div>

      {weather && (() => {
        const w = weatherIcon(weather.code);
        return (
          <div style={{ position: "absolute", top: 80, right: 20, background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, color: "white", border: "1px solid rgba(255,255,255,.18)", zIndex: 10 }}>
            <i className={`fa-solid ${w.icon}`} style={{ fontSize: 20, color: w.color }} />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>{weather.temp}°C</p>
              <p style={{ margin: "2px 0 0", fontSize: ".65rem", opacity: .75 }}>{w.label} · {weather.wind} km/h</p>
              <p style={{ margin: "1px 0 0", fontSize: ".6rem", opacity: .5 }}>Cao Bằng, Việt Nam</p>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
