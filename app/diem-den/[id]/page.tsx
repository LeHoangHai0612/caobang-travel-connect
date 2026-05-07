"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Dest {
  id: string;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export default function DiemDenDetail() {
  const { id } = useParams<{ id: string }>();
  const [dest, setDest]       = useState<Dest | null>(null);
  const [related, setRelated] = useState<Dest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: d, error }, { data: all }] = await Promise.all([
        supabase.from("destinations").select("*").eq("id", id).single(),
        supabase.from("destinations").select("*").order("sort_order"),
      ]);
      if (error || !d) { setNotFound(true); setLoading(false); return; }
      setDest(d);
      setRelated((all ?? []).filter((x: Dest) => x.id !== id).slice(0, 4));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f0" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, color: "#265C59" }} />
    </div>
  );

  if (notFound || !dest) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f0f2f0", gap: 16 }}>
      <i className="fa-solid fa-map-location-dot" style={{ fontSize: 40, color: "#94a3b8" }} />
      <p style={{ fontWeight: 700, color: "#334155" }}>Không tìm thấy điểm đến này.</p>
      <a href="/diem-den" style={{ color: "#265C59", fontWeight: 600, textDecoration: "none" }}>← Quay lại Điểm Đến</a>
    </div>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .dd-page { min-height: 100vh; background: #f0f2f0; font-family: 'Be Vietnam Pro', sans-serif; }

        .dd-topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,.06);
          padding: 0 24px; height: 58px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dd-back { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #265C59; font-weight: 700; font-size: .85rem; transition: gap .2s; }
        .dd-back:hover { gap: 12px; }
        .dd-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .dd-logo img { height: 32px; width: 32px; object-fit: contain; mix-blend-mode: multiply; }
        .dd-logo span { font-weight: 800; font-size: .82rem; color: #1a2e2e; }

        .dd-hero {
          position: relative; min-height: 360px;
          display: flex; align-items: flex-end; overflow: hidden;
        }
        .dd-hero-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center;
          filter: blur(18px) brightness(.5) saturate(.8);
          transform: scale(1.08);
        }
        .dd-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(10,30,30,.15) 0%, rgba(10,30,30,.78) 100%);
        }
        .dd-hero-content {
          position: relative; z-index: 2;
          width: 100%; max-width: 900px; margin: 0 auto;
          padding: 0 24px 40px;
          display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap;
        }
        .dd-hero-img {
          width: 150px; height: 150px; border-radius: 18px;
          object-fit: cover; flex-shrink: 0;
          border: 4px solid rgba(255,255,255,.25);
          box-shadow: 0 8px 32px rgba(0,0,0,.4);
        }
        .dd-hero-info { flex: 1; min-width: 200px; padding-bottom: 4px; }
        .dd-hero-tag { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; display: flex; align-items: center; gap: 7px; }
        .dd-hero-title { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 900; color: white; line-height: 1.15; margin-bottom: 18px; }
        .dd-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .dd-btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: #265C59; color: white;
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: opacity .2s;
        }
        .dd-btn-primary:hover { opacity: .88; }
        .dd-btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(255,255,255,.15); color: white;
          border: 1.5px solid rgba(255,255,255,.35);
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: background .2s; backdrop-filter: blur(4px);
        }
        .dd-btn-ghost:hover { background: rgba(255,255,255,.25); }

        .dd-body { max-width: 900px; margin: 0 auto; padding: 28px 24px 64px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        @media (max-width: 700px) { .dd-body { grid-template-columns: 1fr; } .dd-hero-img { width: 110px; height: 110px; } }

        .dd-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .dd-card-title { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .dd-card-title i { color: #265C59; }

        .dd-info-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .dd-info-item:last-child { border-bottom: none; }
        .dd-info-icon { width: 34px; height: 34px; border-radius: 9px; background: #f0faf9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dd-info-icon i { color: #265C59; font-size: .85rem; }
        .dd-info-label { font-size: .7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
        .dd-info-value { font-size: .88rem; color: #1e293b; font-weight: 600; margin-top: 2px; }

        .dd-cta { background: linear-gradient(135deg, #265C59, #3a9490); border-radius: 16px; padding: 24px; color: white; }
        .dd-cta h3 { font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .dd-cta p { font-size: .83rem; opacity: .85; line-height: 1.6; margin-bottom: 16px; }
        .dd-cta-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 10px; background: white; color: #265C59; font-family: 'Be Vietnam Pro', sans-serif; font-size: .85rem; font-weight: 800; text-decoration: none; transition: opacity .2s; }
        .dd-cta-btn:hover { opacity: .92; }

        .dd-related-item { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; text-decoration: none; transition: background .15s; }
        .dd-related-item:last-child { border-bottom: none; }
        .dd-related-item:hover { opacity: .8; }
        .dd-related-thumb { width: 52px; height: 52px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
      `}</style>

      <div className="dd-page">
        <header className="dd-topbar">
          <a href="/diem-den" className="dd-back">
            <i className="fa-solid fa-arrow-left" /> Điểm Đến
          </a>
          <a href="/" className="dd-logo">
            <img src="/logo.png" alt="Logo" />
            <span>Cao Bằng Travel Connect</span>
          </a>
        </header>

        <div className="dd-hero">
          <div className="dd-hero-bg" style={{ backgroundImage: `url('${dest.image_url}')` }} />
          <div className="dd-hero-overlay" />
          <div className="dd-hero-content">
            <img src={dest.image_url} alt={dest.title} className="dd-hero-img" />
            <div className="dd-hero-info">
              <p className="dd-hero-tag">
                <i className="fa-solid fa-map-location-dot" /> Điểm Đến · Cao Bằng
              </p>
              <h1 className="dd-hero-title">{dest.title}</h1>
              <div className="dd-hero-actions">
                <a href={`/dat-lich?destination=${encodeURIComponent(dest.title)}`} className="dd-btn-primary">
                  <i className="fa-solid fa-calendar-check" /> Đặt Tour Tham Quan
                </a>
                <a href="/diem-den" className="dd-btn-ghost">
                  <i className="fa-solid fa-grid-2" /> Tất Cả Điểm Đến
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="dd-body">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="dd-card">
              <p className="dd-card-title"><i className="fa-solid fa-circle-info" /> Giới Thiệu</p>
              <p style={{ fontSize: ".95rem", color: "#334155", lineHeight: 1.85 }}>{dest.description}</p>
            </div>

            <div className="dd-cta">
              <h3><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Khám Phá {dest.title}</h3>
              <p>Đặt tour tham quan ngay hôm nay để trải nghiệm vẻ đẹp tuyệt vời của điểm đến này cùng hướng dẫn viên địa phương chuyên nghiệp.</p>
              <a href={`/dat-lich?destination=${encodeURIComponent(dest.title)}`} className="dd-cta-btn">
                <i className="fa-solid fa-arrow-right" /> Đặt Tour Ngay
              </a>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="dd-card">
              <p className="dd-card-title"><i className="fa-solid fa-circle-info" /> Thông Tin</p>
              <div className="dd-info-item">
                <div className="dd-info-icon"><i className="fa-solid fa-map-location-dot" /></div>
                <div>
                  <p className="dd-info-label">Vị Trí</p>
                  <p className="dd-info-value">Cao Bằng, Việt Nam</p>
                </div>
              </div>
              <div className="dd-info-item">
                <div className="dd-info-icon"><i className="fa-solid fa-mountain-sun" /></div>
                <div>
                  <p className="dd-info-label">Loại Hình</p>
                  <p className="dd-info-value">Du lịch sinh thái</p>
                </div>
              </div>
              <div className="dd-info-item">
                <div className="dd-info-icon"><i className="fa-solid fa-calendar-days" /></div>
                <div>
                  <p className="dd-info-label">Thời Gian Đẹp</p>
                  <p className="dd-info-value">Tháng 9 – Tháng 11</p>
                </div>
              </div>
              <div className="dd-info-item">
                <div className="dd-info-icon"><i className="fa-solid fa-person-hiking" /></div>
                <div>
                  <p className="dd-info-label">Hướng Dẫn Viên</p>
                  <p className="dd-info-value">Có HDV địa phương</p>
                </div>
              </div>
            </div>

            {related.length > 0 && (
              <div className="dd-card">
                <p className="dd-card-title"><i className="fa-solid fa-map-location-dot" /> Điểm Đến Khác</p>
                {related.map(r => (
                  <a key={r.id} href={`/diem-den/${r.id}`} className="dd-related-item">
                    <img src={r.image_url} alt={r.title} className="dd-related-thumb" />
                    <div>
                      <p style={{ fontSize: ".86rem", fontWeight: 700, color: "#265C59", lineHeight: 1.4 }}>{r.title}</p>
                      <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                        Xem chi tiết <i className="fa-solid fa-arrow-right" style={{ fontSize: ".65rem" }} />
                      </p>
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
