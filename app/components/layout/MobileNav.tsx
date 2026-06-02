"use client";

import React from "react";
import type { Session } from "@supabase/supabase-js";

interface MobileNavProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  userSession: Session | null;
  unreadReplies: number;
}

export default function MobileNav({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  scrollToSection,
  userSession,
  unreadReplies
}: MobileNavProps) {
  return (
    <>
      {/* Drawer menu for secondary items on mobile */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`} aria-label="Menu điều hướng di động">
        {[
          { id: "hero",         label: "Trang Chủ" },
          { id: "why-us",       label: "Giới Thiệu" },
          { id: "team",         label: "HDV" },
          { id: "tours",        label: "Tours" },
          { id: "destinations", label: "Điểm Đến" },
          { id: "gallery",      label: "Hình Ảnh" },
          { id: "cam-nang",     label: "Cẩm Nang" },
          { id: "pricing",      label: "Bảng Giá" },
          { id: "footer",       label: "Liên Hệ" },
        ].map(({ id, label }) => (
          <a key={id} href={`#${id}`} onClick={(e) => scrollToSection(e, id)}>{label}</a>
        ))}
        <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
          <i className="fa-solid fa-calendar-check" /> ĐẶT HDV NGAY
        </a>
        <a
          href={userSession ? "/tai-khoan" : "/dang-nhap"}
          className="mobile-nav-account btn-cta"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <i className={`fa-solid ${userSession ? "fa-user" : "fa-right-to-bracket"}`} />
          {userSession ? "Tài Khoản" : "Đăng Nhập"}
        </a>
      </nav>

      {/* Bottom Tab Bar cho Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(38,92,89,0.08)] border-t border-teal-dark/10 flex justify-around items-center pb-[env(safe-area-inset-bottom)] h-[64px] md:hidden">
        <a href="/" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-house text-lg mb-1" />
          <span className="text-[10px] font-bold">Trang Chủ</span>
        </a>
        <a href="/hdv" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-person-hiking text-lg mb-1" />
          <span className="text-[10px] font-bold">HDV</span>
        </a>
        <a href="/tour" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-map-location-dot text-lg mb-1" />
          <span className="text-[10px] font-bold">Tours</span>
        </a>
        <a href="/dat-lich" className="flex flex-col items-center justify-center w-full h-full text-teal-dark relative">
          <div className="absolute -top-5 bg-teal-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <i className="fa-solid fa-calendar-check text-xl" />
          </div>
          <span className="text-[10px] font-bold mt-6">Đặt Lịch</span>
        </a>
        <a href={userSession ? "/tai-khoan" : "/dang-nhap"} className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark relative">
          <i className="fa-solid fa-user text-lg mb-1" />
          <span className="text-[10px] font-bold">{userSession ? "Tài Khoản" : "Đăng Nhập"}</span>
          {unreadReplies > 0 && (
            <span className="absolute top-1 right-2 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center border border-white">
              {unreadReplies}
            </span>
          )}
        </a>
      </nav>
    </>
  );
}
