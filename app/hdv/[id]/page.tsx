"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const VI_DAYS_SHORT = ["CN","T2","T3","T4","T5","T6","T7"];
const VI_MONTHS_FULL = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                        "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function GuideCalendar({ guideId }: { guideId: string }) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guide_schedules")
      .select("date")
      .eq("guide_id", guideId)
      .gte("date", `${viewYear}-01-01`)
      .lte("date", `${viewYear}-12-31`);
    setBusyDates(new Set((data ?? []).map((d: { date: string }) => d.date)));
    setLoading(false);
  }, [guideId, viewYear]);

  useEffect(() => { load(); }, [load]);

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const busyThisMonth = cells.filter((d) => {
    if (!d) return false;
    const k = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return busyDates.has(k);
  }).length;
  const freeThisMonth = daysInMonth - busyThisMonth;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={prev}
          style={{ background: "#f0faf9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#265C59", fontWeight: 800, fontSize: "1rem" }}>
          ‹
        </button>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 800, fontSize: ".92rem", color: "#1a2e2e", margin: 0 }}>
            {VI_MONTHS_FULL[viewMonth]} {viewYear}
          </p>
          {!loading && (
            <p style={{ fontSize: ".68rem", color: "#94a3b8", margin: "2px 0 0" }}>
              {freeThisMonth} ngày trống · {busyThisMonth} ngày bận
            </p>
          )}
        </div>
        <button onClick={next}
          style={{ background: "#f0faf9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#265C59", fontWeight: 800, fontSize: "1rem" }}>
          ›
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
        {VI_DAYS_SHORT.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: ".62rem", fontWeight: 700, color: "#94a3b8", padding: "3px 0" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 18 }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const k       = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isPast  = k < todayKey;
            const isToday = k === todayKey;
            const isBusy  = busyDates.has(k);

            let bg     = "white";
            let color  = "#1e293b";
            let border = "1.5px solid #e2e8f0";
            let label  = "";

            if (isPast)    { bg = "#f8fafc"; color = "#cbd5e1"; border = "1.5px solid #f1f5f9"; }
            if (isBusy && !isPast) { bg = "#fee2e2"; color = "#dc2626"; border = "1.5px solid #fca5a5"; label = "Bận"; }
            if (isToday)   { border = "2px solid #265C59"; }
            if (!isBusy && !isPast) { bg = "#f0fdf4"; color = "#166534"; border = "1.5px solid #bbf7d0"; }

            return (
              <div key={i} title={isBusy && !isPast ? "HDV đã có lịch ngày này" : (!isPast ? "Còn trống" : "")}
                style={{ background: bg, color, border, borderRadius: 7, padding: "5px 0 4px", textAlign: "center", fontSize: ".75rem", fontWeight: isToday ? 800 : 600 }}>
                {day}
                {label && <div style={{ fontSize: ".52rem", lineHeight: 1, marginTop: 1 }}>{label}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { bg: "#f0fdf4", border: "#bbf7d0", label: "Còn trống" },
          { bg: "#fee2e2", border: "#fca5a5", label: "Đã có lịch" },
          { bg: "#f8fafc", border: "#f1f5f9", label: "Đã qua" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.border}` }} />
            <span style={{ fontSize: ".68rem", color: "#64748b", fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
                <a href={`/dat-lich?guide=${guide.id}`} className="hdv-btn-book">
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

            {/* Lịch làm việc */}
            <div className="hdv-card">
              <p className="hdv-card-title">
                <i className="fa-solid fa-calendar-days" /> Lịch Làm Việc
              </p>
              <p style={{ fontSize: ".78rem", color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>
                Xem ngày HDV còn trống để chọn thời gian phù hợp khi đặt lịch.
              </p>
              <GuideCalendar guideId={guide.id} />
              <a href={`/dat-lich?guide=${guide.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 16, padding: "10px", borderRadius: 10, background: "#265C59", color: "white", textDecoration: "none", fontWeight: 700, fontSize: ".82rem", fontFamily: "inherit" }}>
                <i className="fa-solid fa-calendar-check" /> Đặt Lịch Ngay
              </a>
            </div>

            {/* CTA */}
            <div className="hdv-cta">
              <h3><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />Đặt Lịch Với {guide.name.split(" ").pop()}</h3>
              <p>Liên hệ trực tiếp qua Zalo hoặc điền form đặt lịch. Chúng tôi sẽ xác nhận trong vòng 24 giờ.</p>
              <a href={`/dat-lich?guide=${guide.id}`} className="hdv-cta-btn">
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
