"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Tip { id: string; icon: string; tag: string; color: string; title: string; description: string; image_url: string; sort_order: number; }

export default function CamNangList() {
  const [tips, setTips]       = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [bg, setBg]           = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");

  useEffect(() => {
    Promise.all([
      supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("site_settings").select("key,value").eq("key", "cam_nang_bg"),
    ]).then(([{ data: t }, { data: s }]) => {
      setTips(t ?? []);
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    });
  }, []);

  const filtered = tips.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25), rgba(14,42,40,.75))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 24px 40px" }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 10 }}>
            <i className="fa-solid fa-book-open" style={{ marginRight: 7 }} />Bí Quyết Khám Phá
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, margin: "0 0 20px", textAlign: "center" }}>Cẩm Nang Du Lịch Cao Bằng</h1>
          <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm cẩm nang..." autoFocus
              style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 50, border: "none", fontSize: ".88rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "7px 14px", borderRadius: 50, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.25)" }}>
            <i className="fa-solid fa-arrow-left" /> Trang Chủ
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <i className="fa-solid fa-search" style={{ fontSize: 32, marginBottom: 12, display: "block" }} />
            <p>Không tìm thấy kết quả phù hợp.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: ".82rem", color: "#94a3b8", marginBottom: 24, fontWeight: 600 }}>{filtered.length} bài cẩm nang</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(t => (
                <Link key={t.id} href={`/cam-nang/${t.id}`} style={{ textDecoration: "none" }}>
                  <article style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0", transition: "all .2s", height: "100%" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 36px rgba(0,0,0,.1)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}>
                    {t.image_url && <div style={{ height: 160, overflow: "hidden" }}><img src={t.image_url} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
                    <div style={{ padding: "20px 20px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 15 }} />
                        </div>
                        <span style={{ fontSize: ".68rem", fontWeight: 700, color: t.color, textTransform: "uppercase", letterSpacing: ".08em", background: t.color + "15", padding: "3px 10px", borderRadius: 20 }}>{t.tag}</span>
                      </div>
                      <h3 style={{ fontSize: ".95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.4 }}>{t.title}</h3>
                      <p style={{ fontSize: ".82rem", color: "#64748b", lineHeight: 1.65, margin: "0 0 14px" }}>{t.description}</p>
                      <span style={{ fontSize: ".78rem", fontWeight: 700, color: t.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        Đọc thêm <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
