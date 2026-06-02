"use client";

import React from "react";
import type { Destination } from "@/lib/database.types";

interface DestinationGridProps {
  destBg: string;
  destinations: Destination[];
  setSelectedDest: (dest: Destination) => void;
}

export default function DestinationGrid({ destBg, destinations, setSelectedDest }: DestinationGridProps) {
  return (
    <section className="destinations" id="destinations" aria-labelledby="dest-heading"
      style={{ background: `linear-gradient(to bottom,rgba(20,52,52,.55),rgba(20,52,52,.62)),url('${destBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ background: "rgba(38,92,89,.12)", color: "var(--teal-dark)" }}>Khám Phá Ngay</span>
          <h2 className="section-title" id="dest-heading">Điểm Đến Không Thể Bỏ Lỡ</h2>
          <p className="section-subtitle">Những địa danh hùng vĩ và đặc sắc nhất tại vùng đất Cao Bằng đang chờ bạn khám phá</p>
        </div>

        <div className="dest-map-wrapper" aria-label="Bản đồ du lịch Cao Bằng">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239558.34!2d105.75!3d22.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd16a1c9ef9d73%3A0x9c7f8b0ba2a3e4f0!2zQ2FvIELhbaG_bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
            title="Bản đồ du lịch Cao Bằng Việt Nam"
            loading="lazy"
            allowFullScreen
          />
          <div className="dest-map-overlay" aria-hidden="true" />
        </div>

        <div className="dest-grid">
          {destinations.map((dest) => (
            <article key={dest.id} className="dest-card fade-up" onClick={() => setSelectedDest(dest)}
              style={{ cursor: "pointer" }}>
              <div className="dest-card-img-wrap" style={{ position: "relative" }}>
                <img className="dest-card-img" src={dest.image_url} alt={dest.title} loading="lazy" />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,.3)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"}>
                  <span style={{ background: "rgba(38,92,89,.9)", color: "white", padding: "7px 16px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, opacity: 0, transition: "opacity .2s" }}
                    className="dest-card-view-label">
                    <i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Xem chi tiết
                  </span>
                </div>
              </div>
              <h3>{dest.title}</h3>
              <p className="dest-desc">{dest.description}</p>
              <div className="dest-meta">
                <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {dest.location}</span>
                <span><i className="fa-solid fa-star" aria-hidden="true" /> {dest.rating}</span>
              </div>
            </article>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/diem-den" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 50, border: "2px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".86rem", textDecoration: "none" }}>
            Xem Tất Cả Điểm Đến <i className="fa-solid fa-arrow-right" />
          </a>
        </div>
      </div>
    </section>
  );
}
