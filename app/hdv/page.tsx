"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const LANGS = ["Tiếng Việt", "English", "中文", "한국어"];

function StarIcons({ rating }: { rating: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((s) => {
        const full = s <= Math.floor(rating);
        const half = !full && rating >= s - 0.5;
        return <i key={s} className={`fa-${full || half ? "solid" : "regular"} ${full ? "fa-star" : half ? "fa-star-half-stroke" : "fa-star"}`} style={{ color: "#E5A919", fontSize: ".75rem" }} />;
      })}
    </>
  );
}

export default function AllGuidesPage() {
  const [guides, setGuides]           = useState<Guide[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterLang, setFilterLang]   = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterSpec, setFilterSpec]   = useState("");

  useEffect(() => {
    supabase.from("guides").select("*").or("is_active.is.null,is_active.eq.true")
      .order("rating", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []).sort((a, b) => ((b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)));
        setGuides(list);
        setLoading(false);
      });
  }, []);

  const filtered = guides.filter((g) => {
    const q = search.toLowerCase();
    const matchQ    = !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q) || g.bio?.toLowerCase().includes(q);
    const matchLang = !filterLang   || g.languages?.toLowerCase().includes(filterLang.toLowerCase());
    const matchRate = !filterRating || g.rating >= parseFloat(filterRating);
    const matchSpec = !filterSpec   || g.specialty.toLowerCase().includes(filterSpec.toLowerCase());
    return matchQ && matchLang && matchRate && matchSpec;
  });

  const specialties = [...new Set(guides.map((g) => {
    const parts = g.specialty.split("·");
    return parts[1]?.trim() ?? g.specialty;
  }))].slice(0, 8);

  const hasFilter = search || filterLang || filterRating || filterSpec;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9f8" }}>
      {/* Header */}
      <header className="page-header page-header--teal">
        <a href="/" className="page-header-brand">
          <img src="/logo.png" alt="Logo" width={32} height={32} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", flexShrink: 0 }} />
          <span style={{ color: "white" }}>Cao Bằng Travel Connect</span>
        </a>
        <a href="/" className="page-header-back" style={{ color: "rgba(255,255,255,.85)" }}>
          <i className="fa-solid fa-arrow-left" /> Trang chủ
        </a>
      </header>

      {/* Hero */}
      <div className="subpage-hero" style={{ background: "linear-gradient(135deg,#1a3c3a,#265C59,#3a9490)", padding: "48px 24px 40px", textAlign: "center" }}>
        <span style={{ background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.85)", fontSize: ".72rem", fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: ".1em", textTransform: "uppercase" }}>
          Đội Ngũ Chuyên Nghiệp
        </span>
        <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.4rem)", margin: "14px 0 10px" }}>
          Tất Cả Hướng Dẫn Viên
        </h1>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".9rem", margin: "0 auto 28px", maxWidth: 500 }}>
          {loading ? "Đang tải..." : `${guides.length} hướng dẫn viên giàu kinh nghiệm tại Cao Bằng`}
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, chuyên môn, giới thiệu..."
            style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 12, border: "none", fontSize: ".9rem", outline: "none", boxSizing: "border-box", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }} />
        </div>
      </div>

      <div className="subpage-content" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 60px" }}>
        {/* Filters */}
        <div className="hdv-filters" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: ".83rem", outline: "none", cursor: "pointer", background: "white" }}>
            <option value="">⭐ Tất cả đánh giá</option>
            <option value="5">⭐ 5 sao</option>
            <option value="4.5">⭐ 4.5+ sao</option>
            <option value="4">⭐ 4+ sao</option>
          </select>
          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: ".83rem", outline: "none", cursor: "pointer", background: "white" }}>
            <option value="">🌐 Tất cả ngôn ngữ</option>
            {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: ".83rem", outline: "none", cursor: "pointer", background: "white" }}>
            <option value="">🗺 Tất cả chuyên môn</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasFilter && (
            <button onClick={() => { setSearch(""); setFilterLang(""); setFilterRating(""); setFilterSpec(""); }}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", fontSize: ".83rem", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
              <i className="fa-solid fa-xmark" /> Xóa lọc
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: ".82rem", color: "#94a3b8", fontWeight: 600 }}>
            {filtered.length} / {guides.length} HDV
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#265C59" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }} />
            <p style={{ marginTop: 14, fontWeight: 600 }}>Đang tải danh sách HDV...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#94a3b8" }}>
            <i className="fa-solid fa-person-hiking" style={{ fontSize: 40, marginBottom: 14, display: "block" }} />
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#475569" }}>Không tìm thấy HDV phù hợp</p>
            <p style={{ fontSize: ".85rem", marginTop: 6 }}>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="hdv-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {filtered.map((g) => (
              <a key={g.id} href={`/hdv/${g.id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: g.is_featured ? "0 4px 24px rgba(229,169,25,.25)" : "0 2px 12px rgba(0,0,0,.06)", border: g.is_featured ? "2px solid #E5A919" : "none", transition: "transform .2s,box-shadow .2s", cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,.12)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}>
                  {/* Image */}
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#f1f5f9" }}>
                    <img src={g.image_url} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s" }} />
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", color: "#E5A919", borderRadius: 8, padding: "4px 10px", fontSize: ".78rem", fontWeight: 800 }}>
                      {g.rating}★
                    </div>
                    {g.is_featured && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "#E5A919", color: "white", borderRadius: 6, padding: "3px 10px", fontSize: ".65rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                        ⭐ Nổi Bật
                      </div>
                    )}
                    {!g.is_featured && g.languages?.includes("English") && (
                      <div style={{ position: "absolute", top: 10, left: 10, background: "#265C59", color: "white", borderRadius: 6, padding: "3px 8px", fontSize: ".65rem", fontWeight: 700 }}>EN</div>
                    )}
                    {g.is_featured && g.languages?.includes("English") && (
                      <div style={{ position: "absolute", top: 36, left: 10, background: "#265C59", color: "white", borderRadius: 6, padding: "3px 8px", fontSize: ".65rem", fontWeight: 700 }}>EN</div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: ".95rem", margin: "0 0 4px" }}>{g.name}</h3>
                    <p style={{ color: "#265C59", fontSize: ".75rem", fontWeight: 700, margin: "0 0 6px" }}>{g.specialty}</p>
                    {g.bio && <p style={{ color: "#64748b", fontSize: ".78rem", lineHeight: 1.6, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.bio}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <StarIcons rating={g.rating} />
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {g.years_experience > 0 && (
                          <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 8px", fontSize: ".7rem", fontWeight: 700 }}>
                            {g.years_experience} năm KN
                          </span>
                        )}
                      </div>
                    </div>
                    {g.zalo_number && (
                      <a href={`https://zalo.me/${g.zalo_number}`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, padding: "8px 0", borderRadius: 8, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".78rem", textDecoration: "none" }}>
                        <i className="fa-brands fa-comment-dots" /> Chat Zalo
                      </a>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
