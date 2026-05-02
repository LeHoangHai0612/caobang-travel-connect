"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

function StarRow({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#E5A919", letterSpacing: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <i key={s} className={`fa-${s <= Math.floor(rating) ? "solid" : rating >= s - 0.5 ? "solid fa-star-half-stroke" : "regular"} fa-star`} style={{ fontSize: ".9rem" }} />
      ))}
    </span>
  );
}

export default function GuideProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("guides").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setGuide(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Be Vietnam Pro', sans-serif", background: "#f0f2f0" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, color: "#265C59" }} />
    </div>
  );

  if (notFound || !guide) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Be Vietnam Pro', sans-serif", background: "#f0f2f0", gap: 16 }}>
      <i className="fa-solid fa-user-slash" style={{ fontSize: 40, color: "#94a3b8" }} />
      <p style={{ fontWeight: 700, color: "#334155" }}>Không tìm thấy hướng dẫn viên</p>
      <a href="/#team" style={{ color: "#265C59", fontWeight: 600, textDecoration: "none" }}>← Quay lại danh sách</a>
    </div>
  );

  const specialties = guide.specialty.split("·").map((s) => s.trim()).filter(Boolean);
  const langs = guide.languages ? guide.languages.split(",").map((l) => l.trim()) : ["Tiếng Việt"];
  const hasBio = guide.bio && guide.bio.trim().length > 0;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .hdv-page { min-height: 100vh; background: #f0f2f0; font-family: 'Be Vietnam Pro', sans-serif; }

        /* Topbar */
        .hdv-topbar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,.92); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,.06);
          padding: 0 24px; height: 58px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .hdv-back { display: flex; align-items: center; gap: 8px; text-decoration: none; color: #265C59; font-weight: 700; font-size: .85rem; transition: gap .2s; }
        .hdv-back:hover { gap: 12px; }
        .hdv-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .hdv-logo img { height: 32px; width: 32px; object-fit: contain; mix-blend-mode: multiply; }
        .hdv-logo span { font-weight: 800; font-size: .82rem; color: #1a2e2e; }

        /* Hero */
        .hdv-hero {
          position: relative; min-height: 340px;
          display: flex; align-items: flex-end;
          overflow: hidden;
        }
        .hdv-hero-bg {
          position: absolute; inset: 0;
          background-size: cover; background-position: center top;
          filter: blur(18px) brightness(.55) saturate(.8);
          transform: scale(1.08);
        }
        .hdv-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(10,30,30,.2) 0%, rgba(10,30,30,.75) 100%);
        }
        .hdv-hero-content {
          position: relative; z-index: 2;
          width: 100%; max-width: 900px; margin: 0 auto;
          padding: 0 24px 36px;
          display: flex; align-items: flex-end; gap: 28px; flex-wrap: wrap;
        }
        .hdv-photo {
          width: 130px; height: 130px; border-radius: 18px;
          object-fit: cover; object-position: top;
          border: 4px solid rgba(255,255,255,.25);
          box-shadow: 0 8px 32px rgba(0,0,0,.35);
          flex-shrink: 0;
        }
        .hdv-hero-info { flex: 1; min-width: 200px; padding-bottom: 4px; }
        .hdv-hero-role { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.65); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
        .hdv-hero-name { font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: white; line-height: 1.15; margin-bottom: 8px; }
        .hdv-hero-spec { font-size: .88rem; color: rgba(255,255,255,.8); margin-bottom: 12px; }
        .hdv-hero-rating { display: flex; align-items: center; gap: 8px; }
        .hdv-hero-rating-num { font-size: 1.1rem; font-weight: 900; color: #E5A919; }
        .hdv-hero-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .hdv-btn-zalo {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: #0068FF; color: white;
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: opacity .2s;
        }
        .hdv-btn-zalo:hover { opacity: .88; }
        .hdv-btn-book {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(255,255,255,.15); color: white;
          border: 1.5px solid rgba(255,255,255,.35);
          font-family: 'Be Vietnam Pro', sans-serif; font-size: .82rem; font-weight: 700;
          text-decoration: none; transition: background .2s;
          backdrop-filter: blur(4px);
        }
        .hdv-btn-book:hover { background: rgba(255,255,255,.25); }

        /* Body */
        .hdv-body { max-width: 900px; margin: 0 auto; padding: 28px 24px 64px; display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
        @media (max-width: 700px) { .hdv-body { grid-template-columns: 1fr; } }

        /* Cards */
        .hdv-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .hdv-card-title { font-size: .7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .09em; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .hdv-card-title i { color: #265C59; }

        /* Bio */
        .hdv-bio-text { font-size: .9rem; color: #334155; line-height: 1.8; }
        .hdv-bio-placeholder { font-size: .88rem; color: #94a3b8; line-height: 1.7; font-style: italic; }

        /* Info grid */
        .hdv-info-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .hdv-info-item:last-child { border-bottom: none; }
        .hdv-info-icon { width: 34px; height: 34px; border-radius: 9px; background: #f0faf9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hdv-info-icon i { color: #265C59; font-size: .85rem; }
        .hdv-info-label { font-size: .7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
        .hdv-info-value { font-size: .88rem; color: #1e293b; font-weight: 600; margin-top: 2px; }

        /* Specialty tags */
        .hdv-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .hdv-tag { padding: 5px 14px; border-radius: 20px; font-size: .78rem; font-weight: 600; background: rgba(38,92,89,.08); color: #265C59; }

        /* CTA card */
        .hdv-cta { background: linear-gradient(135deg, #265C59, #3a9490); border-radius: 16px; padding: 24px; color: white; margin-top: 20px; }
        .hdv-cta h3 { font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .hdv-cta p { font-size: .83rem; opacity: .85; line-height: 1.6; margin-bottom: 16px; }
        .hdv-cta-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 10px; background: white; color: #265C59; font-family: 'Be Vietnam Pro', sans-serif; font-size: .85rem; font-weight: 800; text-decoration: none; transition: opacity .2s; }
        .hdv-cta-btn:hover { opacity: .92; }
      `}</style>

      <div className="hdv-page">
        {/* Topbar */}
        <header className="hdv-topbar">
          <a href="/#team" className="hdv-back">
            <i className="fa-solid fa-arrow-left" /> Danh sách HDV
          </a>
          <a href="/" className="hdv-logo">
            <img src="/logo.png" alt="Logo" />
            <span>Cao Bằng Travel Connect</span>
          </a>
        </header>

        {/* Hero */}
        <div className="hdv-hero">
          <div className="hdv-hero-bg" style={{ backgroundImage: `url('${guide.image_url}')` }} />
          <div className="hdv-hero-overlay" />
          <div className="hdv-hero-content">
            <img src={guide.image_url} alt={guide.name} className="hdv-photo" />
            <div className="hdv-hero-info">
              <p className="hdv-hero-role">{guide.role}</p>
              <h1 className="hdv-hero-name">{guide.name}</h1>
              <p className="hdv-hero-spec">{guide.specialty}</p>
              <div className="hdv-hero-rating">
                <span className="hdv-hero-rating-num">{guide.rating}</span>
                <StarRow rating={guide.rating} />
                <span style={{ color: "rgba(255,255,255,.6)", fontSize: ".8rem" }}>Đánh giá</span>
              </div>
              <div className="hdv-hero-actions">
                {guide.zalo_number && (
                  <a href={`https://zalo.me/${guide.zalo_number}`} target="_blank" rel="noopener noreferrer" className="hdv-btn-zalo">
                    <i className="fa-brands fa-comment-dots" /> Chat Zalo
                  </a>
                )}
                <a href="/#pricing" className="hdv-btn-book">
                  <i className="fa-solid fa-calendar-check" /> Đặt Lịch Ngay
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="hdv-body">
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Bio */}
            <div className="hdv-card">
              <p className="hdv-card-title"><i className="fa-solid fa-id-card" /> Giới Thiệu</p>
              {hasBio
                ? <p className="hdv-bio-text">{guide.bio}</p>
                : <p className="hdv-bio-placeholder">
                    {guide.name} là hướng dẫn viên địa phương với {guide.years_experience} năm kinh nghiệm dẫn tour tại Cao Bằng.
                    Chuyên về {guide.specialty.replace("HDV ·", "").trim()}, {guide.name.split(" ").pop()} am hiểu sâu về địa lý, văn hóa và lịch sử vùng đất biên giới này.
                    Mỗi chuyến đi cùng {guide.name} đều được cá nhân hóa để phù hợp với nhu cầu và sở thích của du khách.
                  </p>
              }

              {/* Specialty tags */}
              <div className="hdv-tags">
                {specialties.map((s, i) => <span key={i} className="hdv-tag">{s}</span>)}
              </div>
            </div>

            {/* CTA */}
            <div className="hdv-cta">
              <h3><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Đặt Lịch Với {guide.name.split(" ").pop()}</h3>
              <p>Liên hệ trực tiếp qua Zalo hoặc điền form đặt lịch. Chúng tôi sẽ xác nhận trong vòng 24 giờ.</p>
              <a href="/#pricing" className="hdv-cta-btn">
                <i className="fa-solid fa-arrow-right" /> Xem Gói Tour & Đặt Lịch
              </a>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick info */}
            <div className="hdv-card">
              <p className="hdv-card-title"><i className="fa-solid fa-circle-info" /> Thông Tin</p>

              <div className="hdv-info-item">
                <div className="hdv-info-icon"><i className="fa-solid fa-briefcase" /></div>
                <div>
                  <p className="hdv-info-label">Kinh Nghiệm</p>
                  <p className="hdv-info-value">{guide.years_experience} năm</p>
                </div>
              </div>

              <div className="hdv-info-item">
                <div className="hdv-info-icon"><i className="fa-solid fa-star" /></div>
                <div>
                  <p className="hdv-info-label">Đánh Giá</p>
                  <p className="hdv-info-value">{guide.rating} / 5.0 ★</p>
                </div>
              </div>

              <div className="hdv-info-item">
                <div className="hdv-info-icon"><i className="fa-solid fa-language" /></div>
                <div>
                  <p className="hdv-info-label">Ngôn Ngữ</p>
                  <p className="hdv-info-value">{langs.join(" · ")}</p>
                </div>
              </div>

              <div className="hdv-info-item">
                <div className="hdv-info-icon"><i className="fa-solid fa-map-location-dot" /></div>
                <div>
                  <p className="hdv-info-label">Khu Vực</p>
                  <p className="hdv-info-value">Cao Bằng, Việt Nam</p>
                </div>
              </div>

              {guide.zalo_number && (
                <div className="hdv-info-item">
                  <div className="hdv-info-icon"><i className="fa-brands fa-comment-dots" style={{ color: "#0068FF" }} /></div>
                  <div>
                    <p className="hdv-info-label">Zalo</p>
                    <p className="hdv-info-value">{guide.zalo_number}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact card */}
            {guide.zalo_number && (
              <div className="hdv-card" style={{ textAlign: "center" }}>
                <p className="hdv-card-title" style={{ justifyContent: "center" }}><i className="fa-solid fa-headset" /> Liên Hệ Nhanh</p>
                <p style={{ fontSize: ".82rem", color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>
                  Nhắn tin Zalo để tư vấn tour miễn phí và đặt lịch ngay hôm nay
                </p>
                <a href={`https://zalo.me/${guide.zalo_number}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, background: "#0068FF", color: "white", textDecoration: "none", fontWeight: 800, fontSize: ".85rem", fontFamily: "inherit" }}>
                  <i className="fa-brands fa-comment-dots" /> Chat Zalo Ngay
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
