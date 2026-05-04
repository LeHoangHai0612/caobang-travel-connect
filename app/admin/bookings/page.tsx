"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Booking {
  id: string;
  client_name: string;
  email: string;
  phone: string;
  package_type: string;
  preferred_date: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  discount_pct: number;
  points_earned: number;
  created_at: string;
  guide_id: string | null;
  guide_name?: string;
}

const STATUS_OPTIONS = [
  { value: "all",       label: "Tất cả"       },
  { value: "pending",   label: "Chờ xử lý"    },
  { value: "confirmed", label: "Đã xác nhận"  },
  { value: "cancelled", label: "Đã hủy"       },
];

const STATUS_LABEL: Record<string, string> = {
  pending:   "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

interface Toast { id: number; text: string; ok: boolean; }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (text: string, ok = true) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, ok }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, show };
}

export default function AdminBookings() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [filter, setFilter]         = useState("all");
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<string | null>(null);
  const [detail, setDetail]         = useState<Booking | null>(null);
  const { toasts, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("bookings")
      .select("id,client_name,email,phone,package_type,preferred_date,message,status,discount_pct,points_earned,created_at,guide_id")
      .order("created_at", { ascending: false });

    if (filter !== "all") q = q.eq("status", filter);

    const { data } = await q;
    if (!data) { setLoading(false); return; }

    // Lấy tên HDV nếu có guide_id
    const guideIds = [...new Set(data.map((b) => b.guide_id).filter(Boolean))] as string[];
    let guideMap: Record<string, string> = {};
    if (guideIds.length) {
      const { data: guides } = await supabase.from("guides").select("id,name").in("id", guideIds);
      guideMap = Object.fromEntries((guides ?? []).map((g) => [g.id, g.name]));
    }

    setBookings(data.map((b) => ({ ...b, guide_name: b.guide_id ? guideMap[b.guide_id] : undefined })));
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: "confirmed" | "cancelled") {
    setUpdating(id);
    await supabase.from("bookings").update({ status }).eq("id", id);

    const booking = bookings.find((b) => b.id === id) ?? detail;

    // Lấy admin hiện tại để ghi log
    const { data: { session } } = await supabase.auth.getSession();
    const adminId   = session?.user.id ?? "";
    const { data: adminProfile } = adminId
      ? await supabase.from("user_profiles").select("full_name").eq("id", adminId).single()
      : { data: null };
    const adminName = adminProfile?.full_name || session?.user.email || "Admin";

    if (status === "confirmed" && booking?.guide_id && booking?.preferred_date) {
      const date = booking.preferred_date.slice(0, 10);
      await supabase.from("guide_schedules").upsert({
        guide_id: booking.guide_id, date, status: "booked",
        booking_id: booking.id,
        note: `${booking.client_name} — ${booking.package_type}`,
        created_by: adminId, created_by_name: adminName,
      }, { onConflict: "guide_id,date" });
      // Ghi log
      const { data: g } = await supabase.from("guides").select("name").eq("id", booking.guide_id).single();
      await supabase.from("schedule_logs").insert({
        guide_id: booking.guide_id, guide_name: g?.name ?? "",
        date, action: "booked", admin_id: adminId, admin_name: adminName,
        note: `${booking.client_name} — ${booking.package_type}`,
      });
    }

    if (status === "cancelled" && booking?.guide_id && booking?.preferred_date) {
      const date = booking.preferred_date.slice(0, 10);
      await supabase.from("guide_schedules")
        .delete()
        .eq("guide_id", booking.guide_id)
        .eq("date", date)
        .eq("status", "booked")
        .eq("booking_id", booking.id);
      // Ghi log
      const { data: g } = await supabase.from("guides").select("name").eq("id", booking.guide_id).single();
      await supabase.from("schedule_logs").insert({
        guide_id: booking.guide_id, guide_name: g?.name ?? "",
        date, action: "cancelled", admin_id: adminId, admin_name: adminName,
        note: `${booking.client_name} — ${booking.package_type}`,
      });
    }

    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    if (detail?.id === id) setDetail((prev) => prev ? { ...prev, status } : prev);
    showToast(
      status === "confirmed" ? "✓ Đã xác nhận lịch thành công" : "✓ Đã hủy lịch",
      status === "confirmed"
    );
    setUpdating(null);
  }

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="admin-content">
      {/* Toast notifications */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.ok ? "#265C59" : "#dc2626",
            color: "white", padding: "12px 20px", borderRadius: 12,
            fontWeight: 700, fontSize: ".85rem",
            boxShadow: "0 4px 20px rgba(0,0,0,.2)",
            animation: "slideIn .25s ease",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <i className={`fa-solid ${t.ok ? "fa-circle-check" : "fa-circle-xmark"}`} />
            {t.text}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }`}</style>

      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Quản Lý Đặt Lịch</h1>
          <p className="admin-header-subtitle">Xác nhận hoặc hủy yêu cầu đặt tour</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: "2px solid",
              borderColor: filter === opt.value ? "#265C59" : "#e2e8f0",
              background: filter === opt.value ? "#265C59" : "white",
              color: filter === opt.value ? "white" : "#475569",
              fontWeight: 600,
              fontSize: ".82rem",
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span style={{
                marginLeft: 6,
                background: filter === opt.value ? "rgba(255,255,255,.25)" : "#f1f5f9",
                color: filter === opt.value ? "white" : "#64748b",
                borderRadius: 10,
                padding: "1px 7px",
                fontSize: ".75rem",
              }}>
                {counts[opt.value as keyof typeof counts]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26 }} />
          <p style={{ marginTop: 10 }}>Đang tải...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 36, marginBottom: 12, display: "block" }} />
          <p style={{ fontWeight: 600 }}>Không có đặt lịch nào.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="admin-table-wrap" style={{ borderRadius: 12, overflow: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Gói tour</th>
                  <th>HDV</th>
                  <th>Ngày mong muốn</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setDetail(b)}>
                    <td>
                      <div style={{ fontWeight: 700, color: "#1a2e2e" }}>{b.client_name}</div>
                      <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                        {new Date(b.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.phone}</div>
                      {b.email && <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>{b.email}</div>}
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontSize: ".85rem", lineHeight: 1.4 }}>{b.package_type || "—"}</div>
                      {b.discount_pct > 0 && (
                        <span style={{ fontSize: ".72rem", color: "#265C59", fontWeight: 700 }}>
                          -{b.discount_pct}% ưu đãi
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: ".85rem", color: b.guide_name ? "#1a2e2e" : "#94a3b8" }}>
                      {b.guide_name ?? "Chưa chọn"}
                    </td>
                    <td style={{ fontSize: ".85rem", color: "#475569" }}>
                      {b.preferred_date
                        ? new Date(b.preferred_date).toLocaleDateString("vi-VN")
                        : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <span className={`admin-badge admin-badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "warning"}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                      {b.status !== "confirmed" && (
                        <button
                          onClick={() => updateStatus(b.id, "confirmed")}
                          disabled={updating === b.id}
                          style={{
                            padding: "5px 12px", borderRadius: 8, border: "none",
                            background: "#dcfce7", color: "#16a34a",
                            fontWeight: 700, fontSize: ".75rem", cursor: "pointer",
                            marginRight: 6, opacity: updating === b.id ? .5 : 1,
                          }}
                        >
                          {updating === b.id ? <i className="fa-solid fa-spinner fa-spin" /> : "Xác nhận"}
                        </button>
                      )}
                      {b.status !== "cancelled" && (
                        <button
                          onClick={() => updateStatus(b.id, "cancelled")}
                          disabled={updating === b.id}
                          style={{
                            padding: "5px 12px", borderRadius: 8, border: "none",
                            background: "#fee2e2", color: "#dc2626",
                            fontWeight: 700, fontSize: ".75rem", cursor: "pointer",
                            opacity: updating === b.id ? .5 : 1,
                          }}
                        >
                          Hủy
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>✓ Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setDetail(null)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: "#265C59", padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>Chi tiết đặt lịch</p>
                <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".78rem", margin: "4px 0 0" }}>
                  #{detail.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: ".9rem" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <Row icon="fa-user"            label="Họ tên"        value={detail.client_name} />
              <Row icon="fa-phone"           label="Điện thoại"    value={detail.phone} />
              {detail.email && <Row icon="fa-envelope" label="Email" value={detail.email} />}
              <Row icon="fa-bag-shopping"    label="Gói tour"      value={detail.package_type || "—"} />
              {detail.guide_name && <Row icon="fa-person-hiking" label="HDV" value={detail.guide_name} />}
              {detail.preferred_date && (
                <Row icon="fa-calendar"      label="Ngày mong muốn"
                  value={new Date(detail.preferred_date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
              )}
              {detail.message && <Row icon="fa-comment" label="Ghi chú" value={detail.message} />}
              {detail.discount_pct > 0 && <Row icon="fa-percent" label="Ưu đãi" value={`-${detail.discount_pct}%`} valueColor="#265C59" />}
              {detail.points_earned > 0 && <Row icon="fa-coins" label="Điểm thưởng" value={`+${detail.points_earned} điểm`} valueColor="#E5A919" />}
              <Row icon="fa-clock" label="Trạng thái"
                value={STATUS_LABEL[detail.status]}
                valueColor={detail.status === "confirmed" ? "#16a34a" : detail.status === "cancelled" ? "#dc2626" : "#b45309"} />
              <Row icon="fa-calendar-plus" label="Ngày đặt"
                value={new Date(detail.created_at).toLocaleString("vi-VN")} />

              {/* Actions */}
              {detail.status !== "confirmed" && detail.status !== "cancelled" && (
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    onClick={() => updateStatus(detail.id, "confirmed")}
                    disabled={updating === detail.id}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}
                  >
                    {updating === detail.id ? <i className="fa-solid fa-spinner fa-spin" /> : "Xác nhận lịch"}
                  </button>
                  <button
                    onClick={() => updateStatus(detail.id, "cancelled")}
                    disabled={updating === detail.id}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "2px solid #fee2e2", background: "white", color: "#dc2626", fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}
                  >
                    Hủy lịch
                  </button>
                </div>
              )}
              {detail.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(detail.id, "cancelled")}
                  disabled={updating === detail.id}
                  style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "2px solid #fee2e2", background: "white", color: "#dc2626", fontWeight: 700, fontSize: ".88rem", cursor: "pointer", marginTop: 8 }}
                >
                  Hủy lịch đã xác nhận
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <i className={`fa-solid ${icon}`} style={{ fontSize: 13, color: "#265C59" }} />
      </div>
      <div>
        <p style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
        <p style={{ fontSize: ".88rem", color: valueColor ?? "#1a2e2e", fontWeight: 600, margin: "2px 0 0", lineHeight: 1.5 }}>{value}</p>
      </div>
    </div>
  );
}
