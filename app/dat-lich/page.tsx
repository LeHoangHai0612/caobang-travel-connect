"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getTier, POINTS_PER_BOOKING, GUIDE_LOYALTY_THRESHOLD, GUIDE_LOYALTY_BONUS_PCT } from "@/lib/loyalty";
import type { Guide, UserProfile } from "@/lib/database.types";
import type { Session } from "@supabase/supabase-js";

const DEFAULT_PRICES = { hdv_ca_nhan: 500000, hdv_doan: 650000, hdv_xe_may: 550000 };

function buildPackages(p: typeof DEFAULT_PRICES) {
  const f = (n: number) => n.toLocaleString("vi-VN") + "đ";
  return [
    { label: "HDV Cá Nhân",    price: f(p.hdv_ca_nhan) + " / Ngày", basePrice: p.hdv_ca_nhan, icon: "fa-person-hiking", desc: "1 HDV chuyên trách, tour cá nhân hoặc cặp đôi" },
    { label: "HDV Đoàn",       price: f(p.hdv_doan)    + " / Ngày", basePrice: p.hdv_doan,    icon: "fa-users",          desc: "Phù hợp nhóm 5-20 người, HDV kinh nghiệm dẫn đoàn" },
    { label: "HDV Xe Máy",     price: f(p.hdv_xe_may)  + " / Ngày", basePrice: p.hdv_xe_may,  icon: "fa-motorcycle",     desc: "Phượt xe máy, cung đường hiểm trở và ngoạn mục" },
    { label: "Tour Tùy Chỉnh", price: "Liên hệ",                     basePrice: 0,              icon: "fa-sliders",        desc: "Tư vấn và thiết kế lộ trình theo yêu cầu riêng" },
  ];
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function DatLichPage() {
  const [bg, setBg]               = useState("https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75");
  const [guides, setGuides]       = useState<Guide[]>([]);
  const [session, setSession]     = useState<Session | null>(null);
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [guideSearch, setGuideSearch] = useState("");

  const [pkg, setPkg]             = useState("");
  const [guideId, setGuideId]     = useState("");
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [date, setDate]           = useState("");
  const [note, setNote]           = useState("");
  const [days, setDays]           = useState(1);
  const [depositPct, setDepositPct] = useState(30);
  const [prices, setPrices]       = useState(DEFAULT_PRICES);
  const PACKAGES = buildPackages(prices);
  const [selectedTour, setSelectedTour] = useState<{ id: string; title: string; price_from: number; duration: string } | null>(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");
  const [pointsInfo, setPointsInfo] = useState<{ earned: number; newTotal: number; newTier: string } | null>(null);
  const [guideBookingCount, setGuideBookingCount] = useState(0);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const initPkg    = p.get("package") ?? "";
    const tourId     = p.get("tour") ?? "";
    const initGuide  = p.get("guide") ?? "";
    if (initPkg)   setPkg(initPkg);
    if (initGuide) setGuideId(initGuide);

    if (tourId) {
      supabase.from("tours").select("id,title,price_from,duration").eq("id", tourId).single()
        .then(({ data }) => {
          if (data) {
            setSelectedTour(data);
            setPkg(data.title);
          }
        });
    }

    supabase.from("site_settings").select("key,value")
      .in("key", ["booking_bg","deposit_pct","price_hdv_ca_nhan","price_hdv_doan","price_hdv_xe_may"])
      .then(({ data }) => {
        const find = (k: string) => parseInt(data?.find((s: {key:string;value:string}) => s.key === k)?.value ?? "0") || 0;
        data?.forEach((s: { key: string; value: string }) => {
          if (s.key === "booking_bg")  setBg(s.value);
          if (s.key === "deposit_pct") setDepositPct(parseInt(s.value) || 30);
        });
        const p = { hdv_ca_nhan: find("price_hdv_ca_nhan") || 500000, hdv_doan: find("price_hdv_doan") || 650000, hdv_xe_may: find("price_hdv_xe_may") || 550000 };
        setPrices(p);
      });
    supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false })
      .then(({ data }) => setGuides(data ?? []));
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        supabase.from("user_profiles").select("*").eq("id", s.user.id).single()
          .then(({ data: p }) => {
            if (p) {
              setProfile(p);
              setName(p.full_name || "");
              setPhone(p.phone || "");
              setEmail(s.user.email || "");
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    if (!session || !guideId) { setGuideBookingCount(0); return; }
    supabase.from("bookings").select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id).eq("guide_id", guideId).eq("status", "confirmed")
      .then(({ count }) => setGuideBookingCount(count ?? 0));
  }, [session, guideId]);

  const tierDiscount = profile ? getTier(profile.points).discount : 0;
  const loyaltyBonus = session && guideId && guideBookingCount >= GUIDE_LOYALTY_THRESHOLD ? GUIDE_LOYALTY_BONUS_PCT : 0;
  const totalDiscount = tierDiscount + loyaltyBonus;

  const selectedGuide = guides.find((g) => g.id === guideId);
  const today = new Date().toISOString().split("T")[0];

  const selectedPkg   = PACKAGES.find((p) => pkg.startsWith(p.label));
  const basePrice     = selectedTour ? selectedTour.price_from : (selectedPkg?.basePrice ?? 0);
  const subtotal      = selectedTour ? basePrice : basePrice * days;
  const discountAmt   = Math.round(subtotal * totalDiscount / 100);
  const totalPrice    = subtotal - discountAmt;
  const depositAmt    = Math.round(totalPrice * depositPct / 100);
  const remainingAmt  = totalPrice - depositAmt;
  const hasPricing    = basePrice > 0;

  const filteredGuides = guides.filter((g) => {
    const q = guideSearch.toLowerCase();
    return !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const res = await fetch("/api/booking", {
        method: "POST", headers,
        body: JSON.stringify({
          package_type: pkg || "Tour Tùy Chỉnh",
          client_name: name, phone, email,
          preferred_date: date || undefined,
          message: note,
          user_id: session?.user.id,
          guide_id: guideId || undefined,
          discount_pct: totalDiscount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.points_earned) setPointsInfo({ earned: data.points_earned, newTotal: data.new_points, newTier: data.new_tier });
        setSuccess(true);
      } else {
        setError(data.error || "Đã có lỗi. Vui lòng thử lại.");
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [loading, session, pkg, name, phone, email, date, note, guideId, totalDiscount]);

  return (
    <div className="min-h-screen relative pb-safe">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1e1a]/80 to-[#1a3c37]/80 backdrop-blur-sm" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 h-14 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md pt-safe">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="Logo" width={30} height={30} className="object-contain invert brightness-0" />
          <span className="text-white font-extrabold text-sm md:text-base">Cao Bằng Travel Connect</span>
        </a>
        <a href="/" className="text-white/75 text-sm font-semibold no-underline flex items-center gap-1.5">
          <i className="fa-solid fa-arrow-left" /> <span className="hidden sm:inline">Trang chủ</span>
        </a>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 pb-24 md:pb-16">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block bg-white/15 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase backdrop-blur-md">
            Đặt Lịch Hướng Dẫn Viên
          </span>
          <h1 className="text-white font-black text-3xl md:text-5xl mt-4 mb-2 drop-shadow-lg">
            Bắt Đầu Hành Trình Của Bạn
          </h1>
          <p className="text-white/75 text-sm md:text-base">
            Điền thông tin bên dưới — chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ
          </p>
        </div>

        {success ? (
          <div className="max-w-md mx-auto bg-white backdrop-blur-md rounded-2xl p-8 md:p-10 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-teal-50 border-4 border-teal-800 flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-circle-check text-teal-800 text-4xl" />
            </div>
            <h2 className="font-black text-slate-900 text-2xl mb-3">Đặt lịch thành công!</h2>
            <p className="text-slate-500 leading-relaxed mb-6">
              Cảm ơn <strong>{name}</strong>! Chúng tôi sẽ liên hệ xác nhận với bạn trong vòng <strong>24 giờ</strong> qua số <strong>{phone}</strong>.
            </p>
            {pointsInfo && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
                <p className="font-extrabold text-teal-800 flex items-center justify-center gap-2 mb-1">
                  <i className="fa-solid fa-star text-amber-500" /> +{pointsInfo.earned} điểm tích lũy!
                </p>
                <p className="text-slate-500 text-sm">
                  Tổng: {pointsInfo.newTotal} điểm · Hạng: {getTier(pointsInfo.newTotal).label}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/" className="flex-1 py-3 rounded-xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform min-h-[44px]">
                <i className="fa-solid fa-house" /> Về trang chủ
              </a>
              <a href="/tai-khoan" className="flex-1 py-3 rounded-xl border-2 border-teal-800 text-teal-800 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform min-h-[44px]">
                <i className="fa-solid fa-user" /> Tài khoản
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            {/* Left: form */}
            <div className="bg-white backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl w-full">
              <div className="bg-gradient-to-br from-teal-900 to-teal-800 p-5 md:p-6">
                <h2 className="text-white font-extrabold text-base md:text-lg uppercase tracking-wider mb-1">Thông Tin Đặt Lịch</h2>
                <p className="text-white/70 text-sm">
                  {pkg || "Chưa chọn gói"} {totalDiscount > 0 ? `· Ưu đãi -${totalDiscount}%` : ""}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-5 md:p-8 flex flex-col gap-5 md:gap-6">
                {/* Package selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Chọn gói dịch vụ *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PACKAGES.map((p) => (
                      <button key={p.label} type="button" onClick={() => setPkg(`${p.label} · ${p.price}`)}
                        className={`p-4 rounded-xl border-2 text-left transition-all min-h-[44px] ${pkg.startsWith(p.label) ? "border-teal-800 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"}`}>
                        <i className={`fa-solid ${p.icon} text-teal-800 mb-2 text-lg`} />
                        <p className="font-bold text-slate-900 text-sm mb-1">{p.label}</p>
                        <p className="text-xs text-teal-800 font-bold mb-1">{p.price}</p>
                        <p className="text-[11px] text-slate-500 leading-tight">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                  {pkg && !PACKAGES.some((p) => pkg.startsWith(p.label)) && (
                    <div className="mt-3 p-3 bg-teal-50 rounded-xl border border-teal-800 text-sm text-teal-800 font-bold flex items-center gap-2">
                      <i className="fa-solid fa-tag" /> {pkg}
                    </div>
                  )}
                </div>

                {/* Personal info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                  <Field label="Họ và tên *" id="b-name" type="text" value={name} onChange={setName} placeholder="Nguyễn Văn A" required />
                  <Field label="Số điện thoại *" id="b-phone" type="tel" value={phone} onChange={setPhone} placeholder="0912 345 678" required />
                </div>
                <Field label="Email" id="b-email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" />
                
                <div className={`grid gap-4 md:gap-5 ${selectedTour ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  <Field label="Ngày dự kiến" id="b-date" type="date" value={date} onChange={setDate} min={today} />
                  {!selectedTour && (
                    <div>
                      <label htmlFor="b-days" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số ngày</label>
                      <input id="b-days" type="number" value={days} min={1} max={30}
                        onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-teal-800 outline-none transition-colors min-h-[44px]" />
                    </div>
                  )}
                </div>

                {/* Guide selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Hướng dẫn viên</label>
                  <div className="relative mb-3">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Tìm theo tên, chuyên môn..." value={guideSearch} onChange={(e) => setGuideSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-teal-800 outline-none transition-colors min-h-[44px]" />
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors min-h-[44px] ${!guideId ? "border-teal-800 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-200"}`}>
                      <input type="radio" checked={!guideId} onChange={() => setGuideId("")} className="accent-teal-800 w-4 h-4" />
                      <div>
                        <p className="font-bold text-sm text-slate-900">Để chúng tôi sắp xếp</p>
                        <p className="text-xs text-slate-500">HDV phù hợp nhất sẽ liên hệ bạn</p>
                      </div>
                    </label>
                    {filteredGuides.map((g) => (
                      <label key={g.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors min-h-[44px] ${guideId === g.id ? "border-teal-800 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-200"}`}>
                        <input type="radio" checked={guideId === g.id} onChange={() => { setGuideId(g.id); setGuideSearch(""); }} className="accent-teal-800 w-4 h-4" />
                        <img src={g.image_url} alt={g.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{g.name}</p>
                          <p className="text-xs text-slate-500 truncate">{g.specialty}</p>
                        </div>
                        <span className="text-amber-500 text-xs font-bold shrink-0">{g.rating}★</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Ghi chú" id="b-note" type="text" value={note} onChange={setNote} placeholder="Yêu cầu đặc biệt, số lượng người..." />

                {/* Loyalty info */}
                {session && totalDiscount > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
                    <i className="fa-solid fa-tag text-teal-800 mt-1" />
                    <div>
                      <p className="font-extrabold text-teal-800 text-sm mb-1">Ưu đãi -{totalDiscount}% cho bạn</p>
                      <p className="text-slate-500 text-xs">
                        {tierDiscount > 0 && `Hạng ${getTier(profile!.points).label}: -${tierDiscount}%`}
                        {loyaltyBonus > 0 && ` + Khách quen HDV: -${loyaltyBonus}%`}
                      </p>
                    </div>
                  </div>
                )}

                {!session && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2">
                    <i className="fa-solid fa-circle-info mt-0.5" />
                    <p>
                      <a href="/dang-nhap" className="text-teal-800 font-bold underline decoration-2 underline-offset-2 min-h-[44px] inline-flex items-center">Đăng nhập</a> để tích điểm và nhận ưu đãi thành viên.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation" /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !name.trim() || !phone.trim()}
                  className="w-full py-4 rounded-xl border-none bg-gradient-to-br from-teal-800 to-teal-700 text-white font-extrabold text-base tracking-wider shadow-lg shadow-teal-900/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all min-h-[44px] mt-2">
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin mr-2" /> Đang xử lý...</>
                    : <><i className="fa-solid fa-calendar-check mr-2" /> XÁC NHẬN ĐẶT LỊCH</>}
                </button>
              </form>
            </div>

            {/* Right: summary */}
            <div className="flex flex-col gap-5 w-full">
              {/* Selected guide card */}
              {selectedGuide ? (
                <div className="bg-white backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-video sm:aspect-[4/3] overflow-hidden">
                    <img src={selectedGuide.image_url} alt={selectedGuide.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-black text-lg mb-1">{selectedGuide.name}</p>
                      <p className="text-white/80 text-sm truncate">{selectedGuide.specialty}</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-amber-500 rounded-lg px-2.5 py-1 text-xs font-black backdrop-blur-md">
                      {selectedGuide.rating}★
                    </div>
                  </div>
                  <div className="p-5">
                    {selectedGuide.bio && <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">{selectedGuide.bio.slice(0, 120)}{selectedGuide.bio.length > 120 ? "..." : ""}</p>}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedGuide.years_experience > 0 && (
                        <span className="bg-teal-50 text-teal-800 rounded-lg px-2.5 py-1 text-xs font-bold border border-teal-100">
                          <i className="fa-solid fa-clock mr-1.5" />{selectedGuide.years_experience} năm KN
                        </span>
                      )}
                      {selectedGuide.languages && (
                        <span className="bg-teal-50 text-teal-800 rounded-lg px-2.5 py-1 text-xs font-bold border border-teal-100">
                          <i className="fa-solid fa-language mr-1.5" />{selectedGuide.languages}
                        </span>
                      )}
                    </div>
                    {selectedGuide.zalo_number && (
                      <a href={`https://zalo.me/${selectedGuide.zalo_number}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-800 text-white font-bold text-sm active:scale-95 transition-transform min-h-[44px]">
                        <i className="fa-brands fa-comment-dots text-lg" /> Chat Zalo ngay
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-person-hiking text-white/60 text-3xl" />
                  </div>
                  <p className="text-white/90 font-bold mb-2">Chưa chọn HDV</p>
                  <p className="text-white/60 text-sm leading-relaxed">Chọn HDV từ danh sách hoặc để chúng tôi sắp xếp phù hợp nhất.</p>
                </div>
              )}

              {/* Booking summary */}
              <div className="bg-white backdrop-blur-md rounded-2xl p-5 shadow-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tóm tắt đặt lịch</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Gói dịch vụ", val: pkg || "Chưa chọn" },
                    { label: "HDV", val: selectedGuide?.name ?? "Hệ thống sắp xếp" },
                    { label: "Ngày", val: date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa chọn" },
                    { label: "Số ngày", val: `${days} ngày` },
                    { label: "Ưu đãi", val: totalDiscount > 0 ? `-${totalDiscount}%` : "Không có" },
                    { label: "Điểm thưởng", val: session ? `+${POINTS_PER_BOOKING} điểm` : "Đăng nhập để tích điểm" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-500">{r.label}</span>
                      <span className={`text-sm font-bold text-right max-w-[60%] ${r.val.startsWith("-") ? "text-teal-800" : "text-slate-900"}`}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deposit calculation */}
              {hasPricing && (
                <div className="bg-white backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-br from-teal-900 to-teal-800 p-4 flex items-center gap-2.5">
                    <i className="fa-solid fa-calculator text-white/80" />
                    <p className="text-white font-extrabold text-sm tracking-wide m-0">Bảng Tính Tiền Cọc</p>
                  </div>
                  <div className="p-5">
                    {selectedTour && (
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-map text-teal-800" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-teal-800 m-0 line-clamp-1">{selectedTour.title}</p>
                          <p className="text-xs text-teal-700/80 mt-0.5">
                            <i className="fa-solid fa-clock mr-1" />{selectedTour.duration} · Giá trọn gói
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2.5 mb-4">
                      {[
                        selectedTour
                          ? { label: `Giá tour (${selectedTour.title})`, val: fmt(basePrice), dim: true }
                          : { label: `Đơn giá (${selectedPkg?.label ?? "Gói"})`, val: fmt(basePrice) + "/ngày", dim: true },
                        ...(!selectedTour ? [{ label: `× ${days} ngày`, val: fmt(subtotal), dim: true }] : []),
                        ...(discountAmt > 0 ? [{ label: `Giảm giá (-${totalDiscount}%)`, val: `- ${fmt(discountAmt)}`, green: true }] : []),
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">{r.label}</span>
                          <span className={`text-sm font-bold ${(r as {green?: boolean}).green ? "text-green-600" : "text-slate-900"}`}>{r.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center py-3 border-t-2 border-slate-200 mb-4">
                      <span className="text-sm font-bold text-slate-900">Tổng tiền</span>
                      <span className="text-lg font-black text-teal-800">{fmt(totalPrice)}</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wider m-0 flex items-center gap-1.5">
                            <i className="fa-solid fa-coins" /> Tiền Cọc ({depositPct}%)
                          </p>
                          <p className="text-xs text-amber-700/70 mt-1">Thanh toán khi xác nhận lịch</p>
                        </div>
                        <span className="text-xl font-black text-amber-600">{fmt(depositAmt)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-xs sm:text-sm text-slate-500">Còn lại (thanh toán sau)</span>
                      <span className="text-sm font-bold text-slate-600">{fmt(remainingAmt)}</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 leading-relaxed italic">
                      * Giá chỉ mang tính tham khảo. Giá chính thức sẽ được xác nhận qua Zalo/điện thoại.
                    </p>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                {["Xác nhận trong 24 giờ", "Đặt cọc linh hoạt", "Hủy miễn phí trước 24h", "Hỗ trợ 24/7 qua Zalo"].map((t) => (
                  <p key={t} className="text-white/80 text-xs sm:text-sm my-2 flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-teal-300" /> {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, id, type, value, onChange, placeholder, required, min }: {
  label: string; id: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} min={min}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-teal-800 outline-none transition-colors min-h-[44px] placeholder:text-slate-400"
      />
    </div>
  );
}
