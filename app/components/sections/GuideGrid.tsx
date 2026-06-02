"use client";

import React, { useState } from "react";
import type { Guide } from "@/lib/database.types";

interface GuideGridProps {
  teamBg: string;
  guides: Guide[];
}

export default function GuideGrid({ teamBg, guides }: GuideGridProps) {
  const [guideSearch, setGuideSearch] = useState("");
  const [guideFilterLang, setGuideFilterLang] = useState("");
  const [guideFilterRating, setGuideFilterRating] = useState("");

  const StarIcons = ({ rating }: { rating: number }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<i key={i} className="fa-solid fa-star" />);
      else if (i - 0.5 <= rating) stars.push(<i key={i} className="fa-solid fa-star-half-stroke" />);
      else stars.push(<i key={i} className="fa-regular fa-star" />);
    }
    return <>{stars}</>;
  };

  const allFiltered = guides.filter((g) => {
    if (g.is_active === false) return false;
    const q = guideSearch.toLowerCase();
    const matchSearch = !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
    const matchLang   = !guideFilterLang   || g.languages?.toLowerCase().includes(guideFilterLang.toLowerCase());
    const matchRating = !guideFilterRating || g.rating >= parseFloat(guideFilterRating);
    return matchSearch && matchLang && matchRating;
  });

  const GUIDE_LIMIT = 8;
  const filteredGuides = allFiltered.slice(0, GUIDE_LIMIT);

  return (
    <section className="team" id="team" aria-labelledby="team-heading"
      style={{ background: `linear-gradient(rgba(255,255,255,.91),rgba(255,255,255,.91)),url('${teamBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Đội Ngũ Chuyên Nghiệp</span>
          <h2 className="section-title" id="team-heading">Đội Ngũ Hướng Dẫn Viên Biểu Tượng</h2>
          <p className="section-subtitle">Những hướng dẫn viên giàu kinh nghiệm, tận tâm và am hiểu sâu về vùng đất Cao Bằng</p>
        </div>

        <div className="guide-search-bar" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28, justifyContent: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }} />
            <input
              type="text" value={guideSearch} onChange={(e) => setGuideSearch(e.target.value)}
              placeholder="Tìm theo tên, chuyên môn..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
            />
          </div>
          <select value={guideFilterLang} onChange={(e) => setGuideFilterLang(e.target.value)}
            style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <option value="">🌐 Ngôn ngữ</option>
            <option value="English">English</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
          </select>
          <select value={guideFilterRating} onChange={(e) => setGuideFilterRating(e.target.value)}
            style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
            <option value="">⭐ Đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4.5">4.5+ sao</option>
            <option value="4">4+ sao</option>
          </select>
          {(guideSearch || guideFilterLang || guideFilterRating) && (
            <button onClick={() => { setGuideSearch(""); setGuideFilterLang(""); setGuideFilterRating(""); }}
              style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#64748b", fontSize: ".82rem", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
              <i className="fa-solid fa-xmark" style={{ marginRight: 5 }} />Xóa lọc
            </button>
          )}
        </div>

        <div className="team-grid">
          {filteredGuides.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <i className="fa-solid fa-person-hiking" style={{ fontSize: 36, marginBottom: 12, display: "block" }} />
              <p style={{ fontWeight: 700, color: "#475569" }}>Không tìm thấy HDV phù hợp</p>
              <p style={{ fontSize: ".82rem", marginTop: 4 }}>Thử điều chỉnh bộ lọc của bạn</p>
            </div>
          ) : filteredGuides.map((member) => (
            <article key={member.id} className="team-card fade-up">
              <a href={`/hdv/${member.id}`} className="team-card-img-wrap" aria-label={`Xem hồ sơ ${member.name}`} style={{ display: "block", textDecoration: "none", cursor: "pointer", background: "#e2e8f0" }}>
                {member.image_url ? (
                  <img className="team-card-img" src={member.image_url} alt={`HDV ${member.name}`} loading="lazy" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fa-solid fa-user-tie" style={{ fontSize: 40, color: "#94a3b8" }} />
                  </div>
                )}
                <span className="team-card-badge">{member.rating}★</span>
                <span style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .25s", borderRadius: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }} className="team-card-hover-overlay">
                  <span style={{ background: "rgba(38,92,89,.85)", color: "white", padding: "7px 16px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, opacity: 0, transition: "opacity .25s" }} className="team-card-view-label">
                    <i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Xem hồ sơ
                  </span>
                </span>
              </a>
              <h3>{member.name}</h3>
              <p>{member.specialty}</p>
              <p className="hdv-role">{member.role}</p>
              <div className="team-stars" aria-label={`${member.rating} sao`}>
                <StarIcons rating={member.rating} />
              </div>
              {member.zalo_number && (
                <a href={`https://zalo.me/${member.zalo_number}`} target="_blank" rel="noopener noreferrer" className="team-zalo-btn" aria-label={`Chat Zalo với ${member.name}`}>
                  <i className="fa-brands fa-comment-dots" /> Chat Zalo
                </a>
              )}
            </article>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/hdv"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 12, border: "2px solid #265C59", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".9rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(38,92,89,.25)" }}>
            <i className="fa-solid fa-users" />Xem tất cả hướng dẫn viên
          </a>
        </div>
      </div>
    </section>
  );
}
