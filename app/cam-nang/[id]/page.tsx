"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CamNangDetail() {
  const { id } = useParams<{ id: string }>();
  const [tip, setTip]         = useState<Tip | null>(null);
  const [related, setRelated] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [siteBg, setSiteBg]   = useState("");

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: t, error }, { data: all }, { data: s }] = await Promise.all([
        supabase.from("cam_nang_tips").select("*").eq("id", id).single(),
        supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order").limit(10),
        supabase.from("site_settings").select("key,value").eq("key", "cam_nang_bg"),
      ]);
      if (error || !t) { setNotFound(true); setLoading(false); return; }
      setTip(t);
      setRelated((all ?? []).filter((x: Tip) => x.id !== id).slice(0, 4));
      if (s?.[0]?.value) setSiteBg(s[0].value);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f0" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, color: "#265C59" }} />
    </div>
  );

  if (notFound || !tip) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f2f0", gap: 16 }}>
      <i className="fa-solid fa-book-open" style={{ fontSize: 40, color: "#94a3b8" }} />
      <p style={{ fontWeight: 700, color: "#334155" }}>Không tìm thấy bài cẩm nang này.</p>
      <a href="/cam-nang" style={{ color: "#265C59", fontWeight: 600, textDecoration: "none" }}>← Quay lại Cẩm Nang</a>
    </div>
  );

  const heroBg = tip.image_url || siteBg || "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75";
  const paragraphs = tip.content ? tip.content.split("\n").filter(Boolean) : [];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .cn-page { min-height: 100vh; background: #f0f2f0; font-family: 'Be Vietnam Pro', sans-serif; }

        .cn-topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,.06);
          padding: 0 24px; height: 58px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cn-back { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #265C59; font-weight: 700; font-size: .85rem; transition: gap .2s; }
        .cn-back:hover { gap: 12px; }
        .cn-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .cn-logo img { height: 32px; width: 32px; object-fit: contain; mix-blend-mode: multiply; }
        .cn-logo span { font-weight: 800; font-size: .82rem; color: #1a2e2e; }

        .cn-hero {
          position: relative; min-height: 340px;
          display: flex; align-items: flex-end; overflow: hidden;
        }
        .cn-hero-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: blur(18px) brightness(.5) saturate(.8);
          transform: scale(1.08);
        }
        .cn-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(10,30,30,.15) 0%, rgba(10,30,30,.78) 100%);
        }
        .cn-hero-content {
          position: relative; z-index: 2;
          width: 100%; max-width: 900px; margin: 0 auto;
          padding: 0 24px 40px;
          display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap;
        }
        .cn-hero-icon-wrap {
          width: 120px; height: 120px; border-radius: 18px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 4px solid rgba(255,255,255,.25);
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
        .cn-hero-info { flex: 1; min-width: 200px; padding-bottom: 4px; }
        .cn-hero-tag { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; display: flex; align-items: center; gap: 7px; }
        .cn-hero-title { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 900; color: white; line-height: 1.15; margin-bottom: 18px; }
        .cn-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .cn-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: #265C59; color: white;
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: opacity .2s;
        }
        .cn-btn-primary:hover { opacity: .88; }
        .cn-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(255,255,255,.15); color: white;
          border: 1.5px solid rgba(255,255,255,.35);
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: background .2s; backdrop-filter: blur(4px);
        }
        .cn-btn-ghost:hover { background: rgba(255,255,255,.25); }

        .cn-body { max-width: 900px; margin: 0 auto; padding: 28px 24px 64px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        @media (max-width: 700px) { .cn-body { grid-template-columns: 1fr; } .cn-hero-icon-wrap { width: 90px; height: 90px; } }

        .cn-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .cn-card-title { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .cn-card-title i { color: #265C59; }

        .cn-info-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .cn-info-item:last-child { border-bottom: none; }
        .cn-info-icon { width: 34px; height: 34px; border-radius: 9px; background: #f0faf9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cn-info-icon i { color: #265C59; font-size: .85rem; }
        .cn-info-label { font-size: .7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
        .cn-info-value { font-size: .88rem; color: #1e293b; font-weight: 600; margin-top: 2px; }

        .cn-cta { background: linear-gradient(135deg, #265C59, #3a9490); border-radius: 16px; padding: 24px; color: white; }
        .cn-cta h3 { font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .cn-cta p { font-size: .83rem; opacity: .85; line-height: 1.6; margin-bottom: 16px; }
        .cn-cta-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 10px; background: white; color: #265C59; font-family: 'Be Vietnam Pro', sans-serif; font-size: .85rem; font-weight: 800; text-decoration: none; transition: opacity .2s; }
        .cn-cta-btn:hover { opacity: .92; }

        .cn-related-item { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-decoration: none; }
        .cn-related-item:last-child { border-bottom: none; }
        .cn-related-item:hover { opacity: .75; }
      `}</style>

      <div className="cn-page">
        <header className="cn-topbar">
          <a href="/cam-nang" className="cn-back">
            <i className="fa-solid fa-arrow-left" /> Cẩm Nang
          </a>
          <a href="/" className="cn-logo">
            <img src="/logo.png" alt="Logo" />
            <span>Cao Bằng Travel Connect</span>
          </a>
        </header>

        <div className="cn-hero">
          <div className="cn-hero-bg" style={{ backgroundImage: `url('${heroBg}')` }} />
          <div className="cn-hero-overlay" />
          <div className="cn-hero-content">
            <div className="cn-hero-icon-wrap" style={{ background: tip.color + "22" }}>
              <i className={`fa-solid ${tip.icon}`} style={{ color: tip.color, fontSize: "2.8rem" }} />
            </div>
            <div className="cn-hero-info">
              <p className="cn-hero-tag">
                <i className={`fa-solid ${tip.icon}`} style={{ color: tip.color }} />
                Cẩm Nang · {tip.tag}
              </p>
              <h1 className="cn-hero-title">{tip.title}</h1>
              <div className="cn-hero-actions">
                <a href="/dat-lich" className="cn-btn-primary">
                  <i className="fa-solid fa-calendar-check" /> Đặt Tour Ngay
                </a>
                <a href="/cam-nang" className="cn-btn-ghost">
                  <i className="fa-solid fa-book-open" /> Tất Cả Cẩm Nang
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="cn-body">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="cn-card">
              <p className="cn-card-title"><i className="fa-solid fa-id-card" /> Tóm Tắt</p>
              <p style={{ fontSize: ".95rem", color: "#334155", lineHeight: 1.85, padding: "14px 18px", background: tip.color + "0d", borderLeft: `4px solid ${tip.color}`, borderRadius: "0 10px 10px 0" }}>
                {tip.description}
              </p>
            </div>

            {paragraphs.length > 0 && (
              <div className="cn-card">
                <p className="cn-card-title"><i className="fa-solid fa-align-left" /> Nội Dung Chi Tiết</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {paragraphs.map((p, i) => (
                    <p key={i} style={{ fontSize: ".92rem", color: "#374151", lineHeight: 1.85 }}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="cn-cta">
              <h3><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Sẵn Sàng Khám Phá Cao Bằng?</h3>
              <p>Đặt tour ngay hôm nay với hướng dẫn viên địa phương am hiểu từng ngõ ngách của vùng đất biên cương tuyệt đẹp này.</p>
              <a href="/dat-lich" className="cn-cta-btn">
                <i className="fa-solid fa-arrow-right" /> Đặt Lịch Ngay
              </a>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="cn-card">
              <p className="cn-card-title"><i className="fa-solid fa-circle-info" /> Thông Tin</p>
              <div className="cn-info-item">
                <div className="cn-info-icon">
                  <i className={`fa-solid ${tip.icon}`} style={{ color: tip.color }} />
                </div>
                <div>
                  <p className="cn-info-label">Chủ Đề</p>
                  <p className="cn-info-value">{tip.tag}</p>
                </div>
              </div>
              <div className="cn-info-item">
                <div className="cn-info-icon"><i className="fa-solid fa-map-location-dot" /></div>
                <div>
                  <p className="cn-info-label">Địa Điểm</p>
                  <p className="cn-info-value">Cao Bằng, Việt Nam</p>
                </div>
              </div>
              <div className="cn-info-item">
                <div className="cn-info-icon"><i className="fa-solid fa-person-hiking" /></div>
                <div>
                  <p className="cn-info-label">Dành Cho</p>
                  <p className="cn-info-value">Mọi du khách</p>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="cn-card">
                <p className="cn-card-title"><i className="fa-solid fa-book-open" /> Bài Khác</p>
                {related.map(r => (
                  <a key={r.id} href={`/cam-nang/${r.id}`} className="cn-related-item">
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa-solid ${r.icon}`} style={{ color: r.color, fontSize: ".9rem" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: ".78rem", fontWeight: 700, color: r.color, textTransform: "uppercase", letterSpacing: ".05em" }}>{r.tag}</p>
                      <p style={{ fontSize: ".86rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.35, marginTop: 2 }}>{r.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
