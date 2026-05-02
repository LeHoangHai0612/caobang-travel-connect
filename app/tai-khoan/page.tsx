"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getTier, pointsToNextTier, TIERS } from "@/lib/loyalty";
import type { UserProfile, Booking } from "@/lib/database.types";

type BookingRow = Booking & { guides?: { name: string } | null };

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Chờ xử lý",   color: "#d97706", bg: "#fffbeb" },
  confirmed: { label: "Đã xác nhận", color: "#16a34a", bg: "#f0fdf4" },
  cancelled: { label: "Đã hủy",      color: "#dc2626", bg: "#fef2f2" },
};

export default function TaiKhoanPage() {
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [email, setEmail]       = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setEmail(session.user.email ?? "");
      const [{ data: prof }, { data: bk }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("bookings").select("*, guides(name)")
          .eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(prof ?? null);
      setBookings(bk ?? []);
      setLoading(false);
    })();
  }, []);

  const openEdit = () => { setEditName(profile?.full_name ?? ""); setEditPhone(profile?.phone ?? ""); setEditing(true); setSaveMsg(""); };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { data } = await supabase.from("user_profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() })
      .eq("id", profile.id).select().single();
    if (data) setProfile(data);
    setSaving(false); setEditing(false); setSaveMsg("Đã lưu!");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const logout = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const tier     = getTier(profile?.points ?? 0);
  const nextTier = pointsToNextTier(profile?.points ?? 0);
  const pts      = profile?.points ?? 0;
  const pct      = Math.min((pts / 700) * 100, 100);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f0", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, color: "#265C59" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f0", fontFamily: "'Be Vietnam Pro', sans-serif" }}>

      {/* ── Header ── */}
      <header style={{ background: "white", borderBottom: "1px solid #e8ece8", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="Logo" width={36} height={36} style={{ objectFit: "contain", mixBlendMode: "multiply" }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: ".88rem", color: "#1a2e2e", lineHeight: 1.1 }}>Cao Bằng Travel Connect</p>
            <p style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 500 }}>Tài khoản thành viên</p>
          </div>
        </a>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: ".8rem", fontWeight: 600, color: "#64748b", transition: "all .2s" }}>
          <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
        </button>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 60px", display: "flex", flexDirection: "column", gap: 18 }}>

        {/* ── Profile card ── */}
        <div style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          {/* Banner */}
          <div style={{ height: 80, background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}99 100%)`, position: "relative" }}>
            <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", opacity: .18 }}>
              <i className={`fa-solid ${tier.icon}`} style={{ fontSize: 64, color: "white" }} />
            </div>
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -28, flexWrap: "wrap", gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: tier.color, border: "4px solid white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,.14)" }}>
                <i className={`fa-solid ${tier.icon}`} style={{ color: "white", fontSize: 24 }} />
              </div>
              <div style={{ display: "flex", gap: 8, paddingBottom: 2, alignItems: "center" }}>
                {saveMsg && <span style={{ fontSize: ".78rem", color: "#16a34a", fontWeight: 700 }}><i className="fa-solid fa-check" style={{ marginRight: 4 }} />{saveMsg}</span>}
                {!editing
                  ? <button onClick={openEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1.5px solid ${tier.color}40`, background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700, color: tier.color }}>
                      <i className="fa-solid fa-pen" /> Chỉnh sửa
                    </button>
                  : null}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{profile?.full_name || "Chưa cập nhật tên"}</p>
              <p style={{ fontSize: ".82rem", color: "#94a3b8", marginTop: 2 }}>{email}</p>
              {profile?.phone && <p style={{ fontSize: ".82rem", color: "#64748b", marginTop: 2 }}><i className="fa-solid fa-phone" style={{ marginRight: 6, fontSize: ".75rem" }} />{profile.phone}</p>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "4px 14px", borderRadius: 20, background: tier.color + "18", color: tier.color, fontSize: ".76rem", fontWeight: 800 }}>
                <i className={`fa-solid ${tier.icon}`} /> Hạng {tier.label}
              </span>
            </div>

            {/* Edit form */}
            {editing && (
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Họ và tên"
                  style={{ flex: 1, minWidth: 150, padding: "9px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontFamily: "inherit", fontSize: ".85rem", outline: "none" }} />
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Số điện thoại" type="tel"
                  style={{ flex: 1, minWidth: 130, padding: "9px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontFamily: "inherit", fontSize: ".85rem", outline: "none" }} />
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
        </div>

        {/* ── Points + Tiers row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Points card */}
          <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
            <p style={{ fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Điểm Tích Lũy</p>
            <p style={{ fontSize: "3rem", fontWeight: 900, color: tier.color, lineHeight: 1 }}>{pts}</p>
            <p style={{ fontSize: ".78rem", color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>điểm · +50 mỗi booking</p>

            {/* Progress */}
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 8, margin: "16px 0 8px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, borderRadius: 8, background: `linear-gradient(90deg, ${tier.color}80, ${tier.color})`, transition: "width .8s ease" }} />
            </div>
            <p style={{ fontSize: ".74rem", color: "#94a3b8" }}>
              {nextTier
                ? <>Cần thêm <strong style={{ color: tier.color }}>{nextTier.needed} điểm</strong> → hạng {nextTier.next}</>
                : <span style={{ color: tier.color, fontWeight: 700 }}><i className="fa-solid fa-crown" style={{ marginRight: 5 }} />Hạng cao nhất!</span>}
            </p>

            {tier.discount > 0 && (
              <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: tier.color + "10", border: `1px solid ${tier.color}25` }}>
                <p style={{ fontSize: ".78rem", fontWeight: 700, color: tier.color }}>
                  <i className="fa-solid fa-tag" style={{ marginRight: 6 }} />
                  Ưu đãi hiện tại: giảm {tier.discount}%
                </p>
                <p style={{ fontSize: ".72rem", color: "#94a3b8", marginTop: 3 }}>+5% khi book HDV từ 3 lần</p>
              </div>
            )}
          </div>

          {/* Tier table */}
          <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
            <p style={{ fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Bảng Hạng Thành Viên</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...TIERS].reverse().map((t) => {
                const active = t.name === tier.name;
                return (
                  <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: active ? t.color + "12" : "#f8fafc", border: `1.5px solid ${active ? t.color + "40" : "transparent"}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: t.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 13 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: ".8rem", fontWeight: 700, color: active ? t.color : "#334155" }}>Hạng {t.label}</p>
                      <p style={{ fontSize: ".7rem", color: "#94a3b8" }}>Từ {t.min} điểm</p>
                    </div>
                    <span style={{ fontSize: ".82rem", fontWeight: 800, color: t.color }}>{t.discount > 0 ? `-${t.discount}%` : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Booking history ── */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>Lịch Sử Đặt Tour</p>
              <p style={{ fontSize: ".88rem", fontWeight: 700, color: "#0f172a" }}>{bookings.length} booking</p>
            </div>
            <a href="/#pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#265C59", color: "white", textDecoration: "none", fontSize: ".78rem", fontWeight: 700 }}>
              <i className="fa-solid fa-plus" /> Đặt mới
            </a>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94a3b8" }}>
              <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 32, marginBottom: 12, display: "block" }} />
              <p style={{ fontWeight: 600 }}>Chưa có lịch đặt nào</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Gói tour", "Hướng dẫn viên", "Trạng thái", "Điểm thưởng", "Giảm giá", "Ngày đặt"].map((h) => (
                      <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = STATUS[b.status] ?? STATUS.pending;
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "13px 18px", fontWeight: 700, color: "#0f172a" }}>{b.package_type || "—"}</td>
                        <td style={{ padding: "13px 18px", color: "#475569" }}>{b.guides?.name ?? "—"}</td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: ".72rem", fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: "13px 18px", fontWeight: 700, color: "#265C59" }}>{b.points_earned > 0 ? `+${b.points_earned}` : "—"}</td>
                        <td style={{ padding: "13px 18px", fontWeight: 700, color: "#E5A919" }}>{b.discount_pct > 0 ? `-${b.discount_pct}%` : "—"}</td>
                        <td style={{ padding: "13px 18px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(b.created_at).toLocaleDateString("vi-VN")}</td>
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
