"use client";

import React from "react";
import { getTier } from "@/lib/loyalty";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/database.types";

interface HeaderProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeSection: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  userSession: Session | null;
  userProfile: UserProfile | null;
  unreadReplies: number;
}

export default function Header({
  isScrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeSection,
  scrollToSection,
  userSession,
  userProfile,
  unreadReplies,
}: HeaderProps) {
  return (
    <header id="site-header" className={isScrolled ? "scrolled scrolled-capsule" : ""}>
      <div className="container">
        <nav role="navigation" aria-label="Điều hướng chính">
          <a href="#hero" className="nav-logo" onClick={(e) => scrollToSection(e, "hero")}>
            <img src="/logo.png" alt="Cao Bằng Travel Connect" style={{ height: 38, width: 38, objectFit: "contain", filter: isScrolled ? "none" : "brightness(0) invert(1)", mixBlendMode: isScrolled ? "multiply" : "normal", transition: "filter .35s" }} />
            <div className="nav-logo-text">
              <strong>Cao Bằng</strong>
              <span>Travel Connect</span>
            </div>
          </a>

          <ul className="nav-links" role="list">
            {[
              { id: "hero",         label: "Trang Chủ" },
              { id: "why-us",       label: "Giới Thiệu" },
              { id: "team",         label: "HDV" },
              { id: "tours",        label: "Tours" },
              { id: "destinations", label: "Điểm Đến" },
              { id: "gallery",      label: "Hình Ảnh" },
              { id: "cam-nang",     label: "Cẩm Nang" },
              { id: "footer",       label: "Liên Hệ" },
            ].map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className={activeSection === id ? "active" : ""} onClick={(e) => scrollToSection(e, id)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
            <i className="fa-solid fa-calendar-check" aria-hidden="true" /> ĐẶT HDV NGAY
          </a>

          {userSession ? (
            <a href="/tai-khoan" className="nav-user-btn" style={{ position: "relative" }}>
              <i className={`fa-solid ${userProfile ? getTier(userProfile.points).icon : "fa-award"}`}
                 style={{ color: userProfile ? getTier(userProfile.points).color : "#cd7f32" }} />
              <span>Tài Khoản</span>
              {unreadReplies > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#dc2626", color: "white",
                  borderRadius: "50%", width: 17, height: 17,
                  fontSize: ".6rem", fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid white",
                }}>{unreadReplies}</span>
              )}
            </a>
          ) : (
            <a href="/dang-nhap" className="nav-user-btn">
              <i className="fa-solid fa-user" />
              <span>Đăng Nhập</span>
            </a>
          )}

          <button
            className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
            aria-label="Mở menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span /><span /><span />
          </button>
        </nav>
      </div>
    </header>
  );
}
