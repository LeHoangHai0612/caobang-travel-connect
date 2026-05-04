"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserRow {
  id: string;
  email: string;
  email_confirmed: boolean;
  full_name: string;
  phone: string;
  points: number;
  tier: string;
  is_admin: boolean;
  is_blocked: boolean;
  booking_count: number;
  created_at: string;
}

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  diamond: { label: "Kim Cương", color: "#3a9490" },
  gold:    { label: "Vàng",      color: "#E5A919" },
  silver:  { label: "Bạc",       color: "#9e9e9e" },
  bronze:  { label: "Đồng",      color: "#cd7f32" },
};

export default function AdminUsers() {
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Chưa đăng nhập."); setLoading(false); return; }

      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { setError("Không thể tải danh sách người dùng."); setLoading(false); return; }

      const { users: data } = await res.json();
      setUsers(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function patchUser(userId: string, fields: { is_admin?: boolean; is_blocked?: boolean }) {
    setToggling(userId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, ...fields }),
    });
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...fields } : u));
    setToggling(null);
  }

  function toggleAdmin(userId: string, cur: boolean) { patchUser(userId, { is_admin: !cur }); }
  function toggleBlock(userId: string, cur: boolean) { patchUser(userId, { is_blocked: !cur }); }

  const filtered = users.filter((u) =>
    !search.trim() ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Tài Khoản Người Dùng</h1>
          <p className="admin-header-subtitle">Quản lý thành viên và phân quyền Admin</p>
        </div>
        <span style={{ background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "6px 16px", fontWeight: 700, fontSize: ".82rem" }}>
          {users.length} tài khoản
        </span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }} />
        <input
          className="admin-form-input"
          style={{ paddingLeft: 38 }}
          placeholder="Tìm theo email, tên, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26 }} />
          <p style={{ marginTop: 10 }}>Đang tải...</p>
        </div>
      ) : error ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "40px 0", color: "#dc2626" }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 28, marginBottom: 10, display: "block" }} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <p style={{ fontSize: ".8rem", color: "#94a3b8", marginTop: 6 }}>Kiểm tra SUPABASE_SERVICE_ROLE_KEY trong Vercel.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
          <i className="fa-solid fa-users" style={{ fontSize: 32, marginBottom: 10, display: "block" }} />
          <p style={{ fontWeight: 600 }}>Không tìm thấy tài khoản nào.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="admin-table-wrap" style={{ borderRadius: 12, overflow: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Hạng</th>
                  <th style={{ textAlign: "center" }}>Đặt tour</th>
                  <th style={{ textAlign: "center" }}>Admin</th>
                  <th style={{ textAlign: "center" }}>Khóa</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const tier = TIER_LABEL[u.tier] ?? TIER_LABEL.bronze;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontWeight: 800, fontSize: ".82rem", color: "#265C59" }}>
                              {(u.full_name || u.email)[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: ".88rem" }}>{u.full_name || "—"}</div>
                            <div style={{ fontSize: ".73rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                              {u.email}
                              {!u.email_confirmed && (
                                <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 4, padding: "1px 5px", fontSize: ".65rem", fontWeight: 700 }}>Chưa xác nhận</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: ".83rem", color: "#475569" }}>{u.phone || "—"}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: ".82rem", color: tier.color }}>{tier.label}</span>
                          <span style={{ fontSize: ".72rem", color: "#94a3b8" }}>{u.points} điểm</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontWeight: 700, color: u.booking_count > 0 ? "#265C59" : "#94a3b8" }}>
                          {u.booking_count}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => toggleAdmin(u.id, u.is_admin)}
                          disabled={toggling === u.id}
                          title={u.is_admin ? "Bỏ quyền Admin" : "Cấp quyền Admin"}
                          style={{
                            width: 36, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                            background: u.is_admin ? "#265C59" : "#e2e8f0",
                            position: "relative", transition: "background .2s",
                            opacity: toggling === u.id ? .5 : 1,
                          }}>
                          <span style={{
                            position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: "white",
                            transition: "left .2s", left: u.is_admin ? 16 : 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }} />
                        </button>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => toggleBlock(u.id, u.is_blocked)}
                          disabled={toggling === u.id || u.is_admin}
                          title={u.is_admin ? "Không thể khóa Admin" : u.is_blocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          style={{
                            width: 36, height: 22, borderRadius: 11, border: "none", cursor: u.is_admin ? "not-allowed" : "pointer",
                            background: u.is_blocked ? "#dc2626" : "#e2e8f0",
                            position: "relative", transition: "background .2s",
                            opacity: toggling === u.id || u.is_admin ? .4 : 1,
                          }}>
                          <span style={{
                            position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: "white",
                            transition: "left .2s", left: u.is_blocked ? 16 : 2,
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }} />
                        </button>
                      </td>
                      <td style={{ fontSize: ".8rem", color: "#94a3b8" }}>
                        {new Date(u.created_at).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
