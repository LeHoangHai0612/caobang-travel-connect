"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  guides: number;
  bookings: number;
  contacts: number;
  reviews: number;
}

interface Booking {
  id: string;
  client_name: string;
  phone: string;
  package_type: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ guides: 0, bookings: 0, contacts: 0, reviews: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [
        { count: guides },
        { count: bookings },
        { count: contacts },
        { count: reviews },
        { data: latestBookings },
      ] = await Promise.all([
        supabase.from("guides").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("id,client_name,phone,package_type,status,created_at").order("created_at", { ascending: false }).limit(8),
      ]);

      setStats({
        guides: guides ?? 0,
        bookings: bookings ?? 0,
        contacts: contacts ?? 0,
        reviews: reviews ?? 0,
      });
      setRecentBookings(latestBookings ?? []);
      setLoading(false);
    }
    loadStats();
  }, []);

  const statusLabel: Record<string, string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };

  const statCards = [
    { icon: "fa-users",          label: "Hướng Dẫn Viên", value: stats.guides,   color: "#265C59" },
    { icon: "fa-calendar-check", label: "Đặt Tour",        value: stats.bookings, color: "#3a9490" },
    { icon: "fa-envelope",       label: "Liên Hệ",         value: stats.contacts, color: "#E5A919" },
    { icon: "fa-star",           label: "Đánh Giá",        value: stats.reviews,  color: "#c48d10" },
  ];

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
          <div className="admin-stat-grid">
            {statCards.map((card) => (
              <div key={card.label} className="admin-card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: card.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <i className={`fa-solid ${card.icon}`} style={{ fontSize: 22, color: card.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "#6b8888", fontWeight: 600, marginBottom: 4 }}>{card.label}</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: "#1a2e2e", lineHeight: 1 }}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-card" style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a2e2e", marginBottom: 20 }}>
              <i className="fa-solid fa-calendar-check" style={{ marginRight: 8, color: "#265C59" }} />
              Đặt Tour Gần Đây
            </h2>
            {recentBookings.length === 0 ? (
              <p style={{ color: "#6b8888", textAlign: "center", padding: "24px 0" }}>Chưa có đặt tour nào.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Điện thoại</th>
                      <th>Gói tour</th>
                      <th>Trạng thái</th>
                      <th>Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.client_name}</td>
                        <td>{b.phone}</td>
                        <td>{b.package_type}</td>
                        <td>
                          <span className={`admin-badge admin-badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "warning"}`}>
                            {statusLabel[b.status] ?? b.status}
                          </span>
                        </td>
                        <td style={{ color: "#6b8888" }}>
                          {new Date(b.created_at).toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
