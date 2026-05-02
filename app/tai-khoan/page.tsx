"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getTier, pointsToNextTier, TIERS } from "@/lib/loyalty";
import type { UserProfile, Booking } from "@/lib/database.types";

type BookingWithGuide = Booking & { guides?: { name: string } | null };

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: "Chờ xử lý",    bg: "#fffbeb", color: "#d97706" },
  confirmed: { label: "Đã xác nhận",  bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { label: "Đã hủy",       bg: "#fef2f2", color: "#dc2626" },
};

export default function TaiKhoanPage() {
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [email, setEmail]       = useState("");
  const [bookings, setBookings] = useState<BookingWithGuide[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving]     = useState(false);
  const [saveOk, setSaveOk]     = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email ?? "");
      const [{ data: prof }, { data: bk }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("bookings").select("*, guides(name)").eq("user_id", session.user.id)
          .order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(prof ?? null);
      setBookings(bk ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { data } = await supabase.from("user_profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq("id", profile.id).select().single();
    if (data) setProfile(data);
    setSaving(false);
    setEditing(false);
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f3" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} />
    </div>
  );

  const tier    = getTier(profile?.points ?? 0);
  const nextTier = pointsToNextTier(profile?.points ?? 0);
  const pct     = Math.min(((profile?.points ?? 0) / 700) * 100, 100);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .tk-page { min-height: 100vh; background: #f0f2ef; font-family: 'Montserrat', sans-serif; }

        /* ── Topbar ── */
        .tk-topbar {
          background: white;
          border-bottom: 1px solid #e8ebe8;
          padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          height: 62px; position: sticky; top: 0; z-index: 100;
        }
        .tk-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .tk-logo img { height: 40px; width: 40px; object-fit: contain; }
        .tk-logo-text { font-weight: 800; font-size: .95rem; color: #1a3c3a; line-height: 1.1; }
        .tk-logo-text span { display: block; font-size: .7rem; color: #6b8888; font-weight: 500; }
        .tk-logout-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 16px; border-radius: 8px;
          border: 1.5px solid #e0e0e0; background: none;
          font-family: 'Montserrat', sans-serif; font-size: .82rem;
          font-weight: 700; color: #6b8888; cursor: pointer;
          transition: all .2s;
        }
        .tk-logout-btn:hover { border-color: #dc2626; color: #dc2626; }

        /* ── Main layout ── */
        .tk-main { max-width: 960px; margin: 0 auto; padding: 28px 16px 60px; display: flex; flex-direction: column; gap: 20px; }

        /* ── Profile hero card ── */
        .tk-hero {
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(38,92,89,.10);
        }
        .tk-hero-banner {
          height: 90px;
          background: linear-gradient(135deg, #1a3c3a 0%, #265C59 50%, #3a9490 100%);
          position: relative;
        }
        .tk-hero-banner::after {
          content: ''; position: absolute; inset: 0;
          background: url('/logo.png') right 24px center / 72px no-repeat;
          opacity: .12;
        }
        .tk-hero-body { background: white; padding: 0 28px 24px; }
        .tk-avatar-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-top: -32px; flex-wrap: wrap; }
        .tk-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          border: 4px solid white;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,.12);
        }
        .tk-edit-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 8px;
          border: 1.5px solid #e0e0e0; background: none;
          font-family: 'Montserrat', sans-serif;
          font-size: .82rem; font-weight: 700; color: #265C59;
          cursor: pointer; transition: all .2s;
        }
        .tk-edit-btn:hover { border-color: #265C59; background: #f0fdf4; }
        .tk-name { font-size: 1.2rem; font-weight: 900; color: #1a2e2e; margin-top: 10px; }
        .tk-email { font-size: .83rem; color: #9e9e9e; margin-top: 3px; }
        .tk-tier-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 4px 14px; border-radius: 20px;
          font-size: .78rem; font-weight: 800;
          margin-top: 10px;
        }

        /* ── Edit form ── */
        .tk-edit-form {
          background: #f9fbf9; border: 1.5px solid #e0e8e0;
          border-radius: 12px; padding: 18px 20px;
          display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
        }
        .tk-edit-form input {
          flex: 1; min-width: 150px; padding: 10px 14px;
          border: 1.5px solid #dde8dd; border-radius: 9px;
          font-family: 'Montserrat', sans-serif; font-size: .88rem;
          outline: none; transition: border-color .2s; background: white;
        }
        .tk-edit-form input:focus { border-color: #3a9490; }
        .tk-save-btn {
          padding: 10px 20px; border: none; border-radius: 9px;
          background: #265C59; color: white;
          font-family: 'Montserrat', sans-serif;
          font-size: .88rem; font-weight: 700; cursor: pointer; transition: opacity .2s;
        }
        .tk-save-btn:hover { opacity: .88; }
        .tk-cancel-btn {
          padding: 10px 16px; border: 1.5px solid #e0e0e0; border-radius: 9px;
          background: none; font-family: 'Montserrat', sans-serif;
          font-size: .88rem; font-weight: 600; color: #6b8888; cursor: pointer;
        }

        /* ── Stats row ── */
        .tk-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 540px) { .tk-stats { grid-template-columns: 1fr; } }

        .tk-card {
          background: white; border-radius: 16px;
          box-shadow: 0 2px 12px rgba(38,92,89,.07);
          padding: 22px 24px;
        }
        .tk-card-title { font-size: .78rem; font-weight: 700; color: #9e9e9e; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 14px; }

        /* Points card */
        .tk-points-num { font-size: 2.6rem; font-weight: 900; line-height: 1; }
        .tk-points-label { font-size: .82rem; color: #6b8888; font-weight: 600; margin-top: 4px; }
        .tk-progress-bar { height: 7px; background: #f0f0f0; border-radius: 8px; margin: 14px 0 8px; overflow: hidden; }
        .tk-progress-fill { height: 100%; border-radius: 8px; transition: width .8s ease; }
        .tk-progress-info { display: flex; justify-content: space-between; font-size: .75rem; color: #9e9e9e; }

        /* Tier list */
        .tk-tier-list { display: flex; flex-direction: column; gap: 8px; }
        .tk-tier-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          border: 1.5px solid transparent; transition: all .2s;
        }
        .tk-tier-row.active { border-color: currentColor; }
        .tk-tier-row-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .tk-tier-row-info { flex: 1; }
        .tk-tier-row-name { font-size: .82rem; font-weight: 700; }
        .tk-tier-row-min { font-size: .72rem; color: #9e9e9e; }
        .tk-tier-row-pct { font-size: .85rem; font-weight: 800; }

        /* Discount card */
        .tk-discount-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f4f4f4; }
        .tk-discount-item:last-child { border-bottom: none; }
        .tk-discount-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tk-discount-label { font-size: .83rem; font-weight: 600; color: #3d5555; }
        .tk-discount-val { font-size: .88rem; font-weight: 800; margin-left: auto; }

        /* Booking table */
        .tk-table-wrap { overflow-x: auto; }
        table.tk-table { width: 100%; border-collapse: collapse; font-size: .84rem; }
        .tk-table th { padding: 8px 12px; text-align: left; font-size: .72rem; font-weight: 700; color: #9e9e9e; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid #f0f0f0; white-space: nowrap; }
        .tk-table td { padding: 13px 12px; border-bottom: 1px solid #fafafa; vertical-align: middle; }
        .tk-table tr:last-child td { border-bottom: none; }
        .tk-table tr:hover td { background: #fafdf9; }
        .tk-status { display: inline-block; padding: 3px 11px; border-radius: 20px; font-size: .73rem; font-weight: 700; }
        .tk-empty { text-align: center; padding: 40px 0; color: #9e9e9e; }
        .tk-empty i { font-size: 32px; display: block; margin-bottom: 12px; }
        .tk-book-link {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 16px; padding: 9px 20px; border-radius: 8px;
          background: #265C59; color: white;
          text-decoration: none; font-size: .84rem; font-weight: 700;
          transition: opacity .2s;
        }
        .tk-book-link:hover { opacity: .88; }
      `}</style>

      <div className="tk-page">
        {/* Topbar */}
        <header className="tk-topbar">
          <a href="/" className="tk-logo">
            <Image src="/logo.png" alt="Cao Bằng Travel Connect" width={40} height={40} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
            <div className="tk-logo-text">
              Cao Bằng<span>Travel Connect</span>
            </div>
          </a>
          <button className="tk-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Đăng Xuất
          </button>
        </header>

        <main className="tk-main">
          {/* Profile hero */}
          <div className="tk-hero">
            <div className="tk-hero-banner" />
            <div className="tk-hero-body">
              <div className="tk-avatar-row">
                <div className="tk-avatar" style={{ background: tier.color + "22" }}>
                  <i className={`fa-solid ${tier.icon}`} style={{ color: tier.color, fontSize: 28 }} />
                </div>
                <div style={{ display: "flex", gap: 8, paddingBottom: 4, flexWrap: "wrap" }}>
                  {saveOk && <span style={{ fontSize: ".8rem", color: "#16a34a", fontWeight: 700, alignSelf: "center" }}><i className="fa-solid fa-check" style={{ marginRight: 5 }} />Đã lưu</span>}
                  {!editing && (
                    <button className="tk-edit-btn" onClick={() => { setEditing(true); setEditName(profile?.full_name ?? ""); setEditPhone(profile?.phone ?? ""); }}>
                      <i className="fa-solid fa-pen" /> Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              <p className="tk-name">{profile?.full_name || "Chưa cập nhật tên"}</p>
              <p className="tk-email">{email}</p>
              <span className="tk-tier-badge" style={{ background: tier.color + "18", color: tier.color }}>
                <i className={`fa-solid ${tier.icon}`} /> Hạng {tier.label}
              </span>

              {editing && (
                <div className="tk-edit-form" style={{ marginTop: 18 }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Họ và tên" />
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Số điện thoại" type="tel" />
                  <button className="tk-save-btn" onClick={handleSave} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
                  <button className="tk-cancel-btn" onClick={() => setEditing(false)}>Hủy</button>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="tk-stats">
            {/* Points card */}
            <div className="tk-card">
              <p className="tk-card-title">Điểm Tích Lũy</p>
              <p className="tk-points-num" style={{ color: tier.color }}>{profile?.points ?? 0}</p>
              <p className="tk-points-label">điểm · +50 mỗi booking</p>
              <div className="tk-progress-bar">
                <div className="tk-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})` }} />
              </div>
              <div className="tk-progress-info">
                {nextTier
                  ? <span>Cần <strong style={{ color: tier.color }}>{nextTier.needed} điểm</strong> → hạng {nextTier.next}</span>
                  : <span style={{ color: tier.color, fontWeight: 700 }}><i className="fa-solid fa-crown" /> Hạng cao nhất!</span>}
                <span>{profile?.points ?? 0}/700</span>
              </div>
            </div>

            {/* Tier overview card */}
            <div className="tk-card">
              <p className="tk-card-title">Bảng Hạng Thành Viên</p>
              <div className="tk-tier-list">
                {[...TIERS].reverse().map((t) => {
                  const isActive = t.name === tier.name;
                  return (
                    <div key={t.name} className={`tk-tier-row${isActive ? " active" : ""}`}
                      style={{ background: isActive ? t.color + "10" : "#fafafa", color: isActive ? t.color : "#9e9e9e" }}>
                      <div className="tk-tier-row-icon" style={{ background: t.color + "20" }}>
                        <i className={`fa-solid ${t.icon}`} style={{ color: t.color }} />
                      </div>
                      <div className="tk-tier-row-info">
                        <p className="tk-tier-row-name" style={{ color: isActive ? t.color : "#3d5555" }}>Hạng {t.label}</p>
                        <p className="tk-tier-row-min">Từ {t.min} điểm</p>
                      </div>
                      <span className="tk-tier-row-pct" style={{ color: t.color }}>{t.discount > 0 ? `-${t.discount}%` : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ưu đãi hiện tại */}
          {tier.discount > 0 && (
            <div className="tk-card" style={{ border: `1.5px solid ${tier.color}30` }}>
              <p className="tk-card-title">Ưu Đãi Đang Áp Dụng</p>
              <div className="tk-discount-item">
                <div className="tk-discount-icon" style={{ background: tier.color + "18" }}>
                  <i className={`fa-solid ${tier.icon}`} style={{ color: tier.color, fontSize: 15 }} />
                </div>
                <span className="tk-discount-label">Giảm giá hạng {tier.label}</span>
                <span className="tk-discount-val" style={{ color: tier.color }}>-{tier.discount}%</span>
              </div>
              <div className="tk-discount-item">
                <div className="tk-discount-icon" style={{ background: "#E5A91918" }}>
                  <i className="fa-solid fa-heart" style={{ color: "#E5A919", fontSize: 15 }} />
                </div>
                <span className="tk-discount-label">Khách thân thiết HDV (≥ 3 lần)</span>
                <span className="tk-discount-val" style={{ color: "#E5A919" }}>-5%</span>
              </div>
            </div>
          )}

          {/* Lịch sử đặt tour */}
          <div className="tk-card">
            <p className="tk-card-title">Lịch Sử Đặt Tour</p>
            {bookings.length === 0 ? (
              <div className="tk-empty">
                <i className="fa-solid fa-calendar-xmark" />
                <p>Bạn chưa có lịch đặt tour nào.</p>
                <a href="/#pricing" className="tk-book-link">
                  <i className="fa-solid fa-calendar-check" /> Đặt tour ngay
                </a>
              </div>
            ) : (
              <div className="tk-table-wrap">
                <table className="tk-table">
                  <thead>
                    <tr>
                      <th>Gói tour</th>
                      <th>Hướng dẫn viên</th>
                      <th>Trạng thái</th>
                      <th>Điểm</th>
                      <th>Giảm giá</th>
                      <th>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
                      return (
                        <tr key={b.id}>
                          <td style={{ fontWeight: 700, color: "#1a2e2e" }}>{b.package_type || "—"}</td>
                          <td style={{ color: "#4a6666" }}>{b.guides?.name ?? "—"}</td>
                          <td>
                            <span className="tk-status" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: "#265C59" }}>
                            {b.points_earned > 0 ? `+${b.points_earned}` : "—"}
                          </td>
                          <td style={{ fontWeight: 700, color: "#E5A919" }}>
                            {b.discount_pct > 0 ? `-${b.discount_pct}%` : "—"}
                          </td>
                          <td style={{ color: "#9e9e9e", whiteSpace: "nowrap" }}>
                            {new Date(b.created_at).toLocaleDateString("vi-VN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
