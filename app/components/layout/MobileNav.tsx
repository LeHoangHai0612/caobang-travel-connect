"use client";

import React from "react";
import Link from "next/link";
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
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav
        className={`cb-mobile-nav${isMobileMenuOpen ? " cb-mobile-nav--open" : ""}`}
        aria-label="Menu di động"
      >
        <div className="cb-mobile-nav__header">
          <img src="/logo.png" alt="Logo" className="cb-mobile-nav__logo" />
          <div>
            <strong className="cb-mobile-nav__brand">Cao Bằng</strong>
            <span className="cb-mobile-nav__brand-sub">Travel Connect</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="cb-mobile-nav__close">✕</button>
        </div>

        <div className="cb-mobile-nav__items">
          {[
            { id: "hero",         label: "Motorbike Tour" },
            { id: "jeep-tours",   label: "Jeep Tour" },
            { id: "tours",        label: "Tours" },
            { id: "destinations", label: "Destinations" },
            { id: "why-us",       label: "About Us" },
            { id: "cam-nang",     label: "Blog" },
            { id: "contact",      label: "Contact Us" },
          ].map(({ id, label }) => (
            <a key={id} href={`#${id}`} className="cb-mobile-nav__link" onClick={(e) => { scrollToSection(e, id); setIsMobileMenuOpen(false); }}>
              {label}
            </a>
          ))}
        </div>

        <div className="cb-mobile-nav__footer">
          <Link href="/dat-lich" className="cb-mobile-nav__cta" onClick={() => setIsMobileMenuOpen(false)}>
            Book Now
          </Link>
          <Link href={userSession ? "/tai-khoan" : "/dang-nhap"} className="cb-mobile-nav__account" onClick={() => setIsMobileMenuOpen(false)}>
            {userSession ? "My Account" : "Login"}
            {unreadReplies > 0 && <span className="cb-header__badge">{unreadReplies}</span>}
          </Link>
        </div>
      </nav>

      {/* Floating Dock cho Mobile */}
      <nav className="fixed left-4 right-4 z-50 bg-white/85 backdrop-blur-xl shadow-[0_12px_40px_rgba(38,92,89,0.25)] border border-white/50 rounded-full flex justify-around items-center h-[64px] md:!hidden lg:!hidden"
           style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-house text-lg mb-1" />
          <span className="text-[10px] font-bold">Trang Chủ</span>
        </Link>
        <Link href="/hdv" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-person-hiking text-lg mb-1" />
          <span className="text-[10px] font-bold">HDV</span>
        </Link>
        <Link href="/tour" className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark">
          <i className="fa-solid fa-map-location-dot text-lg mb-1" />
          <span className="text-[10px] font-bold">Tours</span>
        </Link>
        <Link href="/dat-lich" className="flex flex-col items-center justify-center w-full h-full text-teal-dark relative">
          <div className="absolute -top-5 bg-teal-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <i className="fa-solid fa-calendar-check text-xl" />
          </div>
          <span className="text-[10px] font-bold mt-6">Đặt Lịch</span>
        </Link>
        <Link href={userSession ? "/tai-khoan" : "/dang-nhap"} className="flex flex-col items-center justify-center w-full h-full text-text-mid hover:text-teal-dark relative">
          <i className="fa-solid fa-user text-lg mb-1" />
          <span className="text-[10px] font-bold">{userSession ? "Tài Khoản" : "Đăng Nhập"}</span>
          {unreadReplies > 0 && (
            <span className="absolute top-1 right-2 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center border border-white">
              {unreadReplies}
            </span>
          )}
        </Link>
      </nav>
    </>
  );
}
