"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getTier, pointsToNextTier, TIERS } from "@/lib/loyalty";
import type { UserProfile, Booking } from "@/lib/database.types";

type BookingRow = Booking & { guides?: { name: string } | null };

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Chờ xử lý",   color: "#b45309", bg: "#fef3c7" },
  confirmed: { label: "Đã xác nhận", color: "#15803d", bg: "#dcfce7" },
  cancelled: { label: "Đã hủy",      color: "#b91c1c", bg: "#fee2e2" },
};

export default function TaiKhoanPage() {
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [email, setEmail]         = useState("");
  const [bookings, setBookings]   = useState<BookingRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editName, setEditName]   = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/dang-nhap"; return; }
      setEmail(session.user.email ?? "");
      const [{ data: prof }, { data: bk }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("bookings").select("*, guides(name)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setProfile(prof ?? null);
      setBookings(bk ?? []);
      setLoading(false);
    })();
  }, []);

  const openEdit = () => {
    setEditName(profile?.full_name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { data } = await supabase.from("user_profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq("id", profile.id).select().single();
    if (data) setProfile(data);
    setSaving(false);
    setEditing(false);
    setToast("Đã lưu thông tin!");
    setTimeout(() => setToast(""), 2500);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9f8" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#265C59" }} />
    </div>
  );

  const tier     = getTier(profile?.points ?? 0);
  const nextTier = pointsToNextTier(profile?.points ?? 0);
  const pts      = profile?.points ?? 0;
  const maxPts   = nextTier ? (pts + nextTier.needed) : 700;
  const pct      = Math.min((pts / maxPts) * 100, 100);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f4f1" }}>

      {/* ── Topbar ── */}
      <header style={{
        background: "white", borderBottom: "1px solid #e4e8e4",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,0,0,.05)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="Logo" width={34} height={34} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          <div style={{ lineHeight: 1.2 }}>
            <p style={{ fontWeight: 800, fontSize: ".88rem", color: "#1a2e2e" }}>Cao Bằng Travel Connect</p>
            <p style={{ fontSize: ".66rem", color: "#94a3b8", fontWeight: 500 }}>Tài khoản thành viên</p>
          </div>
        </a>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 16px", borderRadius: 8,
          border: "1.5px solid #e4e8e4", background: "none",
          cursor: "pointer", fontSize: ".8rem", fontWeight: 600, color: "#64748b",
        }}>
          <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
        </button>
      </header>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)",
          background: "#265C59", color: "white",
          padding: "10px 22px", borderRadius: 10,
          fontSize: ".83rem", fontWeight: 700, zIndex: 999,
          boxShadow: "0 4px 16px rgba(38,92,89,.3)",
        }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: 7 }} />{toast}
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 64px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Profile card ── */}
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,.06)" }}>

          {/* Slim accent bar */}
          <div style={{ height: 5, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}60)` }} />

          <div style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: `linear-gradient(135deg, ${tier.color}30, ${tier.color}15)`,
              border: `2px solid ${tier.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <i className={`fa-solid ${tier.icon}`} style={{ color: tier.color, fontSize: 28 }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  {profile?.full_name || "Chưa cập nhật tên"}
                </h1>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 12px", borderRadius: 20,
                  background: tier.color + "15", color: tier.color,
                  fontSize: ".72rem", fontWeight: 800,
                }}>
                  <i className={`fa-solid ${tier.icon}`} /> Hạng {tier.label}
                </span>
              </div>
              <p style={{ fontSize: ".82rem", color: "#64748b", marginBottom: 2 }}>{email}</p>
              {profile?.phone && (
                <p style={{ fontSize: ".82rem", color: "#64748b" }}>
                  <i className="fa-solid fa-phone" style={{ fontSize: ".72rem", marginRight: 5, color: "#94a3b8" }} />
                  {profile.phone}
                </p>
              )}
            </div>

            {/* Edit button */}
            {!editing && (
              <button onClick={openEdit} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 9,
                border: "1.5px solid #e2e8f0", background: "none",
                cursor: "pointer", fontSize: ".79rem", fontWeight: 700, color: "#334155",
              }}>
                <i className="fa-solid fa-pen" /> Chỉnh sửa
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing && (
            <div style={{ padding: "0 28px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Họ và tên"
                style={{ flex: 1, minWidth: 160, padding: "9px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: ".85rem", outline: "none", fontFamily: "inherit" }} />
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Số điện thoại" type="tel"
                style={{ flex: 1, minWidth: 140, padding: "9px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: ".85rem", outline: "none", fontFamily: "inherit" }} />
              <button onClick={handleSave} disabled={saving}
                style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#265C59", color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}>
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button onClick={() => setEditing(false)}
                style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "none", fontFamily: "inherit", fontSize: ".82rem", cursor: "pointer" }}>
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* ── Points + Tiers ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Points */}
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 16 }}>Điểm Tích Lũy</p>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: "2.8rem", fontWeight: 900, color: tier.color, lineHeight: 1 }}>{pts}</span>
              <span style={{ fontSize: ".8rem", color: "#94a3b8", fontWeight: 600 }}>điểm</span>
            </div>

            <p style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 14 }}>+50 điểm cho mỗi lần đặt tour</p>

            {/* Progress */}
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              <div style={{
                height: "100%", width: `${pct}%`, borderRadius: 99,
                background: `linear-gradient(90deg, ${tier.color}70, ${tier.color})`,
                transition: "width .9s cubic-bezier(.4,0,.2,1)",
              }} />
            </div>

            <p style={{ fontSize: ".74rem", color: "#64748b" }}>
              {nextTier
                ? <>Cần thêm <strong style={{ color: tier.color }}>{nextTier.needed}</strong> điểm → <strong>{nextTier.next}</strong></>
                : <span style={{ color: tier.color, fontWeight: 800 }}><i className="fa-solid fa-crown" style={{ marginRight: 5 }} />Hạng cao nhất!</span>}
            </p>

            {/* Discount badge */}
            {tier.discount > 0 && (
              <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: 10,
                background: tier.color + "0f", border: `1px solid ${tier.color}25`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <i className="fa-solid fa-tag" style={{ color: tier.color, fontSize: ".85rem" }} />
                <div>
                  <p style={{ fontSize: ".78rem", fontWeight: 800, color: tier.color }}>Ưu đãi: -{tier.discount}%</p>
                  <p style={{ fontSize: ".7rem", color: "#94a3b8", marginTop: 1 }}>+5% thêm khi book HDV từ 3 lần</p>
                </div>
              </div>
            )}
          </div>

          {/* Tier table */}
          <div style={{ background: "white", borderRadius: 18, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 16 }}>Bảng Hạng Thành Viên</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...TIERS].reverse().map((t) => {
                const active = t.name === tier.name;
                return (
                  <div key={t.name} style={{
                    display: "flex", alignItems: "center", gap: 11,
                    padding: "10px 12px", borderRadius: 11,
                    background: active ? t.color + "10" : "#f8fafc",
                    border: `1.5px solid ${active ? t.color + "35" : "transparent"}`,
                    transition: "all .2s",
                  }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: t.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 12 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: ".79rem", fontWeight: 700, color: active ? t.color : "#475569" }}>
                        {t.label}
                        {active && <span style={{ marginLeft: 6, fontSize: ".65rem", background: t.color, color: "white", padding: "1px 7px", borderRadius: 20 }}>Hiện tại</span>}
                      </p>
                      <p style={{ fontSize: ".68rem", color: "#94a3b8" }}>Từ {t.min} điểm</p>
                    </div>
                    <span style={{ fontSize: ".8rem", fontWeight: 800, color: t.discount > 0 ? t.color : "#cbd5e1" }}>
                      {t.discount > 0 ? `-${t.discount}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Booking history ── */}
        <div style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <p style={{ fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".09em" }}>Lịch Sử Đặt Tour</p>
              <p style={{ fontSize: ".88rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>{bookings.length} booking</p>
            </div>
            <a href="/#pricing" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 9,
              background: "#265C59", color: "white",
              textDecoration: "none", fontSize: ".79rem", fontWeight: 700,
            }}>
              <i className="fa-solid fa-plus" /> Đặt mới
            </a>
          </div>

          {bookings.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>
              <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 34, marginBottom: 12, display: "block" }} />
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Chưa có lịch đặt nào</p>
              <p style={{ fontSize: ".82rem" }}>Đặt tour đầu tiên để bắt đầu tích điểm!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Gói tour", "HDV", "Trạng thái", "Điểm", "Giảm giá", "Ngày"].map((h) => (
                      <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: ".67rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = STATUS[b.status] ?? STATUS.pending;
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "13px 18px", fontWeight: 700, color: "#0f172a", fontSize: ".84rem" }}>{b.package_type || "—"}</td>
                        <td style={{ padding: "13px 18px", color: "#475569", fontSize: ".84rem" }}>{b.guides?.name ?? "—"}</td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: "13px 18px", fontWeight: 800, color: "#265C59", fontSize: ".84rem" }}>{b.points_earned > 0 ? `+${b.points_earned}` : "—"}</td>
                        <td style={{ padding: "13px 18px", fontWeight: 800, color: "#d97706", fontSize: ".84rem" }}>{b.discount_pct > 0 ? `-${b.discount_pct}%` : "—"}</td>
                        <td style={{ padding: "13px 18px", color: "#94a3b8", fontSize: ".8rem", whiteSpace: "nowrap" }}>
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

      </div>
    </div>
  );
}
