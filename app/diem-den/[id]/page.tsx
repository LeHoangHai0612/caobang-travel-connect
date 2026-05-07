"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Dest {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export default function DiemDenDetail({ params }: { params: { id: string } }) {
  const [dest, setDest]       = useState<Dest | null>(null);
  const [related, setRelated] = useState<Dest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bg, setBg]           = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");

  useEffect(() => {
    async function load() {
      const [{ data: d }, { data: all }, { data: s }] = await Promise.all([
        supabase.from("destinations").select("*").eq("id", params.id).single(),
        supabase.from("destinations").select("*").order("sort_order"),
        supabase.from("site_settings").select("key,value").eq("key", "destinations_bg"),
      ]);
      setDest(d ?? null);
      setRelated((all ?? []).filter((x: Dest) => x.id !== params.id).slice(0, 3));
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faf8" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} />
    </div>
  );

  if (!dest) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <i className="fa-solid fa-map-location-dot" style={{ fontSize: 40, color: "#94a3b8" }} />
      <p style={{ color: "#64748b", fontWeight: 600 }}>Không tìm thấy điểm đến này.</p>
      <Link href="/diem-den" style={{ color: "#265C59", fontWeight: 700, textDecoration: "none" }}>← Quay lại Điểm Đến</Link>
    </div>
  );

  const heroBg = dest.image_url || bg;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      {/* Hero image */}
      <div style={{ position: "relative", height: "55vh", minHeight: 340, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.6) 100%)" }} />

        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}>
          <Link href="/diem-den"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "8px 16px", borderRadius: 50, fontSize: ".82rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.3)" }}>
            <i className="fa-solid fa-arrow-left" /> Điểm Đến
          </Link>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(38,92,89,.75)", color: "white", padding: "4px 14px", borderRadius: 50, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 14, backdropFilter: "blur(6px)" }}>
              <i className="fa-solid fa-map-location-dot" /> Điểm Đến Cao Bằng
            </span>
            <h1 style={{ color: "white", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 900, lineHeight: 1.15, margin: 0, textShadow: "0 2px 16px rgba(0,0,0,.4)" }}>
              {dest.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.85, fontWeight: 500, marginBottom: 36, padding: "20px 24px", background: "rgba(38,92,89,.06)", borderLeft: "4px solid #265C59", borderRadius: "0 12px 12px 0" }}>
          {dest.description}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
          <a href={`/dat-lich?destination=${encodeURIComponent(dest.title)}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#265C59", color: "white", padding: "13px 24px", borderRadius: 50, fontSize: ".86rem", fontWeight: 800, textDecoration: "none", letterSpacing: ".04em" }}>
            <i className="fa-solid fa-calendar-check" /> Đặt Tour Tham Quan
          </a>
          <Link href="/diem-den"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#475569", padding: "13px 24px", borderRadius: 50, fontSize: ".86rem", fontWeight: 700, textDecoration: "none", border: "1.5px solid #e2e8f0", letterSpacing: ".04em" }}>
            <i className="fa-solid fa-grid-2" /> Tất Cả Điểm Đến
          </Link>
        </div>

        {related.length > 0 && (
          <>
            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: 40 }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: ".04em", textTransform: "uppercase" }}>
              <i className="fa-solid fa-map-location-dot" style={{ color: "#265C59", marginRight: 10 }} />
              Điểm Đến Khác
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {related.map(r => (
                <Link key={r.id} href={`/diem-den/${r.id}`}
                  style={{ display: "block", borderRadius: 14, overflow: "hidden", textDecoration: "none", border: "1px solid #e2e8f0", transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = "translateY(-3px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform = ""; el.style.boxShadow = "0 2px 8px rgba(0,0,0,.05)"; }}>
                  {r.image_url && (
                    <div style={{ height: 130, overflow: "hidden" }}>
                      <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "14px 16px", background: "white" }}>
                    <p style={{ fontSize: ".88rem", fontWeight: 700, color: "#265C59", margin: "0 0 4px", lineHeight: 1.4 }}>{r.title}</p>
                    <span style={{ fontSize: ".75rem", color: "#265C59", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      Xem chi tiết <i className="fa-solid fa-arrow-right" style={{ fontSize: ".65rem" }} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
