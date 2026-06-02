"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const TIERS = [
  { label: "Đồng",      color: "#cd7f32", icon: "fa-award",  pct: "0%",   min: "0 điểm"   },
  { label: "Bạc",       color: "#9e9e9e", icon: "fa-medal",  pct: "-3%",  min: "100 điểm" },
  { label: "Vàng",      color: "#E5A919", icon: "fa-crown",  pct: "-7%",  min: "300 điểm" },
  { label: "Kim Cương", color: "#3a9490", icon: "fa-gem",    pct: "-10%", min: "700 điểm" },
];

function Field({
  label, id, type = "text", value, onChange, placeholder, icon,
}: {
  label: string; id: string; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder: string; icon: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <i className={`fa-solid ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none`} />
        <input
          id={id} type={type} value={value} placeholder={placeholder} required={type !== "tel"}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-3 pl-10 pr-3.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all"
        />
      </div>
    </div>
  );
}

export default function DangNhapPage() {
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  const handleForgot = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email.trim()) { setMessage({ text: "Vui lòng nhập email.", ok: false }); return; }
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/doi-mat-khau`,
    });
    setLoading(false);
    if (error) setMessage({ text: "Lỗi: " + error.message, ok: false });
    else setMessage({ text: "Đã gửi email đặt lại mật khẩu! Kiểm tra hộp thư của bạn.", ok: true });
  };
  const [loginBg, setLoginBg]   = useState("https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=800&q=60");

  async function redirectByRole(userId: string) {
    const { data } = await supabase.from("user_profiles").select("is_admin,is_blocked").eq("id", userId).single();
    if (data?.is_blocked) {
      await supabase.auth.signOut();
      setMessage({ text: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.", ok: false });
      setLoading(false);
      return;
    }
    window.location.href = data?.is_admin ? "/admin" : "/tai-khoan";
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirectByRole(session.user.id);
    });
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "login_bg")
      .single()
      .then(({ data }) => { if (data?.value) setLoginBg(data.value); });
  }, []);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage({ text: "Sai email hoặc mật khẩu. Vui lòng thử lại.", ok: false }); setLoading(false); return; }
    await redirectByRole(data.user.id);
  };

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setMessage({ text: "Vui lòng nhập họ và tên.", ok: false }); return; }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dang-nhap`,
        data: { full_name: fullName.trim(), phone: phone.trim() },
      },
    });
    if (error) { setMessage({ text: "Lỗi: " + error.message, ok: false }); setLoading(false); return; }
    setMessage({ text: "Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.", ok: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-montserrat bg-slate-50">
      {/* ── Left decorative panel (Hidden on Mobile) ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-800 to-teal-600 min-h-screen">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('${loginBg}')` }} />
        
        <Link href="/" className="relative z-10 flex items-center gap-3 no-underline">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm p-1.5">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span className="text-[15px] font-black text-white tracking-wide">Cao Bằng Travel Connect</span>
        </Link>

        <div className="relative z-10 space-y-3">
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-snug">Mỗi chuyến đi,<br />một hành trình tích điểm</h2>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-md">Tham gia cùng hàng trăm du khách tích lũy điểm thưởng<br />và nhận ưu đãi độc quyền trên mỗi hành trình.</p>
        </div>

        <div className="relative z-10 flex flex-col gap-2.5 max-w-md">
          {TIERS.map((t) => (
            <div key={t.label} className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.color + "25" }}>
                <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 16 }} />
              </div>
              <div className="flex-1">
                <strong className="block text-sm text-white font-bold">Hạng {t.label}</strong>
                <span className="text-xs text-white/50">Từ {t.min}</span>
              </div>
              <span className="text-sm font-black" style={{ color: t.color }}>
                {t.pct !== "0%" ? t.pct : "Miễn phí"}
              </span>
            </div>
          ))}
          <p className="text-white/40 text-[11px] text-center mt-2 font-medium tracking-wide">
            +5% khi book cùng 1 HDV từ 3 lần trở lên
          </p>
        </div>
      </div>

      {/* ── Right form panel (Full width on Mobile) ── */}
      <div className="w-full lg:w-[520px] xl:w-[600px] bg-white flex flex-col justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-20 shadow-2xl relative z-10 pt-safe pb-safe overflow-y-auto min-h-screen lg:min-h-[auto]">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 mb-2 leading-tight">
            {tab === "login" ? "Chào mừng trở lại" : tab === "register" ? "Tạo tài khoản" : "Quên mật khẩu"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {tab === "login" ? "Đăng nhập để xem điểm tích lũy và ưu đãi của bạn"
              : tab === "register" ? "Đăng ký ngay để bắt đầu tích điểm từ chuyến đi đầu tiên"
              : "Nhập email để nhận link đặt lại mật khẩu"}
          </p>
        </div>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "login" ? "bg-white text-teal-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => { setTab("login"); setMessage(null); }}>
              Đăng Nhập
            </button>
            <button className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "register" ? "bg-white text-teal-700 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              onClick={() => { setTab("register"); setMessage(null); }}>
              Đăng Ký
            </button>
          </div>
        )}

        {/* Form */}
        {tab === "login" ? (
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <Field label="Email" id="l-email" type="email" icon="fa-envelope"
              value={email} onChange={setEmail} placeholder="email@example.com" />
            <Field label="Mật khẩu" id="l-pw" type="password" icon="fa-lock"
              value={password} onChange={setPassword} placeholder="••••••••" />

            {message && (
              <p className={`text-[13px] font-semibold p-3 rounded-lg border ${message.ok ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                {message.text}
              </p>
            )}

            <button type="submit" className="w-full mt-2 py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-teal-700/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Đang xử lý...</> : "ĐĂNG NHẬP"}
            </button>

            <div className="text-right mt-1">
              <button type="button" onClick={() => { setTab("forgot"); setMessage(null); }}
                className="text-sm font-semibold text-slate-400 hover:text-teal-600 transition-colors">
                Quên mật khẩu?
              </button>
            </div>
          </form>
        ) : tab === "register" ? (
          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            <Field label="Họ và tên *" id="r-name" icon="fa-user"
              value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
            <Field label="Số điện thoại" id="r-phone" type="tel" icon="fa-phone"
              value={phone} onChange={setPhone} placeholder="0912 345 678" />
            <Field label="Email *" id="r-email" type="email" icon="fa-envelope"
              value={email} onChange={setEmail} placeholder="email@example.com" />
            <Field label="Mật khẩu *" id="r-pw" type="password" icon="fa-lock"
              value={password} onChange={setPassword} placeholder="Tối thiểu 6 ký tự" />

            {message && (
              <p className={`text-[13px] font-semibold p-3 rounded-lg border ${message.ok ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                {message.text}
              </p>
            )}

            <button type="submit" className="w-full mt-2 py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-teal-700/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Đang xử lý...</> : "TẠO TÀI KHOẢN"}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleForgot}>
            <Field label="Email *" id="f-email" type="email" icon="fa-envelope"
              value={email} onChange={setEmail} placeholder="email@example.com" />

            {message && (
              <p className={`text-[13px] font-semibold p-3 rounded-lg border ${message.ok ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                {message.text}
              </p>
            )}

            <button type="submit" className="w-full mt-2 py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-teal-700/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2" disabled={loading}>
              {loading ? <><i className="fa-solid fa-spinner fa-spin" /> Đang gửi...</> : "GỬI LINK ĐẶT LẠI"}
            </button>

            <button type="button" onClick={() => { setTab("login"); setMessage(null); }}
              className="mt-4 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors inline-flex items-center justify-center gap-1.5 w-full">
              <i className="fa-solid fa-arrow-left" /> Quay lại đăng nhập
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors inline-flex items-center gap-1.5">
            <i className="fa-solid fa-arrow-left" /> Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
