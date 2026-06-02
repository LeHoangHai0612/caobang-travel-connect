"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTier, pointsToNextTier, TIERS } from "@/lib/loyalty";
import type { UserProfile, Booking } from "@/lib/database.types";

type BookingRow = Booking & { guides?: { name: string } | null };

interface ContactRow {
  id: number;
  message: string;
  admin_reply: string;
  replied_at: string | null;
  replied_by: string;
  created_at: string;
}

const STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Chờ xử lý",   color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  confirmed: { label: "Đã xác nhận", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  cancelled: { label: "Đã hủy",      color: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
};

export default function TaiKhoanPage() {
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [email, setEmail]         = useState("");
  const [bookings, setBookings]   = useState<BookingRow[]>([]);
  const [contacts, setContacts]   = useState<ContactRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editName, setEditName]   = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState("");
  const [cancelId, setCancelId]   = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<BookingRow | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/dang-nhap"; return; }
      setEmail(session.user.email ?? "");
      const [{ data: prof }, { data: bk }, { data: ct }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("bookings").select("*, guides(name)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("contacts")
          .select("id,message,admin_reply,replied_at,replied_by,created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setProfile(prof ?? null);
      setBookings(bk ?? []);
      setContacts(ct ?? []);
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

  const cancelBooking = async (id: string) => {
    setCancelling(true);
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    setCancelId(null);
    setCancelling(false);
    setToast("Đã hủy lịch đặt.");
    setTimeout(() => setToast(""), 2500);
  };

  const submitReview = async () => {
    if (!reviewBooking || !profile) return;
    if (reviewText.trim().length < 10) {
      setToast("Vui lòng viết tối thiểu 10 ký tự.");
      setTimeout(() => setToast(""), 2500);
      return;
    }
    setSubmittingReview(true);
    await supabase.from("reviews").insert({
      reviewer_name: profile.full_name || "Khách ẩn danh",
      reviewer_location: "Từ hệ thống",
      stars: reviewStars,
      review_text: reviewText.trim(),
      avatar_url: "/av1.jpg",
      user_id: profile.id,
      is_approved: false
    });
    setSubmittingReview(false);
    setReviewBooking(null);
    setReviewText("");
    setReviewStars(5);
    setToast("Đã gửi đánh giá! Admin sẽ duyệt sớm.");
    setTimeout(() => setToast(""), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <i className="fa-solid fa-spinner fa-spin text-3xl text-teal-800" />
    </div>
  );

  const tier     = getTier(profile?.points ?? 0);
  const nextTier = pointsToNextTier(profile?.points ?? 0);
  const pts      = profile?.points ?? 0;
  const maxPts   = nextTier ? (pts + nextTier.needed) : 700;
  const pct      = Math.min((pts / maxPts) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-100 relative pb-safe">
      {/* Fixed scenic background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center blur-sm brightness-[0.45] saturate-[0.8] scale-105 pointer-events-none" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1600&q=70')" }} />
      <div className="fixed inset-0 z-0 bg-teal-950/35 pointer-events-none" />

      {/* ── Topbar ── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-white/30 px-6 h-[60px] flex items-center justify-between sticky top-0 z-[100] shadow-[0_1px_20px_rgba(0,0,0,0.12)] pt-safe">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image src="/logo.png" alt="Logo" width={34} height={34} className="object-contain mix-blend-multiply" />
          <div className="leading-tight">
            <p className="font-extrabold text-sm text-slate-900">Cao Bằng Travel Connect</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Tài khoản thành viên</p>
          </div>
        </Link>
        <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors active:scale-95">
          <i className="fa-solid fa-right-from-bracket" /> Đăng xuất
        </button>
      </header>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold z-[999] shadow-[0_4px_16px_rgba(15,118,110,0.3)] flex items-center gap-2 animate-in slide-in-from-top-4 fade-in">
          <i className="fa-solid fa-circle-check" />{toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-6 relative z-10">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Slim accent bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}60)` }} />

          <div className="p-6 sm:p-8 flex gap-5 sm:gap-6 items-start flex-wrap sm:flex-nowrap">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0" 
                 style={{ background: `linear-gradient(135deg, ${tier.color}30, ${tier.color}15)`, border: `2px solid ${tier.color}30` }}>
              <i className={`fa-solid ${tier.icon}`} style={{ color: tier.color, fontSize: 32 }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap mb-1.5">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {profile?.full_name || "Chưa cập nhật tên"}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide" 
                      style={{ background: tier.color + "15", color: tier.color }}>
                  <i className={`fa-solid ${tier.icon}`} /> Hạng {tier.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1 font-medium">{email}</p>
              {profile?.phone && (
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                  <i className="fa-solid fa-phone text-xs text-slate-400" />
                  {profile.phone}
                </p>
              )}
            </div>

            {/* Edit button */}
            {!editing && (
              <button onClick={openEdit} className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors active:scale-95">
                <i className="fa-solid fa-pen text-xs" /> Chỉnh sửa
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 flex-col sm:flex-row">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Họ và tên"
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-600 transition-colors" />
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Số điện thoại" type="tel"
                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-600 transition-colors" />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-900 transition-colors disabled:opacity-50">
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Points + Tiers ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Points */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Điểm Tích Lũy</p>

            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-4xl sm:text-5xl font-black leading-none" style={{ color: tier.color }}>{pts}</span>
              <span className="text-sm text-slate-400 font-bold">điểm</span>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-medium">+50 điểm cho mỗi lần đặt tour</p>

            {/* Progress */}
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                   style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tier.color}70, ${tier.color})` }} />
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              {nextTier
                ? <>Cần thêm <strong style={{ color: tier.color }}>{nextTier.needed}</strong> điểm → <strong className="text-slate-800">{nextTier.next}</strong></>
                : <span className="font-black" style={{ color: tier.color }}><i className="fa-solid fa-crown mr-1.5" />Hạng cao nhất!</span>}
            </p>

            {/* Discount badge */}
            {tier.discount > 0 && (
              <div className="mt-5 p-3.5 rounded-xl flex items-center gap-3 border" style={{ background: tier.color + "0f", borderColor: tier.color + "25" }}>
                <i className="fa-solid fa-tag" style={{ color: tier.color }} />
                <div>
                  <p className="text-[13px] font-black" style={{ color: tier.color }}>Ưu đãi: -{tier.discount}%</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">+5% thêm khi book HDV từ 3 lần</p>
                </div>
              </div>
            )}
          </div>

          {/* Tier table */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Bảng Hạng Thành Viên</p>
            <div className="flex flex-col gap-2">
              {[...TIERS].reverse().map((t) => {
                const active = t.name === tier.name;
                return (
                  <div key={t.name} className={`flex items-center gap-3.5 p-3 rounded-xl border-2 transition-all ${active ? "bg-opacity-10" : "bg-slate-50 border-transparent"}`}
                       style={{ 
                         backgroundColor: active ? t.color + "15" : "", 
                         borderColor: active ? t.color + "35" : "" 
                       }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.color + "20" }}>
                      <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 14 }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black flex items-center gap-2" style={{ color: active ? t.color : "#475569" }}>
                        {t.label}
                        {active && <span className="text-[9px] px-2 py-0.5 rounded-full text-white font-bold tracking-wider" style={{ background: t.color }}>HIỆN TẠI</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">Từ {t.min} điểm</p>
                    </div>
                    <span className="text-sm font-black" style={{ color: t.discount > 0 ? t.color : "#cbd5e1" }}>
                      {t.discount > 0 ? `-${t.discount}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Booking history ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lịch Sử Đặt Tour</p>
              <p className="text-sm font-black text-slate-900 mt-1">{bookings.length} booking</p>
            </div>
            <Link href="/dat-lich" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold transition-colors active:scale-95 shadow-md shadow-teal-900/10 w-full sm:w-auto">
              <i className="fa-solid fa-plus" /> Đặt mới
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-400">
              <i className="fa-solid fa-calendar-xmark text-4xl mb-4 opacity-50 block" />
              <p className="font-bold text-slate-600 mb-1">Chưa có lịch đặt nào</p>
              <p className="text-xs font-medium">Đặt tour đầu tiên để bắt đầu tích điểm!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Gói tour", "HDV", "Trạng thái", "Điểm", "Giảm giá", "Ngày", ""].map((h) => (
                      <th key={h} className="py-3 px-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const s = STATUS[b.status] ?? STATUS.pending;
                    return (
                      <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-5 text-[13px] font-bold text-slate-900">{b.package_type || "—"}</td>
                        <td className="py-4 px-5 text-[13px] font-medium text-slate-600">{b.guides?.name ?? "—"}</td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black border ${s.bg} ${s.color} ${s.border}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[13px] font-black text-teal-700">{b.points_earned > 0 ? `+${b.points_earned}` : "—"}</td>
                        <td className="py-4 px-5 text-[13px] font-black text-amber-600">{b.discount_pct > 0 ? `-${b.discount_pct}%` : "—"}</td>
                        <td className="py-4 px-5 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                          {new Date(b.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-4 px-5 text-right">
                          {b.status === "pending" && (
                            <button onClick={() => setCancelId(b.id)}
                              className="px-3.5 py-1.5 rounded-lg border-2 border-red-100 text-red-600 font-bold text-[11px] hover:bg-red-50 hover:border-red-200 transition-colors active:scale-95 whitespace-nowrap">
                              Hủy
                            </button>
                          )}
                          {b.status === "confirmed" && (
                            <button onClick={() => setReviewBooking(b)}
                              className="px-3.5 py-1.5 rounded-lg border-2 border-teal-100 text-teal-700 font-bold text-[11px] hover:bg-teal-50 hover:border-teal-200 transition-colors active:scale-95 whitespace-nowrap">
                              Đánh giá
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Cancel confirmation ── */}
        {cancelId && (
          <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
               onClick={() => setCancelId(null)}>
            <div className="bg-white rounded-2xl p-8 max-w-[360px] w-full shadow-2xl animate-in zoom-in-95"
                 onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <i className="fa-solid fa-calendar-xmark text-red-600 text-xl" />
              </div>
              <h3 className="text-center font-black text-slate-900 text-lg mb-2">Hủy đặt lịch?</h3>
              <p className="text-center text-sm text-slate-500 mb-6 font-medium leading-relaxed">
                Bạn có chắc muốn hủy lịch này? Sau khi hủy sẽ không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Không hủy
                </button>
                <button onClick={() => cancelBooking(cancelId)} disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-60 flex justify-center items-center">
                  {cancelling ? <i className="fa-solid fa-spinner fa-spin" /> : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Review Modal ── */}
        {reviewBooking && (
          <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
               onClick={() => !submittingReview && setReviewBooking(null)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[420px] w-full shadow-2xl animate-in zoom-in-95"
                 onClick={(e) => e.stopPropagation()}>
              <h3 className="font-black text-slate-900 text-lg mb-1">Đánh giá trải nghiệm</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">
                Cảm ơn bạn đã đồng hành cùng chúng tôi trong tour <strong className="text-slate-800">{reviewBooking.package_type}</strong>!
              </p>
              
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mức độ hài lòng</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewStars(s)} className="text-2xl transition-transform hover:scale-110"
                            style={{ color: s <= reviewStars ? "#f59e0b" : "#e2e8f0" }}>
                      <i className="fa-solid fa-star" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Chia sẻ của bạn</label>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder="HDV nhiệt tình, cảnh quan tuyệt đẹp..."
                  className="w-full p-4 border-2 border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-teal-600 transition-colors resize-none h-28" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setReviewBooking(null)} disabled={submittingReview}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
                <button onClick={submitReview} disabled={submittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-teal-800 text-white font-bold text-sm hover:bg-teal-900 transition-colors disabled:opacity-60 flex justify-center items-center">
                  {submittingReview ? <i className="fa-solid fa-spinner fa-spin" /> : "Gửi đánh giá"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tin nhắn & phản hồi ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tin Nhắn Liên Hệ</p>
              <p className="text-sm font-black text-slate-900 mt-1">
                {contacts.length > 0 ? `${contacts.length} tin nhắn` : "Chưa có tin nhắn nào"}
              </p>
            </div>
            <Link href="/#lien-he" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-800 text-teal-800 text-sm font-bold hover:bg-teal-50 transition-colors active:scale-95 w-full sm:w-auto">
              <i className="fa-solid fa-paper-plane" /> Gửi tin nhắn
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="py-12 px-6 text-center text-slate-400">
              <i className="fa-solid fa-comments text-4xl mb-4 opacity-50 block" />
              <p className="font-bold text-slate-600 mb-1">Bạn chưa gửi tin nhắn nào</p>
              <p className="text-xs font-medium">Gửi tin nhắn để được tư vấn và nhận phản hồi tại đây.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {contacts.map((c, i) => (
                <div key={c.id} className={`p-5 sm:p-6 ${i < contacts.length - 1 ? "border-b border-slate-50" : ""}`}>
                  {/* Tin nhắn của khách */}
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-user text-slate-400 text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tin nhắn của bạn</span>
                        <span className="text-[11px] font-medium text-slate-400">{new Date(c.created_at).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{c.message}</p>
                    </div>
                  </div>

                  {/* Phản hồi admin */}
                  {c.admin_reply ? (
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-teal-800 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-headset text-white text-sm" />
                      </div>
                      <div className="flex-1 bg-teal-50 border border-teal-100 rounded-2xl p-4 relative">
                        <div className="absolute top-4 -left-2 w-4 h-4 bg-teal-50 border-t border-l border-teal-100 rotate-[-45deg]" />
                        <div className="flex justify-between items-center mb-2 relative z-10">
                          <span className="text-[11px] font-black text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-circle text-[6px]" />
                            {c.replied_by || "Cao Bằng Travel Connect"}
                          </span>
                          {c.replied_at && (
                            <span className="text-[11px] font-medium text-teal-600/60">{new Date(c.replied_at).toLocaleString("vi-VN")}</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed font-medium relative z-10">{c.admin_reply}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-14 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                      <i className="fa-solid fa-clock text-amber-600 text-xs mt-0.5 shrink-0" />
                      <p className="text-xs font-bold text-amber-700">
                        Chưa có phản hồi — chúng tôi sẽ trả lời sớm nhất có thể.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
