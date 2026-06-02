"use client";

import React, { useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface FooterProps {
  userSession: Session | null;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Footer({ userSession, scrollToSection }: FooterProps) {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (contactLoading) return;
    setContactLoading(true);
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage, user_id: userSession?.user.id }),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactName(""); setContactEmail(""); setContactPhone(""); setContactMessage("");
      } else {
        const data = await res.json();
        setContactError(data.error || "Đã có lỗi. Vui lòng thử lại.");
      }
    } catch {
      setContactError("Không thể kết nối.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <footer id="footer" aria-label="Chân trang" style={{ position: "relative", overflow: "hidden", color: "#1a2e2e", padding: 0 }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(238,234,222,.88)" }} />

      {/* Watermark chữ CAO BẰNG */}
      <div className="ftv2-watermark">CAO BẰNG</div>

      {/* Hiệu ứng đám mây */}
      <div className="ftv2-cloud ftv2-cloud-1" />
      <div className="ftv2-cloud ftv2-cloud-2" />
      <div className="ftv2-cloud ftv2-cloud-3" />
      <div className="ftv2-cloud ftv2-cloud-4" />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* TOP GRID */}
        <div className="ftv2-grid">

          {/* Brand */}
          <div className="ftv2-brand">
            <img src="/logo.png" alt="Cao Bằng Travel" style={{ width: 64, height: 64, objectFit: "contain" }} />
            <div className="ftv2-brand-text">
              <strong>CAO BẰNG</strong>
              <span>TRAVEL CONNECT</span>
            </div>
          </div>

          {/* TOUR */}
          <div className="ftv2-col">
            <h5 className="ftv2-heading">TOUR</h5>
            <a href="/hdv" className="ftv2-link">Tour Xe Máy</a>
            <a href="/hdv" className="ftv2-link">Tour Jeep</a>
            <a href="/hdv" className="ftv2-link">Tour Gói</a>
            <a href="/dat-lich" className="ftv2-link">Đặt Lịch Tùy Chỉnh</a>
          </div>

          {/* KHÁM PHÁ */}
          <div className="ftv2-col">
            <h5 className="ftv2-heading">KHÁM PHÁ</h5>
            <a href="#destinations" className="ftv2-link" onClick={(e) => scrollToSection(e, "destinations")}>Điểm Đến</a>
            <a href="#gallery" className="ftv2-link" onClick={(e) => scrollToSection(e, "gallery")}>Thư Viện Ảnh</a>
            <a href="#reviews" className="ftv2-link" onClick={(e) => scrollToSection(e, "reviews")}>Đánh Giá</a>
            <a href="/tai-khoan" className="ftv2-link">Tài Khoản</a>
          </div>

          {/* LIÊN HỆ + HOTLINE */}
          <div className="ftv2-col">
            <h5 className="ftv2-heading">LIÊN HỆ</h5>
            <div className="ftv2-info"><i className="fa-solid fa-location-dot" /> Tp. Cao Bằng, Việt Nam</div>
            <div className="ftv2-info"><i className="fa-solid fa-envelope" /> info@caobangtravel.com</div>
            <h5 className="ftv2-heading" style={{ marginTop: 20 }}>HOTLINE</h5>
            <div className="ftv2-info"><i className="fa-solid fa-phone" /> +84 365 128 823</div>
            <div className="ftv2-info"><i className="fa-solid fa-phone" /> +84 916 361 128</div>
          </div>

          {/* ĐĂNG KÝ + SOCIAL */}
          <div className="ftv2-col">
            <h5 className="ftv2-heading">Liên Hệ Chúng Tôi</h5>
            <form onSubmit={handleContactSubmit}>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                placeholder="Họ và tên" className="ftv2-input" autoComplete="name" required />
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Địa chỉ Email" className="ftv2-input" autoComplete="email" required />
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Số điện thoại" className="ftv2-input" autoComplete="tel" />
              <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Nội dung tin nhắn..." className="ftv2-input ftv2-textarea"
                rows={3} required />
              {!userSession && (
                <p style={{ fontSize: ".72rem", color: "#4a6260", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }} />
                  Đăng nhập để xem phản hồi từ chúng tôi trong tài khoản, Hoặc chúng tôi sẽ liên hệ đến bạn sớm nhất có thể. Chân thành cảm ơn !
                </p>
              )}
              <button type="submit" className="ftv2-send-btn ftv2-send-full" disabled={contactLoading}>
                {contactLoading
                  ? <><i className="fa-solid fa-spinner fa-spin" /> Đang gửi...</>
                  : <><i className="fa-solid fa-paper-plane" /> Gửi Tin Nhắn</>}
              </button>
              {contactSuccess && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: ".74rem", color: "#265C59", fontWeight: 700 }}>
                    <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} /> Gửi thành công!
                  </p>
                  {userSession && (
                    <a href="/tai-khoan" style={{ fontSize: ".72rem", color: "#265C59", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                      <i className="fa-solid fa-envelope-open-text" style={{ fontSize: ".7rem" }} /> Xem phản hồi tại đây
                    </a>
                  )}
                </div>
              )}
              {contactError && (
                <p style={{ fontSize: ".74rem", color: "#dc2626", marginTop: 6 }}>{contactError}</p>
              )}
            </form>

            <h5 className="ftv2-heading" style={{ marginTop: 20 }}>THEO DÕI CHÚNG TÔI</h5>
            <div className="ftv2-socials">
              {[
                { icon: "fa-brands fa-facebook-f", href: "#" },
                { icon: "fa-brands fa-instagram",  href: "#" },
                { icon: "fa-brands fa-tiktok",     href: "#" },
              ].map(({ icon, href }) => (
                <a key={icon} href={href} className="ftv2-social" aria-label={icon}>
                  <i className={icon} />
                </a>
              ))}
            </div>

            <a href="/dat-lich" className="ftv2-book-btn">Đặt Lịch Ngay</a>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="ftv2-bottom">
          <span>Chính sách Cookies</span>
          <span className="ftv2-bottom-copy">© 2025 Cao Bằng Travel Connect. Bảo lưu mọi quyền.</span>
          <span>Quyền Riêng Tư</span>
          <span>Điều Khoản Sử Dụng</span>
        </div>
      </div>
    </footer>
  );
}
