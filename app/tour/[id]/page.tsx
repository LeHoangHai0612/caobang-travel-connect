"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

interface Tour {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_from: number;
  duration: string;
  group_size: string;
  highlights: string;
  included: string;
  guide_count: number;
  zalo_number: string;
  created_at: string;
}

function fmt(price: number) {
  if (price === 0) return "Liên hệ";
  return price.toLocaleString("vi-VN") + "đ/người";
}

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour]       = useState<Tour | null>(null);
  const [guides, setGuides]   = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selGuides, setSelGuides] = useState<string[]>([]); // multi-select
  const [guideSearch, setGuideSearch] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("tours").select("*").eq("id", id).single(),
      supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }),
    ]).then(([{ data: t, error }, { data: g }]) => {
      if (error || !t) { setNotFound(true); setLoading(false); return; }
      setTour(t);
      setGuides(g ?? []);
      setLoading(false);
    });
  }, [id]);

  const filteredGuides = guides.filter((g) => {
    const q = guideSearch.toLowerCase();
    return !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
  });

  const maxGuides = tour?.guide_count ?? 1;
  const isMulti   = maxGuides > 1;

  function toggleGuide(id: string) {
    setSelGuides((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= maxGuides) return [...prev.slice(1), id]; // replace oldest
      return [...prev, id];
    });
  }

  const handleBook = () => {
    const params = new URLSearchParams({ tour: tour?.title ?? "", guides: selGuides.join(",") });
    window.location.href = `/?booking=1&${params}#pricing`;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9f8" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 30, color: "#265C59" }} />
    </div>
  );
  if (notFound || !tour) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 36, color: "#94a3b8" }} />
      <p style={{ fontWeight: 700, color: "#475569" }}>Không tìm thấy tour</p>
      <a href="/" style={{ color: "#265C59", fontWeight: 700, textDecoration: "none" }}>← Về trang chủ</a>
    </div>
  );

  const highlights = tour.highlights ? tour.highlights.split("|").filter(Boolean) : [];
  const included   = tour.included   ? tour.included.split("|").filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9f8" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.png" alt="Logo" width={28} height={28} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          <span style={{ fontWeight: 800, fontSize: ".88rem", color: "#1a2e2e" }}>Cao Bằng Travel Connect</span>
        </a>
        <a href="/" style={{ color: "#265C59", fontSize: ".82rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="fa-solid fa-arrow-left" /> Trang chủ
        </a>
      </header>

      {/* Hero image */}
      <div style={{ position: "relative", height: "min(420px, 55vw)", background: "#1a2e2e", overflow: "hidden" }}>
        {tour.image_url && (
          <img src={tour.image_url} alt={tour.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(.75)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 800, padding: "0 20px" }}>
          <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.4rem,4vw,2.2rem)", margin: "0 0 14px", textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>{tour.title}</h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { icon: "fa-clock",       val: tour.duration },
              { icon: "fa-users",       val: tour.group_size },
              { icon: "fa-person-hiking", val: `${tour.guide_count} HDV` },
            ].map((b) => (
              <span key={b.val} style={{ background: "rgba(255,255,255,.18)", backdropFilter: "blur(6px)", color: "white", borderRadius: 20, padding: "5px 14px", fontSize: ".78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <i className={`fa-solid ${b.icon}`} />{b.val}
              </span>
            ))}
            {tour.price_from > 0 && (
              <span style={{ background: "#265C59", color: "white", borderRadius: 20, padding: "5px 14px", fontSize: ".78rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fa-solid fa-tag" />Từ {fmt(tour.price_from)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px 60px", display: "grid", gridTemplateColumns: "1fr minmax(280px,340px)", gap: 24, alignItems: "start" }}>

        {/* Left: tour info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Description */}
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <h2 style={{ fontWeight: 800, color: "#1a2e2e", fontSize: "1rem", marginBottom: 12 }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: "#265C59" }} />Giới thiệu tour
            </h2>
            <p style={{ color: "#475569", lineHeight: 1.85, fontSize: ".9rem" }}>{tour.description}</p>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
              <h2 style={{ fontWeight: 800, color: "#1a2e2e", fontSize: "1rem", marginBottom: 14 }}>
                <i className="fa-solid fa-map-pin" style={{ marginRight: 8, color: "#265C59" }} />Điểm nổi bật
              </h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {highlights.map((h) => (
                  <li key={h} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#265C59", marginTop: 3, flexShrink: 0 }} />
                    <span style={{ color: "#334155", fontSize: ".88rem" }}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Included */}
          {included.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
              <h2 style={{ fontWeight: 800, color: "#1a2e2e", fontSize: "1rem", marginBottom: 14 }}>
                <i className="fa-solid fa-gift" style={{ marginRight: 8, color: "#265C59" }} />Dịch vụ bao gồm
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {included.map((item) => (
                  <span key={item} style={{ background: "#f0faf9", border: "1.5px solid #b2dfdb", color: "#265C59", borderRadius: 8, padding: "6px 12px", fontSize: ".8rem", fontWeight: 600 }}>
                    <i className="fa-solid fa-check" style={{ marginRight: 5 }} />{item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Guides */}
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <h2 style={{ fontWeight: 800, color: "#1a2e2e", fontSize: "1rem", marginBottom: 6 }}>
              <i className="fa-solid fa-person-hiking" style={{ marginRight: 8, color: "#265C59" }} />Chọn hướng dẫn viên
            </h2>
            <p style={{ color: "#94a3b8", fontSize: ".78rem", marginBottom: 10 }}>
              {isMulti
                ? `Tour cần ${maxGuides} HDV. Đã chọn ${selGuides.length}/${maxGuides}. ${selGuides.length < maxGuides ? `Chọn thêm ${maxGuides - selGuides.length} HDV.` : "Đủ rồi!"}`
                : "Chọn HDV hoặc để chúng tôi sắp xếp phù hợp nhất."}
            </p>
            {isMulti && selGuides.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {selGuides.map((gid) => {
                  const g = guides.find((x) => x.id === gid);
                  return g ? (
                    <span key={gid} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0faf9", border: "1.5px solid #265C59", borderRadius: 20, padding: "3px 10px 3px 6px", fontSize: ".75rem", fontWeight: 700, color: "#265C59" }}>
                      <img src={g.image_url} alt={g.name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                      {g.name}
                      <button onClick={() => toggleGuide(gid)} style={{ background: "none", border: "none", color: "#265C59", cursor: "pointer", padding: 0, lineHeight: 1, marginLeft: 2 }}>×</button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 10 }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }} />
              <input type="text" placeholder="Tìm HDV..." value={guideSearch} onChange={(e) => setGuideSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 10px 8px 30px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: ".83rem", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
              {/* "Để chúng tôi sắp xếp" — chỉ radio khi 1 HDV */}
              {!isMulti && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `2px solid ${selGuides.length === 0 ? "#265C59" : "#e2e8f0"}`, background: selGuides.length === 0 ? "#f0faf9" : "white", cursor: "pointer" }}>
                  <input type="radio" name="guide" value="" checked={selGuides.length === 0} onChange={() => setSelGuides([])} style={{ accentColor: "#265C59" }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: ".85rem", color: "#1a2e2e", margin: 0 }}>Để chúng tôi sắp xếp</p>
                    <p style={{ fontSize: ".72rem", color: "#94a3b8", margin: "2px 0 0" }}>HDV phù hợp nhất sẽ liên hệ bạn</p>
                  </div>
                </label>
              )}
              {filteredGuides.map((g) => {
                const checked = selGuides.includes(g.id);
                const disabled = isMulti && !checked && selGuides.length >= maxGuides;
                return (
                  <label key={g.id}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `2px solid ${checked ? "#265C59" : "#e2e8f0"}`, background: checked ? "#f0faf9" : disabled ? "#f8fafc" : "white", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1 }}>
                    <input
                      type={isMulti ? "checkbox" : "radio"}
                      name="guide"
                      value={g.id}
                      checked={checked}
                      disabled={disabled}
                      onChange={() => isMulti ? toggleGuide(g.id) : setSelGuides([g.id])}
                      style={{ accentColor: "#265C59" }}
                    />
                    <img src={g.image_url} alt={g.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: ".85rem", color: "#1a2e2e", margin: 0 }}>{g.name}</p>
                      <p style={{ fontSize: ".72rem", color: "#64748b", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.specialty}</p>
                    </div>
                    <span style={{ color: "#E5A919", fontSize: ".75rem", fontWeight: 700, flexShrink: 0 }}>{g.rating}★</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: booking card */}
        <div style={{ position: "sticky", top: 78 }}>
          <div style={{ background: "white", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,.1)", border: "1.5px solid #e2e8f0" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 4px" }}>Giá từ</p>
              <p style={{ fontWeight: 900, fontSize: "1.7rem", color: "#265C59", margin: 0, lineHeight: 1 }}>
                {tour.price_from > 0 ? tour.price_from.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
              </p>
              {tour.price_from > 0 && <p style={{ fontSize: ".72rem", color: "#94a3b8", margin: "4px 0 0" }}>/ người · chưa gồm vé tham quan</p>}
            </div>

            {[
              { icon: "fa-clock",        label: "Thời gian",    val: tour.duration },
              { icon: "fa-users",        label: "Nhóm",         val: tour.group_size },
              { icon: "fa-person-hiking",label: "Số lượng HDV", val: `${tour.guide_count} người` },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: ".82rem", color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className={`fa-solid ${r.icon}`} style={{ color: "#265C59", width: 14 }} />{r.label}
                </span>
                <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#1a2e2e" }}>{r.val}</span>
              </div>
            ))}

            {selGuides.length > 0 && (
              <div style={{ marginBottom: 14, padding: "10px 12px", background: "#f0faf9", borderRadius: 10, border: "1.5px solid #b2dfdb" }}>
                <p style={{ fontSize: ".7rem", fontWeight: 700, color: "#265C59", margin: "0 0 6px", textTransform: "uppercase" }}>HDV đã chọn ({selGuides.length}/{maxGuides})</p>
                {selGuides.map((gid) => {
                  const g = guides.find((x) => x.id === gid);
                  return g ? <p key={gid} style={{ fontSize: ".82rem", color: "#334155", margin: "2px 0", fontWeight: 600 }}>{g.name} · {g.specialty}</p> : null;
                })}
              </div>
            )}
            <button onClick={handleBook}
              style={{ width: "100%", marginTop: 20, padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#265C59,#3a9490)", color: "white", fontWeight: 800, fontSize: ".92rem", cursor: "pointer", letterSpacing: ".04em" }}>
              <i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Đặt Tour Này
            </button>

            {tour.zalo_number && (
              <a href={`https://zalo.me/${tour.zalo_number}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, padding: "11px 0", borderRadius: 12, border: "2px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".88rem", textDecoration: "none" }}>
                <i className="fa-brands fa-comment-dots" />Chat Zalo tư vấn
              </a>
            )}

            <p style={{ textAlign: "center", fontSize: ".72rem", color: "#94a3b8", marginTop: 14, lineHeight: 1.6 }}>
              Miễn phí tư vấn · Xác nhận trong 24h · Đặt cọc linh hoạt
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr minmax"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
