"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/database.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

const TOUR_MENUS = [
  {
    label: "Motorbike Tour",
    href: "/tour",
    sub: [
      { label: "3 days 2 nights", href: "/tour" },
      { label: "2 days 1 night", href: "/tour" },
      { label: "Full day", href: "/tour" },
    ],
  },
  {
    label: "Jeep Tour",
    href: "/tour",
    sub: [
      { label: "3 days 2 nights", href: "/tour" },
      { label: "2 days 1 night", href: "/tour" },
      { label: "Full day", href: "/tour" },
    ],
  },
  {
    label: "Package Tour",
    href: "/tour",
    sub: [
      { label: "Ha Giang – Cao Bang", href: "/tour" },
    ],
  },
  { label: "Customize", href: "/dat-lich", sub: [] },
];

const RIGHT_NAV = [
  { label: "Destination", id: "destinations" },
  { label: "About Us", id: "why-us" },
  { label: "Blog", id: "cam-nang" },
];

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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <>
      <header
        className={cn(
          "cb-header",
          isScrolled ? "cb-header--scrolled" : "cb-header--top"
        )}
        id="site-header"
      >
        <div className="cb-header__inner">
          {/* ── LEFT: Logo icon + Tour menus ── */}
          <div className="cb-header__left">
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, "hero")}
              className="cb-header__home-icon"
              aria-label="Trang chủ"
            >
              <img src="/logo.png" alt="Home" className="cb-header__home-img" />
            </a>

            <nav className="cb-header__tour-nav">
              {TOUR_MENUS.map((menu) => (
                <div
                  key={menu.label}
                  className="cb-tour-item"
                  onMouseEnter={() => menu.sub.length && handleMouseEnter(menu.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a href={menu.href} className="cb-tour-item__label">
                    {menu.label}
                    {menu.sub.length > 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </a>

                  {menu.sub.length > 0 && openMenu === menu.label && (
                    <div
                      className="cb-tour-dropdown"
                      onMouseEnter={() => handleMouseEnter(menu.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="cb-tour-dropdown__menu">
                        <p className="cb-tour-dropdown__heading">/MENU</p>
                        <a href={menu.href} className="cb-tour-dropdown__main">
                          {menu.label}
                        </a>
                        {menu.sub.map((s) => (
                          <a key={s.label} href={s.href} className="cb-tour-dropdown__sub">
                            {s.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* ── CENTER: Main logo ── */}
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "hero")}
            className="cb-header__logo"
          >
            <img src="/logo.png" alt="Cao Bang Travel" className="cb-header__logo-img" />
            <div className="cb-header__logo-text">
              <strong>Cao Bằng</strong>
              <span>Travel Connect</span>
            </div>
          </a>

          {/* ── RIGHT: Secondary nav + CTA ── */}
          <div className="cb-header__right">
            <nav className="cb-header__right-nav">
              {RIGHT_NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={cn(
                    "cb-header__right-link",
                    activeSection === item.id && "cb-header__right-link--active"
                  )}
                >
                  {item.label}
                </a>
              ))}
              {userSession ? (
                <Link href="/tai-khoan" className="cb-header__right-link">
                  {userProfile?.full_name || "Account"}
                  {unreadReplies > 0 && (
                    <span className="cb-header__badge">{unreadReplies}</span>
                  )}
                </Link>
              ) : (
                <Link href="/dang-nhap" className="cb-header__right-link">Login</Link>
              )}
            </nav>

            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, "contact")}
              className="cb-header__cta"
            >
              Contact us
            </a>
          </div>

          {/* ── Mobile toggle ── */}
          <button
            className={cn("cb-header__hamburger", isMobileMenuOpen && "cb-header__hamburger--open")}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}
