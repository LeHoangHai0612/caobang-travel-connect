"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getTier, POINTS_PER_BOOKING, GUIDE_LOYALTY_THRESHOLD, GUIDE_LOYALTY_BONUS_PCT } from "@/lib/loyalty";
import type { Guide, UserProfile } from "@/lib/database.types";
import type { Session } from "@supabase/supabase-js";

const PACKAGES = [
  { label: "HDV Cá Nhân",    price: "500.000đ / Ngày",  basePrice: 500000, icon: "fa-person-hiking", desc: "1 HDV chuyên trách, tour cá nhân hoặc cặp đôi" },
  { label: "HDV Đoàn",       price: "650.000đ / Ngày",  basePrice: 650000, icon: "fa-users",          desc: "Phù hợp nhóm 5-20 người, HDV kinh nghiệm dẫn đoàn" },
  { label: "HDV Xe Máy",     price: "550.000đ / Ngày",  basePrice: 550000, icon: "fa-motorcycle",     desc: "Phượt xe máy, cung đường hiểm trở và ngoạn mục" },
  { label: "Tour Tùy Chỉnh", price: "Liên hệ",           basePrice: 0,      icon: "fa-sliders",        desc: "Tư vấn và thiết kế lộ trình theo yêu cầu riêng" },
];

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export default function DatLichPage() {
  const [bg, setBg]               = useState("https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75");
  const [guides, setGuides]       = useState<Guide[]>([]);
  const [session, setSession]     = useState<Session | null>(null);
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [guideSearch, setGuideSearch] = useState("");

  // Form state — khởi tạo từ URL sau khi mount (tránh lỗi Suspense với useSearchParams)
  const [pkg, setPkg]             = useState("");
  const [guideId, setGuideId]     = useState("");
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [date, setDate]           = useState("");
  const [note, setNote]           = useState("");
  const [days, setDays]           = useState(1);
  const [depositPct, setDepositPct] = useState(30);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");
  const [pointsInfo, setPointsInfo] = useState<{ earned: number; newTotal: number; newTier: string } | null>(null);
  const [guideBookingCount, setGuideBookingCount] = useState(0);

  // Load data + đọc query params từ URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const initPkg   = p.get("package") ?? p.get("tour") ?? "";
    const initGuide = p.get("guide") ?? "";
    if (initPkg)   setPkg(initPkg);
    if (initGuide) setGuideId(initGuide);

    supabase.from("site_settings").select("key,value").in("key", ["booking_bg","deposit_pct"])
      .then(({ data }) => {
        data?.forEach((s: { key: string; value: string }) => {
          if (s.key === "booking_bg")  setBg(s.value);
          if (s.key === "deposit_pct") setDepositPct(parseInt(s.value) || 30);
        });
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

  // Guide loyalty count
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

  // Tính tiền cọc
  const selectedPkg   = PACKAGES.find((p) => pkg.startsWith(p.label));
  const basePrice     = selectedPkg?.basePrice ?? 0;
  const subtotal      = basePrice * days;
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
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src={bg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,30,26,.82) 0%,rgba(26,60,55,.78) 100%)", backdropFilter: "blur(2px)" }} />
      </div>

      {/* Header */}
      <header style={{ position: "relative", zIndex: 10, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.2)", backdropFilter: "blur(12px)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="Logo" width={30} height={30} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span style={{ color: "white", fontWeight: 800, fontSize: ".9rem" }}>Cao Bằng Travel Connect</span>
        </a>
        <a href="/" style={{ color: "rgba(255,255,255,.75)", fontSize: ".82rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="fa-solid fa-arrow-left" /> Trang chủ
        </a>
      </header>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "36px 16px 64px" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ background: "rgba(255,255,255,.15)", color: "rgba(255,255,255,.9)", fontSize: ".72rem", fontWeight: 700, padding: "4px 16px", borderRadius: 20, letterSpacing: ".12em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
            Đặt Lịch Hướng Dẫn Viên
          </span>
          <h1 style={{ color: "white", fontWeight: 900, fontSize: "clamp(1.6rem,4vw,2.4rem)", margin: "14px 0 8px", textShadow: "0 2px 12px rgba(0,0,0,.3)" }}>
            Bắt Đầu Hành Trình Của Bạn
          </h1>
          <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".92rem", margin: 0 }}>
            Điền thông tin bên dưới — chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ
          </p>
        </div>

        {success ? (
          /* Success screen */
          <div style={{ maxWidth: 480, margin: "0 auto", background: "rgba(255,255,255,.96)", borderRadius: 20, padding: "40px 36px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0faf9", border: "3px solid #265C59", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-circle-check" style={{ color: "#265C59", fontSize: 32 }} />
            </div>
            <h2 style={{ fontWeight: 900, color: "#1a2e2e", fontSize: "1.3rem", marginBottom: 10 }}>Đặt lịch thành công!</h2>
            <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
              Cảm ơn <strong>{name}</strong>! Chúng tôi sẽ liên hệ xác nhận với bạn trong vòng <strong>24 giờ</strong> qua số <strong>{phone}</strong>.
            </p>
            {pointsInfo && (
              <div style={{ background: "#f0faf9", border: "1.5px solid #b2dfdb", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                <p style={{ fontWeight: 800, color: "#265C59", margin: "0 0 4px" }}>
                  <i className="fa-solid fa-star" style={{ color: "#E5A919", marginRight: 6 }} />
                  +{pointsInfo.earned} điểm tích lũy!
                </p>
                <p style={{ color: "#64748b", fontSize: ".82rem", margin: 0 }}>Tổng: {pointsInfo.newTotal} điểm · Hạng: {getTier(pointsInfo.newTotal).label}</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <a href="/" style={{ flex: 1, padding: "11px 0", borderRadius: 10, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <i className="fa-solid fa-house" /> Về trang chủ
              </a>
              <a href="/tai-khoan" style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <i className="fa-solid fa-user" /> Tài khoản
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

            {/* Left: form */}
            <div style={{ background: "rgba(255,255,255,.97)", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
              {/* Form header */}
              <div style={{ background: "linear-gradient(135deg,#1a3c3a,#265C59)", padding: "22px 28px" }}>
                <h2 style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".06em" }}>Thông Tin Đặt Lịch</h2>
                <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".78rem", margin: 0 }}>
                  {pkg || "Chưa chọn gói"} {totalDiscount > 0 ? `· Ưu đãi -${totalDiscount}%` : ""}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Package selector */}
                <div>
                  <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>Chọn gói dịch vụ *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {PACKAGES.map((p) => (
                      <button key={p.label} type="button" onClick={() => setPkg(`${p.label} · ${p.price}`)}
                        style={{ padding: "12px 14px", borderRadius: 12, border: `2px solid ${pkg.startsWith(p.label) ? "#265C59" : "#e2e8f0"}`, background: pkg.startsWith(p.label) ? "#f0faf9" : "white", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <i className={`fa-solid ${p.icon}`} style={{ color: "#265C59", marginBottom: 6, display: "block", fontSize: ".9rem" }} />
                        <p style={{ fontWeight: 700, fontSize: ".82rem", color: "#1a2e2e", margin: "0 0 2px" }}>{p.label}</p>
                        <p style={{ fontSize: ".7rem", color: "#265C59", fontWeight: 700, margin: "0 0 3px" }}>{p.price}</p>
                        <p style={{ fontSize: ".68rem", color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>{p.desc}</p>
                      </button>
                    ))}
                  </div>
                  {pkg && !PACKAGES.some((p) => pkg.startsWith(p.label)) && (
                    <div style={{ marginTop: 8, padding: "10px 14px", background: "#f0faf9", borderRadius: 10, border: "1.5px solid #265C59", fontSize: ".84rem", color: "#265C59", fontWeight: 700 }}>
                      <i className="fa-solid fa-tag" style={{ marginRight: 6 }} />{pkg}
                    </div>
                  )}
                </div>

                {/* Personal info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Họ và tên *" id="b-name" type="text" value={name} onChange={setName} placeholder="Nguyễn Văn A" required />
                  <Field label="Số điện thoại *" id="b-phone" type="tel" value={phone} onChange={setPhone} placeholder="0912 345 678" required />
                </div>
                <Field label="Email" id="b-email" type="email" value={email} onChange={setEmail} placeholder="email@example.com" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Ngày dự kiến" id="b-date" type="date" value={date} onChange={setDate} min={today} />
                  <div>
                    <label htmlFor="b-days" style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Số ngày</label>
                    <input id="b-days" type="number" value={days} min={1} max={30}
                      onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: ".88rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                      onFocus={(e) => (e.target.style.borderColor = "#265C59")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                  </div>
                </div>

                {/* Guide selector */}
                <div>
                  <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Hướng dẫn viên</label>
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }} />
                    <input type="text" placeholder="Tìm theo tên, chuyên môn..." value={guideSearch} onChange={(e) => setGuideSearch(e.target.value)}
                      style={{ width: "100%", padding: "9px 12px 9px 30px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: ".83rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto", padding: "2px 0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${!guideId ? "#265C59" : "#e2e8f0"}`, background: !guideId ? "#f0faf9" : "white", cursor: "pointer" }}>
                      <input type="radio" checked={!guideId} onChange={() => setGuideId("")} style={{ accentColor: "#265C59" }} />
                      <div>
                        <p style={{ fontWeight: 700, fontSize: ".83rem", color: "#1a2e2e", margin: 0 }}>Để chúng tôi sắp xếp</p>
                        <p style={{ fontSize: ".7rem", color: "#94a3b8", margin: "1px 0 0" }}>HDV phù hợp nhất sẽ liên hệ bạn</p>
                      </div>
                    </label>
                    {filteredGuides.map((g) => (
                      <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${guideId === g.id ? "#265C59" : "#e2e8f0"}`, background: guideId === g.id ? "#f0faf9" : "white", cursor: "pointer" }}>
                        <input type="radio" checked={guideId === g.id} onChange={() => { setGuideId(g.id); setGuideSearch(""); }} style={{ accentColor: "#265C59" }} />
                        <img src={g.image_url} alt={g.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: ".83rem", color: "#1a2e2e", margin: 0 }}>{g.name}</p>
                          <p style={{ fontSize: ".7rem", color: "#64748b", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.specialty}</p>
                        </div>
                        <span style={{ color: "#E5A919", fontSize: ".72rem", fontWeight: 700, flexShrink: 0 }}>{g.rating}★</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Ghi chú" id="b-note" type="text" value={note} onChange={setNote} placeholder="Yêu cầu đặc biệt, số lượng người..." />

                {/* Loyalty info */}
                {session && totalDiscount > 0 && (
                  <div style={{ background: "#f0faf9", border: "1.5px solid #b2dfdb", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <i className="fa-solid fa-tag" style={{ color: "#265C59", fontSize: 16 }} />
                    <div>
                      <p style={{ fontWeight: 800, color: "#265C59", margin: 0, fontSize: ".85rem" }}>Ưu đãi -{totalDiscount}% cho bạn</p>
                      <p style={{ color: "#64748b", fontSize: ".72rem", margin: "2px 0 0" }}>
                        {tierDiscount > 0 && `Hạng ${getTier(profile!.points).label}: -${tierDiscount}%`}
                        {loyaltyBonus > 0 && ` + Khách quen HDV: -${loyaltyBonus}%`}
                      </p>
                    </div>
                  </div>
                )}

                {!session && (
                  <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: ".8rem", color: "#92400e" }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: 6 }} />
                    <a href="/dang-nhap" style={{ color: "#265C59", fontWeight: 700, textDecoration: "none" }}>Đăng nhập</a> để tích điểm và nhận ưu đãi thành viên.
                  </div>
                )}

                {error && (
                  <p style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", margin: 0, fontSize: ".84rem" }}>{error}</p>
                )}

                <button type="submit" disabled={loading || !name.trim() || !phone.trim()}
                  style={{ padding: "14px 0", borderRadius: 12, border: "none", background: loading ? "#94a3b8" : "linear-gradient(135deg,#265C59,#3a9490)", color: "white", fontWeight: 800, fontSize: ".95rem", cursor: loading ? "wait" : "pointer", letterSpacing: ".04em", boxShadow: "0 4px 16px rgba(38,92,89,.35)", transition: "opacity .15s" }}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Đang xử lý...</>
                    : <><i className="fa-solid fa-calendar-check" style={{ marginRight: 8 }} />XÁC NHẬN ĐẶT LỊCH</>}
                </button>
              </form>
            </div>

            {/* Right: summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Selected guide card */}
              {selectedGuide ? (
                <div style={{ background: "rgba(255,255,255,.97)", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
                    <img src={selectedGuide.image_url} alt={selectedGuide.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%)" }} />
                    <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
                      <p style={{ color: "white", fontWeight: 900, fontSize: "1.05rem", margin: "0 0 4px" }}>{selectedGuide.name}</p>
                      <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".78rem", margin: 0 }}>{selectedGuide.specialty}</p>
                    </div>
                    <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", color: "#E5A919", borderRadius: 8, padding: "4px 10px", fontSize: ".78rem", fontWeight: 800 }}>
                      {selectedGuide.rating}★
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    {selectedGuide.bio && <p style={{ color: "#475569", fontSize: ".82rem", lineHeight: 1.7, marginBottom: 12 }}>{selectedGuide.bio.slice(0, 120)}{selectedGuide.bio.length > 120 ? "..." : ""}</p>}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {selectedGuide.years_experience > 0 && (
                        <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".72rem", fontWeight: 700 }}>
                          <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{selectedGuide.years_experience} năm KN
                        </span>
                      )}
                      {selectedGuide.languages && (
                        <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".72rem", fontWeight: 700 }}>
                          <i className="fa-solid fa-language" style={{ marginRight: 4 }} />{selectedGuide.languages}
                        </span>
                      )}
                    </div>
                    {selectedGuide.zalo_number && (
                      <a href={`https://zalo.me/${selectedGuide.zalo_number}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 0", borderRadius: 10, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                        <i className="fa-brands fa-comment-dots" />Chat Zalo với {selectedGuide.name}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", borderRadius: 18, padding: "24px 20px", textAlign: "center", border: "1.5px solid rgba(255,255,255,.25)" }}>
                  <i className="fa-solid fa-person-hiking" style={{ color: "rgba(255,255,255,.6)", fontSize: 36, marginBottom: 12, display: "block" }} />
                  <p style={{ color: "rgba(255,255,255,.8)", fontWeight: 700, marginBottom: 6 }}>Chưa chọn HDV</p>
                  <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".8rem", lineHeight: 1.6 }}>Chọn HDV từ danh sách bên trái hoặc để chúng tôi sắp xếp phù hợp nhất.</p>
                </div>
              )}

              {/* Booking summary */}
              <div style={{ background: "rgba(255,255,255,.97)", borderRadius: 18, padding: "20px 22px", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
                <p style={{ fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>Tóm tắt đặt lịch</p>
                {[
                  { label: "Gói dịch vụ", val: pkg || "Chưa chọn" },
                  { label: "HDV", val: selectedGuide?.name ?? "Hệ thống sắp xếp" },
                  { label: "Ngày", val: date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa chọn" },
                  { label: "Số ngày", val: `${days} ngày` },
                  { label: "Ưu đãi", val: totalDiscount > 0 ? `-${totalDiscount}%` : "Không có" },
                  { label: "Điểm thưởng", val: session ? `+${POINTS_PER_BOOKING} điểm` : "Đăng nhập để tích điểm" },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: ".8rem", color: "#64748b" }}>{r.label}</span>
                    <span style={{ fontSize: ".8rem", fontWeight: 700, color: r.val.startsWith("-") ? "#265C59" : "#1a2e2e", maxWidth: "55%", textAlign: "right" }}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Deposit calculation */}
              {hasPricing && (
                <div style={{ background: "rgba(255,255,255,.97)", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
                  <div style={{ background: "linear-gradient(135deg,#1a3c3a,#265C59)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="fa-solid fa-calculator" style={{ color: "rgba(255,255,255,.8)", fontSize: 14 }} />
                    <p style={{ color: "white", fontWeight: 800, fontSize: ".82rem", margin: 0, letterSpacing: ".04em" }}>Bảng Tính Tiền Cọc</p>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    {/* Rows */}
                    {[
                      { label: `Đơn giá (${selectedPkg?.label})`, val: fmt(basePrice) + "/ngày", dim: true },
                      { label: `× ${days} ngày`, val: fmt(subtotal), dim: true },
                      ...(discountAmt > 0 ? [{ label: `Giảm giá (-${totalDiscount}%)`, val: `- ${fmt(discountAmt)}`, green: true }] : []),
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: ".78rem", color: "#64748b" }}>{r.label}</span>
                        <span style={{ fontSize: ".78rem", fontWeight: 700, color: (r as {green?: boolean}).green ? "#16a34a" : "#1a2e2e" }}>{r.val}</span>
                      </div>
                    ))}

                    {/* Total */}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 8px", borderBottom: "2px solid #e2e8f0", marginTop: 4 }}>
                      <span style={{ fontSize: ".85rem", fontWeight: 700, color: "#1a2e2e" }}>Tổng tiền</span>
                      <span style={{ fontSize: ".95rem", fontWeight: 900, color: "#265C59" }}>{fmt(totalPrice)}</span>
                    </div>

                    {/* Deposit highlight */}
                    <div style={{ background: "#fefce8", border: "1.5px solid #fde047", borderRadius: 12, padding: "12px 14px", margin: "12px 0 8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                          <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#854d0e", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>
                            <i className="fa-solid fa-coins" style={{ marginRight: 5 }} />Tiền Cọc ({depositPct}%)
                          </p>
                          <p style={{ fontSize: ".7rem", color: "#a16207", margin: "2px 0 0" }}>Thanh toán khi xác nhận lịch</p>
                        </div>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#b45309" }}>{fmt(depositAmt)}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                      <span style={{ fontSize: ".8rem", color: "#64748b" }}>Còn lại (thanh toán sau)</span>
                      <span style={{ fontSize: ".82rem", fontWeight: 700, color: "#475569" }}>{fmt(remainingAmt)}</span>
                    </div>

                    <p style={{ fontSize: ".7rem", color: "#94a3b8", marginTop: 10, lineHeight: 1.5, fontStyle: "italic" }}>
                      * Giá chỉ mang tính tham khảo. Giá chính thức sẽ được xác nhận qua Zalo/điện thoại.
                    </p>
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div style={{ background: "rgba(255,255,255,.1)", backdropFilter: "blur(6px)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,.2)" }}>
                {["Xác nhận trong 24 giờ", "Đặt cọc linh hoạt", "Hủy miễn phí trước 24h", "Hỗ trợ 24/7 qua Zalo"].map((t) => (
                  <p key={t} style={{ color: "rgba(255,255,255,.8)", fontSize: ".78rem", margin: "4px 0", display: "flex", alignItems: "center", gap: 7 }}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#5eead4", fontSize: 11 }} />{t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({ label, id, type, value, onChange, placeholder, required, min }: {
  label: string; id: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>{label}</label>
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} min={min}
        style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: ".88rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color .15s" }}
        onFocus={(e) => (e.target.style.borderColor = "#265C59")}
        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
      />
    </div>
  );
}
