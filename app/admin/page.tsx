"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  guides: number;
  bookings: number;
  contacts: number;
  reviews: number;
  pendingBookings: number;
  unreadContacts: number;
  pendingReviews: number;
}

interface Booking {
  id: string;
  client_name: string;
  phone: string;
  package_type: string;
  status: string;
  created_at: string;
}

interface MonthStat {
  label: string;
  total: number;
  confirmed: number;
}

function getLastSixMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

const VI_MONTHS = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

export default function AdminDashboard() {
  const [stats, setStats]               = useState<Stats>({ guides: 0, bookings: 0, contacts: 0, reviews: 0, pendingBookings: 0, unreadContacts: 0, pendingReviews: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [monthStats, setMonthStats]     = useState<MonthStat[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function loadStats() {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const [
        { count: guides },
        { count: bookings },
        { count: contacts },
        { count: reviews },
        { count: pendingBookings },
        { count: unreadContacts },
        { count: pendingReviews },
        { data: latestBookings },
        { data: chartData },
      ] = await Promise.all([
        supabase.from("guides").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contacts").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("bookings").select("id,client_name,phone,package_type,status,created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("bookings").select("created_at,status").gte("created_at", sixMonthsAgo.toISOString()),
      ]);

      setStats({ guides: guides ?? 0, bookings: bookings ?? 0, contacts: contacts ?? 0, reviews: reviews ?? 0, pendingBookings: pendingBookings ?? 0, unreadContacts: unreadContacts ?? 0, pendingReviews: pendingReviews ?? 0 });
      setRecentBookings(latestBookings ?? []);

      // Build monthly chart
      const months = getLastSixMonths();
      const map: Record<string, { total: number; confirmed: number }> = {};
      months.forEach((m) => { map[m] = { total: 0, confirmed: 0 }; });
      (chartData ?? []).forEach((b: { created_at: string; status: string }) => {
        const key = b.created_at.slice(0, 7);
        if (map[key]) { map[key].total++; if (b.status === "confirmed") map[key].confirmed++; }
      });
      setMonthStats(months.map((m) => {
        const [, mo] = m.split("-");
        return { label: VI_MONTHS[parseInt(mo) - 1], ...map[m] };
      }));

      setLoading(false);
    }
    loadStats();
  }, []);

  const statusLabel: Record<string, string> = {
    pending:   "Chờ xử lý",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };

  const statCards = [
    { icon: "fa-person-hiking",    label: "Hướng Dẫn Viên", value: stats.guides,   color: "#265C59", sub: null },
    { icon: "fa-calendar-check",   label: "Đặt Tour",        value: stats.bookings, color: "#3a9490", sub: stats.pendingBookings > 0 ? `${stats.pendingBookings} chờ xử lý` : null },
    { icon: "fa-envelope",         label: "Liên Hệ",         value: stats.contacts, color: "#E5A919", sub: stats.unreadContacts > 0 ? `${stats.unreadContacts} chưa đọc` : null },
    { icon: "fa-star",             label: "Đánh Giá",        value: stats.reviews,  color: "#c48d10", sub: stats.pendingReviews > 0 ? `${stats.pendingReviews} chờ duyệt` : null },
  ];

  const maxTotal = Math.max(...monthStats.map((m) => m.total), 1);

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Tổng Quan</h1>
          <p className="admin-header-subtitle">Chào mừng trở lại, Admin</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
          <p style={{ marginTop: 12 }}>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="admin-stat-grid">
            {statCards.map((card) => (
              <div key={card.label} className="admin-card" style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: card.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className={`fa-solid ${card.icon}`} style={{ fontSize: 20, color: card.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#6b8888", fontWeight: 600, marginBottom: 2 }}>{card.label}</p>
                  <p style={{ fontSize: 30, fontWeight: 800, color: "#1a2e2e", lineHeight: 1, margin: 0 }}>{card.value}</p>
                  {card.sub && <p style={{ fontSize: ".72rem", color: "#E5A919", fontWeight: 700, margin: "4px 0 0" }}>{card.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Recent bookings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>

            {/* Monthly chart */}
            <div className="admin-card">
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2e", marginBottom: 6 }}>
                <i className="fa-solid fa-chart-column" style={{ marginRight: 8, color: "#265C59" }} />
                Đặt lịch 6 tháng gần đây
              </h2>
              <p style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 20 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#265C59", marginRight: 5 }} />Tổng
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#a7f3d0", marginRight: 5, marginLeft: 12 }} />Đã xác nhận
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140, padding: "0 4px" }}>
                {monthStats.map((m) => (
                  <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: ".72rem", fontWeight: 700, color: "#475569" }}>{m.total || ""}</span>
                    <div style={{ width: "100%", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 100 }}>
                      {/* Total bar */}
                      <div style={{ width: "100%", background: "#265C59", borderRadius: "4px 4px 0 0", height: `${(m.total / maxTotal) * 100}%`, minHeight: m.total ? 4 : 0, position: "absolute", bottom: 0, transition: "height .4s ease" }} />
                      {/* Confirmed bar */}
                      {m.confirmed > 0 && (
                        <div style={{ width: "100%", background: "#a7f3d0", borderRadius: "4px 4px 0 0", height: `${(m.confirmed / maxTotal) * 100}%`, minHeight: 4, position: "absolute", bottom: 0, transition: "height .4s ease" }} />
                      )}
                    </div>
                    <span style={{ fontSize: ".72rem", color: "#94a3b8", fontWeight: 600 }}>{m.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "12px 0 0", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: ".7rem", color: "#94a3b8" }}>Tổng 6 tháng</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#265C59" }}>{monthStats.reduce((s, m) => s + m.total, 0)}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: ".7rem", color: "#94a3b8" }}>Tỷ lệ xác nhận</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#3a9490" }}>
                    {monthStats.reduce((s, m) => s + m.total, 0) > 0
                      ? Math.round(monthStats.reduce((s, m) => s + m.confirmed, 0) / monthStats.reduce((s, m) => s + m.total, 0) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="admin-card">
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2e", marginBottom: 16 }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: "#265C59" }} />
                Đặt lịch gần đây
              </h2>
              {recentBookings.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px 0", fontSize: ".85rem" }}>Chưa có đặt lịch nào.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentBookings.map((b) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0faf9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontWeight: 800, fontSize: ".78rem", color: "#265C59" }}>{b.client_name[0].toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: ".84rem", color: "#0f172a" }}>{b.client_name}</p>
                        <p style={{ margin: 0, fontSize: ".72rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.package_type}</p>
                      </div>
                      <span className={`admin-badge admin-badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "warning"}`} style={{ fontSize: ".7rem", flexShrink: 0 }}>
                        {statusLabel[b.status] ?? b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
