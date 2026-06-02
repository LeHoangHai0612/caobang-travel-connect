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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/dang-nhap"; return; }
      
      const { data: profile } = await supabase.from("user_profiles").select("is_admin").eq("id", session.user.id).single();
      if (!profile?.is_admin) { window.location.href = "/"; return; }

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

  const updateBookingStatus = async (id: string, status: string) => {
    setLoading(true);
    await supabase.from("bookings").update({ status }).eq("id", id);
    setRecentBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    if (status === "confirmed") {
      setStats((prev) => ({ ...prev, pendingBookings: Math.max(0, prev.pendingBookings - 1) }));
    }
    if (status === "cancelled") {
      setStats((prev) => ({ ...prev, pendingBookings: Math.max(0, prev.pendingBookings - 1) }));
    }
    setLoading(false);
  };

  const statusLabel: Record<string, string> = {
    pending:   "Chờ xử lý",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };
  
  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const statCards = [
    { icon: "fa-person-hiking",    label: "Hướng Dẫn Viên", value: stats.guides,   color: "text-teal-800", bg: "bg-teal-50", sub: null },
    { icon: "fa-calendar-check",   label: "Đặt Tour",        value: stats.bookings, color: "text-teal-700", bg: "bg-teal-50", sub: stats.pendingBookings > 0 ? `${stats.pendingBookings} chờ xử lý` : null, subColor: "text-amber-600" },
    { icon: "fa-envelope",         label: "Liên Hệ",         value: stats.contacts, color: "text-amber-600", bg: "bg-amber-50", sub: stats.unreadContacts > 0 ? `${stats.unreadContacts} chưa đọc` : null, subColor: "text-amber-600" },
    { icon: "fa-star",             label: "Đánh Giá",        value: stats.reviews,  color: "text-amber-600", bg: "bg-amber-50", sub: stats.pendingReviews > 0 ? `${stats.pendingReviews} chờ duyệt` : null, subColor: "text-amber-600" },
  ];

  const maxTotal = Math.max(...monthStats.map((m) => m.total), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Tổng Quan</h1>
          <p className="text-sm font-medium text-slate-500">Chào mừng trở lại, Admin</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-teal-800">
          <i className="fa-solid fa-spinner fa-spin text-3xl" />
          <p className="mt-3 font-bold text-sm">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                  <i className={`fa-solid ${card.icon} text-xl ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{card.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{card.value}</p>
                  {card.sub && <p className={`text-[11px] font-bold mt-1.5 ${card.subColor}`}>{card.sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Recent bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* Monthly chart */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                <i className="fa-solid fa-chart-column mr-2 text-teal-800" />
                Đặt lịch 6 tháng gần đây
              </h2>
              <p className="text-xs text-slate-500 mb-6 font-medium flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-800" />Tổng</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-200" />Đã xác nhận</span>
              </p>
              
              <div className="flex items-end gap-2 sm:gap-4 h-[140px] px-1">
                {monthStats.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600">{m.total || ""}</span>
                    <div className="w-full relative flex flex-col justify-end h-[100px] group">
                      {/* Total bar */}
                      <div className="w-full bg-teal-800 rounded-t-sm absolute bottom-0 transition-all duration-500 hover:opacity-90" style={{ height: `${(m.total / maxTotal) * 100}%`, minHeight: m.total ? 4 : 0 }} />
                      {/* Confirmed bar */}
                      {m.confirmed > 0 && (
                        <div className="w-full bg-teal-200 rounded-t-sm absolute bottom-0 transition-all duration-500 hover:opacity-90" style={{ height: `${(m.confirmed / maxTotal) * 100}%`, minHeight: 4 }} />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-bold">{m.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tổng 6 tháng</p>
                  <p className="text-xl font-black text-teal-800 leading-none">{monthStats.reduce((s, m) => s + m.total, 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tỷ lệ xác nhận</p>
                  <p className="text-xl font-black text-teal-700 leading-none">
                    {monthStats.reduce((s, m) => s + m.total, 0) > 0
                      ? Math.round(monthStats.reduce((s, m) => s + m.confirmed, 0) / monthStats.reduce((s, m) => s + m.total, 0) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-4 sm:mb-5">
                <i className="fa-solid fa-clock-rotate-left mr-2 text-teal-800" />
                Đặt lịch gần đây
              </h2>
              {recentBookings.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fa-solid fa-calendar-xmark text-3xl text-slate-300 mb-3 block" />
                  <p className="text-sm font-medium text-slate-500">Chưa có đặt lịch nào.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {recentBookings.map((b, i) => (
                    <div key={b.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 ${i !== recentBookings.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                          <span className="font-black text-sm text-teal-800">{b.client_name[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{b.client_name}</p>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{b.package_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-13 sm:ml-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${statusColors[b.status] || "bg-slate-100 text-slate-600"}`}>
                          {statusLabel[b.status] ?? b.status}
                        </span>
                        {b.status === "pending" && (
                          <div className="flex gap-1 ml-2">
                            <button onClick={() => updateBookingStatus(b.id, "confirmed")} className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Duyệt">
                              <i className="fa-solid fa-check text-xs" />
                            </button>
                            <button onClick={() => updateBookingStatus(b.id, "cancelled")} className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors" title="Hủy">
                              <i className="fa-solid fa-xmark text-xs" />
                            </button>
                          </div>
                        )}
                      </div>
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
