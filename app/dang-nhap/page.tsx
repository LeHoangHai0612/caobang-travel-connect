"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <i className={`fa-solid ${icon} auth-input-icon`} />
        <input
          id={id} type={type} value={value} placeholder={placeholder} required={type !== "tel"}
          onChange={(e) => onChange(e.target.value)}
          className="auth-input"
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/tai-khoan";
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ text: "Sai email hoặc mật khẩu. Vui lòng thử lại.", ok: false });
    else window.location.href = "/tai-khoan";
    setLoading(false);
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
    // Không upsert user_profiles ở đây vì user chưa có session
    // Trigger handle_new_user() sẽ tự tạo profile với full_name/phone từ metadata
    setMessage({ text: "Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.", ok: true });
    setLoading(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Montserrat', sans-serif;
          background: #f4f6f3;
        }

        /* ── Left panel ── */
        .auth-left {
          flex: 1;
          background: linear-gradient(160deg, #1a3c3a 0%, #265C59 45%, #3a9490 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 48px;
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--login-bg-img) center/cover no-repeat;
          opacity: .12;
        }
        .auth-left-logo {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; position: relative;
        }
        .auth-left-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: white;
        }
        .auth-left-logo span { font-size: .95rem; font-weight: 800; color: white; letter-spacing: .02em; }
        .auth-left-hero { position: relative; }
        .auth-left-hero h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 900; color: white;
          line-height: 1.25; margin-bottom: 14px;
        }
        .auth-left-hero p { color: rgba(255,255,255,.72); font-size: .92rem; line-height: 1.7; }

        /* Tier cards */
        .auth-tiers { display: flex; flex-direction: column; gap: 10px; position: relative; }
        .auth-tier-row {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; padding: 12px 16px;
          backdrop-filter: blur(6px);
          transition: background .2s;
        }
        .auth-tier-row:hover { background: rgba(255,255,255,.14); }
        .auth-tier-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .auth-tier-info { flex: 1; }
        .auth-tier-info strong { display: block; font-size: .82rem; color: white; font-weight: 700; }
        .auth-tier-info span { font-size: .74rem; color: rgba(255,255,255,.55); }
        .auth-tier-pct { font-size: .88rem; font-weight: 800; }

        /* ── Right panel ── */
        .auth-right {
          width: 460px;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 44px;
          overflow-y: auto;
        }
        .auth-right-head { margin-bottom: 32px; }
        .auth-right-head h1 { font-size: 1.65rem; font-weight: 900; color: #1a2e2e; margin-bottom: 6px; }
        .auth-right-head p { font-size: .875rem; color: #6b8888; font-weight: 500; }

        /* Tab switcher */
        .auth-tabs { display: flex; gap: 4px; background: #f4f6f3; border-radius: 12px; padding: 4px; margin-bottom: 28px; }
        .auth-tab {
          flex: 1; padding: 10px; border: none; border-radius: 9px;
          cursor: pointer; font-family: 'Montserrat', sans-serif;
          font-size: .85rem; font-weight: 700; transition: all .2s;
          background: transparent; color: #9e9e9e;
        }
        .auth-tab.active { background: white; color: #265C59; box-shadow: 0 2px 8px rgba(0,0,0,.08); }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-field { display: flex; flex-direction: column; gap: 7px; }
        .auth-label {
          font-size: .72rem; font-weight: 700; color: #3d5555;
          text-transform: uppercase; letter-spacing: .08em;
        }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9e9e9e; font-size: .85rem; pointer-events: none;
        }
        .auth-input {
          width: 100%; padding: 12px 14px 12px 40px;
          border: 1.5px solid #e8e8e8; border-radius: 10px;
          font-family: 'Montserrat', sans-serif; font-size: .9rem;
          color: #1a2e2e; background: #fafafa;
          outline: none; transition: border-color .2s, background .2s;
        }
        .auth-input::placeholder { color: #c0c0c0; }
        .auth-input:focus { border-color: #3a9490; background: white; }

        /* Message */
        .auth-msg {
          padding: 11px 14px; border-radius: 9px;
          font-size: .82rem; font-weight: 600; line-height: 1.5;
        }
        .auth-msg.ok  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .auth-msg.err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Submit button */
        .auth-submit {
          padding: 14px; border: none; border-radius: 10px;
          background: linear-gradient(135deg, #265C59, #3a9490);
          color: white; font-family: 'Montserrat', sans-serif;
          font-size: .9rem; font-weight: 800; letter-spacing: .06em;
          cursor: pointer; transition: opacity .2s, transform .15s;
          box-shadow: 0 4px 14px rgba(38,92,89,.3);
          margin-top: 4px;
        }
        .auth-submit:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
        .auth-submit:disabled { opacity: .65; cursor: not-allowed; }

        .auth-footer { margin-top: 24px; text-align: center; font-size: .82rem; color: #9e9e9e; }
        .auth-footer a { color: #265C59; font-weight: 700; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }

        /* Mobile */
        @media (max-width: 860px) {
          .auth-left { display: none; }
          .auth-right { width: 100%; min-height: 100vh; padding: 36px 24px; }
        }
        @media (max-width: 400px) {
          .auth-right { padding: 28px 18px; }
        }
      `}</style>

      <div className="auth-page">
        {/* ── Left decorative panel ── */}
        <div className="auth-left" style={{ "--login-bg-img": `url('${loginBg}')` } as React.CSSProperties}>
          <a href="/" className="auth-left-logo">
            <div className="auth-left-logo-icon" style={{ background: "rgba(255,255,255,.15)", padding: 5, borderRadius: 10 }}>
              <img src="/logo.png" alt="Logo" style={{ width: 34, height: 34, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            </div>
            <span>Cao Bằng Travel Connect</span>
          </a>

          <div className="auth-left-hero">
            <h2>Mỗi chuyến đi,<br />một hành trình tích điểm</h2>
            <p>Tham gia cùng hàng trăm du khách tích lũy điểm thưởng<br />và nhận ưu đãi độc quyền trên mỗi hành trình.</p>
          </div>

          <div className="auth-tiers">
            {TIERS.map((t) => (
              <div className="auth-tier-row" key={t.label}>
                <div className="auth-tier-icon" style={{ background: t.color + "25" }}>
                  <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 16 }} />
                </div>
                <div className="auth-tier-info">
                  <strong>Hạng {t.label}</strong>
                  <span>Từ {t.min}</span>
                </div>
                <span className="auth-tier-pct" style={{ color: t.color }}>
                  {t.pct !== "0%" ? t.pct : "Miễn phí"}
                </span>
              </div>
            ))}
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".72rem", textAlign: "center", marginTop: 4 }}>
              +5% khi book cùng 1 HDV từ 3 lần trở lên
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-right">
          <div className="auth-right-head">
            <h1>{tab === "login" ? "Chào mừng trở lại" : tab === "register" ? "Tạo tài khoản" : "Quên mật khẩu"}</h1>
            <p>
              {tab === "login" ? "Đăng nhập để xem điểm tích lũy và ưu đãi của bạn"
                : tab === "register" ? "Đăng ký ngay để bắt đầu tích điểm từ chuyến đi đầu tiên"
                : "Nhập email để nhận link đặt lại mật khẩu"}
            </p>
          </div>

          {/* Tabs */}
          {tab !== "forgot" && (
            <div className="auth-tabs">
              <button className={`auth-tab${tab === "login" ? " active" : ""}`}
                onClick={() => { setTab("login"); setMessage(null); }}>
                Đăng Nhập
              </button>
              <button className={`auth-tab${tab === "register" ? " active" : ""}`}
                onClick={() => { setTab("register"); setMessage(null); }}>
                Đăng Ký
              </button>
            </div>
          )}

          {/* Form */}
          {tab === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <Field label="Email" id="l-email" type="email" icon="fa-envelope"
                value={email} onChange={setEmail} placeholder="email@example.com" />
              <Field label="Mật khẩu" id="l-pw" type="password" icon="fa-lock"
                value={password} onChange={setPassword} placeholder="••••••••" />

              {message && <p className={`auth-msg ${message.ok ? "ok" : "err"}`}>{message.text}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Đang xử lý...</> : "ĐĂNG NHẬP"}
              </button>

              <button type="button" onClick={() => { setTab("forgot"); setMessage(null); }}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: ".8rem", cursor: "pointer", textAlign: "right", fontFamily: "inherit", padding: 0 }}>
                Quên mật khẩu?
              </button>
            </form>
          ) : tab === "register" ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <Field label="Họ và tên *" id="r-name" icon="fa-user"
                value={fullName} onChange={setFullName} placeholder="Nguyễn Văn A" />
              <Field label="Số điện thoại" id="r-phone" type="tel" icon="fa-phone"
                value={phone} onChange={setPhone} placeholder="0912 345 678" />
              <Field label="Email *" id="r-email" type="email" icon="fa-envelope"
                value={email} onChange={setEmail} placeholder="email@example.com" />
              <Field label="Mật khẩu *" id="r-pw" type="password" icon="fa-lock"
                value={password} onChange={setPassword} placeholder="Tối thiểu 6 ký tự" />

              {message && <p className={`auth-msg ${message.ok ? "ok" : "err"}`}>{message.text}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Đang xử lý...</> : "TẠO TÀI KHOẢN"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleForgot}>
              <Field label="Email *" id="f-email" type="email" icon="fa-envelope"
                value={email} onChange={setEmail} placeholder="email@example.com" />

              {message && <p className={`auth-msg ${message.ok ? "ok" : "err"}`}>{message.text}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Đang gửi...</> : "GỬI LINK ĐẶT LẠI"}
              </button>

              <button type="button" onClick={() => { setTab("login"); setMessage(null); }}
                style={{ background: "none", border: "none", color: "#265C59", fontSize: ".82rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, padding: 0 }}>
                ← Quay lại đăng nhập
              </button>
            </form>
          )}

          <div className="auth-footer">
            <a href="/">← Quay về trang chủ</a>
          </div>
        </div>
      </div>
    </>
  );
}
