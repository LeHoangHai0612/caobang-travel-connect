"use client";

import React from "react";
import Link from "next/link";
import type { Tour } from "@/lib/database.types";

interface TourGridProps {
  toursBg: string;
  tours: Tour[];
}

export default function TourGrid({ toursBg, tours }: TourGridProps) {
  return (
    <section id="tours" className="section-tours" style={{ background: `linear-gradient(rgba(248,249,248,.91),rgba(248,249,248,.91)),url('${toursBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Khám Phá Ngay</span>
          <h2 className="section-title">Các Gói Tour Nổi Bật</h2>
          <p className="section-subtitle">Lựa chọn hành trình phù hợp — từ tour 1 ngày đến khám phá dài ngày trọn vẹn</p>
        </div>
        <div className="tours-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, marginBottom: 28 }}>
          {tours.map((t) => (
            <Link key={t.id} href={`/tour/${t.id}`} style={{ textDecoration: "none", display: "block" }}>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,.07)", transition: "transform .2s,box-shadow .2s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 10px 30px rgba(0,0,0,.13)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ""; el.style.boxShadow = "0 2px 14px rgba(0,0,0,.07)"; }}>
                {/* Image */}
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                  {t.image_url
                    ? <img src={t.image_url} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-solid fa-map" style={{ fontSize: 40, color: "#94a3b8" }} /></div>}
                  {t.price_from > 0 && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: "#265C59", color: "white", borderRadius: 8, padding: "4px 10px", fontSize: ".72rem", fontWeight: 800 }}>
                      Từ {t.price_from.toLocaleString("vi-VN")}đ
                    </div>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                      <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{t.duration}
                    </span>
                    <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                      <i className="fa-solid fa-users" style={{ marginRight: 4 }} />{t.group_size}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: ".95rem", margin: "0 0 8px", lineHeight: 1.4 }}>{t.title}</h3>
                  <p style={{ color: "#64748b", fontSize: ".82rem", lineHeight: 1.7, margin: "0 0 14px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {t.description}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {t.zalo_number && (
                      <a href={`https://zalo.me/${t.zalo_number}`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".75rem", textDecoration: "none" }}>
                        <i className="fa-brands fa-comment-dots" />Zalo: {t.zalo_number}
                      </a>
                    )}
                    <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", color: "#475569", fontSize: ".75rem", fontWeight: 600 }}>
                      Xem chi tiết <i className="fa-solid fa-arrow-right" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Link href="/tour" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 50, border: "2px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".84rem", textDecoration: "none", background: "white", letterSpacing: ".04em" }}>
            <i className="fa-solid fa-map" /> Xem Tất Cả Gói Tour <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  );
}
