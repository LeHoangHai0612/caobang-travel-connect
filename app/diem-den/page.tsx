"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Dest { id: string; title: string; description: string; image_url: string; sort_order: number; }

export default function DiemDenList() {
  const [dests, setDests]     = useState<Dest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [bg, setBg]           = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");

  useEffect(() => {
    Promise.all([
      supabase.from("destinations").select("*").order("sort_order"),
      supabase.from("site_settings").select("key,value").eq("key", "destinations_bg"),
    ]).then(([{ data: d }, { data: s }]) => {
      setDests(d ?? []);
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    });
  }, []);

  const filtered = dests.filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      <div style={{ position: "relative", height: 300, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(14,52,50,.78))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 24px 40px" }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 10 }}>
            <i className="fa-solid fa-map-location-dot" style={{ marginRight: 7 }} />Khám Phá
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, margin: "0 0 20px", textAlign: "center" }}>Điểm Đến Cao Bằng</h1>
          <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm điểm đến..."
              style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 50, border: "none", fontSize: ".88rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "7px 14px", borderRadius: 50, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.25)" }}>
            <i className="fa-solid fa-arrow-left" /> Trang Chủ
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} /></div>
        ) : (
          <>
            <p style={{ fontSize: ".82rem", color: "#94a3b8", marginBottom: 24, fontWeight: 600 }}>{filtered.length} điểm đến</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(d => (
                <article key={d.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", border: "1px solid #e2e8f0", transition: "all .2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 36px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}>
                  <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                    <img src={d.image_url} alt={d.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "")} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 50%, rgba(20,50,50,.4))" }} />
                  </div>
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#265C59", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: ".04em" }}>{d.title}</h3>
                    <p style={{ fontSize: ".83rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                      {d.description.length > 120 ? d.description.slice(0, 120) + "…" : d.description}
                    </p>
                    <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <a href={`/diem-den/${d.id}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#265C59", border: "1.5px solid #265C59", padding: "7px 16px", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, textDecoration: "none" }}>
                        <i className="fa-solid fa-book-open" /> Đọc Thêm
                      </a>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#265C59", color: "white", padding: "7px 16px", borderRadius: 50, fontSize: ".78rem", fontWeight: 700, cursor: "pointer" }}
                        onClick={() => { window.location.href = `/dat-lich?destination=${encodeURIComponent(d.title)}`; }}>
                        <i className="fa-solid fa-calendar-check" /> Đặt Tour
                      </div>
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
