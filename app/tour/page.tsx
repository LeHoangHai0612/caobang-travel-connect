"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Tour { id: string; title: string; description: string; image_url: string; price_from: number; duration: string; group_size: string; zalo_number: string; }

export default function TourList() {
  const [tours, setTours]     = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [bg, setBg]           = useState("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1600&q=75");

  useEffect(() => {
    Promise.all([
      supabase.from("tours").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("site_settings").select("key,value").eq("key", "tours_bg"),
    ]).then(([{ data: t }, { data: s }]) => {
      setTours(t ?? []);
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    });
  }, []);

  const filtered = tours.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      <div className="tour-list-hero" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(20,50,40,.78))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 24px 40px" }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 10 }}>
            <i className="fa-solid fa-map" style={{ marginRight: 7 }} />Trải Nghiệm Đặc Sắc
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, margin: "0 0 20px", textAlign: "center" }}>Các Gói Tour Cao Bằng</h1>
          <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm gói tour..."
              style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 50, border: "none", fontSize: ".88rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "7px 14px", borderRadius: 50, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.25)" }}>
            <i className="fa-solid fa-arrow-left" /> Trang Chủ
          </Link>
        </div>
      </div>

      <div className="tour-list-body" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} /></div>
        ) : (
          <>
            <p style={{ fontSize: ".82rem", color: "#94a3b8", marginBottom: 24, fontWeight: 600 }}>{filtered.length} gói tour</p>
            <div className="tour-cards-grid">
              {filtered.map(t => (
                <article key={t.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", transition: "all .2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 36px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}>
                  <div style={{ position: "relative", height: 200, overflow: "hidden", background: "#e2e8f0" }}>
                    {t.image_url
                      ? <img src={t.image_url} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-solid fa-map" style={{ fontSize: 40, color: "#94a3b8" }} /></div>}
                    {t.price_from > 0 && (
                      <div style={{ position: "absolute", top: 12, right: 12, background: "#265C59", color: "white", borderRadius: 8, padding: "5px 12px", fontSize: ".75rem", fontWeight: 800 }}>
                        Từ {t.price_from.toLocaleString("vi-VN")}đ
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                        <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{t.duration}
                      </span>
                      <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                        <i className="fa-solid fa-users" style={{ marginRight: 4 }} />{t.group_size}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: ".95rem", margin: "0 0 8px", lineHeight: 1.4 }}>{t.title}</h3>
                    <p style={{ fontSize: ".83rem", color: "#64748b", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>{t.description}</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link href={`/tour/${t.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 0", borderRadius: 10, border: "1.5px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".8rem", textDecoration: "none" }}>
                        <i className="fa-solid fa-eye" /> Chi Tiết
                      </Link>
                      <a href={`/dat-lich?tour=${t.id}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 0", borderRadius: 10, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".8rem", textDecoration: "none" }}>
                        <i className="fa-solid fa-calendar-check" /> Đặt Tour
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
