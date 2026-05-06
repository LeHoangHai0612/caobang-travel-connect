"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Tip {
  id: string;
  icon: string;
  tag: string;
  color: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  sort_order: number;
}

export default function CamNangDetail({ params }: { params: { id: string } }) {
  const [tip, setTip]           = useState<Tip | null>(null);
  const [related, setRelated]   = useState<Tip[]>([]);
  const [loading, setLoading]   = useState(true);
  const [siteBg, setSiteBg]     = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: all }, { data: s }] = await Promise.all([
        supabase.from("cam_nang_tips").select("*").eq("id", params.id).single(),
        supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order").limit(10),
        supabase.from("site_settings").select("key,value").eq("key", "cam_nang_bg"),
      ]);
      setTip(t ?? null);
      setRelated((all ?? []).filter((x: Tip) => x.id !== params.id).slice(0, 3));
      if (s?.[0]?.value) setSiteBg(s[0].value);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faf8" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} />
    </div>
  );

  if (!tip) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <i className="fa-solid fa-book-open" style={{ fontSize: 40, color: "#94a3b8" }} />
      <p style={{ color: "#64748b", fontWeight: 600 }}>Không tìm thấy bài cẩm nang này.</p>
      <Link href="/#cam-nang" style={{ color: "#265C59", fontWeight: 700, textDecoration: "none" }}>← Quay lại Cẩm Nang</Link>
    </div>
  );

  const heroBg = tip.image_url || siteBg || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75";
  const paragraphs = (tip.content || tip.description).split("\n").filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf8" }}>
      {/* Header ảnh */}
      <div style={{ position: "relative", height: "55vh", minHeight: 340, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${heroBg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.25) 0%, rgba(0,0,0,.55) 100%)" }} />

        {/* Back button */}
        <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10 }}>
          <Link href="/#cam-nang"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "8px 16px", borderRadius: 50, fontSize: ".82rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.3)" }}>
            <i className="fa-solid fa-arrow-left" /> Cẩm Nang
          </Link>
        </div>

        {/* Title overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 24px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: tip.color + "33", color: tip.color, border: `1px solid ${tip.color}55`, padding: "4px 14px", borderRadius: 50, fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", marginBottom: 14, backdropFilter: "blur(6px)" }}>
              <i className={`fa-solid ${tip.icon}`} /> {tip.tag}
            </span>
            <h1 style={{ color: "white", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 900, lineHeight: 1.15, margin: 0, textShadow: "0 2px 16px rgba(0,0,0,.3)" }}>
              {tip.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Nội dung */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        {/* Lead description */}
        <p style={{ fontSize: "1.05rem", color: "#374151", lineHeight: 1.8, fontWeight: 500, marginBottom: 32, padding: "20px 24px", background: tip.color + "0f", borderLeft: `4px solid ${tip.color}`, borderRadius: "0 12px 12px 0" }}>
          {tip.description}
        </p>

        {/* Full content */}
        {tip.content && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: ".95rem", color: "#374151", lineHeight: 1.85, margin: 0 }}>{p}</p>
            ))}
          </div>
        )}

        {/* Divider */}
        <hr style={{ margin: "48px 0 40px", border: "none", borderTop: "1px solid #e2e8f0" }} />

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: 20, letterSpacing: ".04em", textTransform: "uppercase" }}>
              <i className="fa-solid fa-book-open" style={{ color: "#265C59", marginRight: 10 }} />
              Bài Cẩm Nang Khác
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {related.map(r => (
                <Link key={r.id} href={`/cam-nang/${r.id}`}
                  style={{ display: "block", background: "white", borderRadius: 14, padding: "18px 16px", textDecoration: "none", border: "1px solid #e2e8f0", transition: "all .2s", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = ""; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,.05)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`fa-solid ${r.icon}`} style={{ color: r.color, fontSize: 14 }} />
                    </div>
                    <span style={{ fontSize: ".68rem", fontWeight: 700, color: r.color, textTransform: "uppercase", letterSpacing: ".06em" }}>{r.tag}</span>
                  </div>
                  <p style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.4 }}>{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/#cam-nang"
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#265C59", color: "white", padding: "13px 28px", borderRadius: 50, fontSize: ".86rem", fontWeight: 800, textDecoration: "none", letterSpacing: ".04em" }}>
            <i className="fa-solid fa-arrow-left" /> Xem Tất Cả Cẩm Nang
          </Link>
        </div>
      </div>
    </div>
  );
}
