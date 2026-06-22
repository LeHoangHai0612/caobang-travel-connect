"use client";

import React from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";

interface FooterProps {
  userSession: Session | null;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function Footer({ scrollToSection }: FooterProps) {
  return (
    <footer id="footer" className="cb-footer">
      {/* Mountain / landscape illustration strip */}
      <div className="cb-footer__landscape" aria-hidden="true">
        <svg viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="cb-footer__landscape-svg">
          <path d="M0 180 L0 120 L120 60 L240 100 L360 30 L480 80 L600 10 L720 60 L840 20 L960 70 L1080 40 L1200 90 L1320 50 L1440 80 L1440 180 Z" fill="#1a3a25" opacity="0.9"/>
          <path d="M0 180 L0 140 L180 90 L360 120 L540 70 L720 100 L900 60 L1080 100 L1260 75 L1440 110 L1440 180 Z" fill="#1a3a25"/>
        </svg>
        {/* Clouds */}
        <div className="cb-footer__cloud cb-footer__cloud--1" />
        <div className="cb-footer__cloud cb-footer__cloud--2" />
        <div className="cb-footer__cloud cb-footer__cloud--3" />
      </div>

      <div className="cb-footer__body">
        <div className="container">
          <div className="cb-footer__grid">
            {/* Brand */}
            <div className="cb-footer__brand">
              <img src="/logo.png" alt="Cao Bằng Travel" className="cb-footer__logo" />
              <div className="cb-footer__brand-text">
                <strong>CAO BẰNG</strong>
                <span>TRAVEL CONNECT</span>
              </div>
            </div>

            {/* Tour */}
            <div className="cb-footer__col">
              <h5 className="cb-footer__heading">Tour</h5>
              <Link href="/tour" className="cb-footer__link">Motorbike Tour</Link>
              <Link href="/tour" className="cb-footer__link">Jeep Tour</Link>
              <Link href="/tour" className="cb-footer__link">Package Tour</Link>
              <Link href="/dat-lich" className="cb-footer__link">Other Tour</Link>
            </div>

            {/* Read Me */}
            <div className="cb-footer__col">
              <h5 className="cb-footer__heading">Read Me</h5>
              <a href="#contact" className="cb-footer__link" onClick={(e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, "contact")}>Contact Us</a>
              <a href="#gallery" className="cb-footer__link" onClick={(e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, "gallery")}>Our Gallery</a>
              <a href="#reviews" className="cb-footer__link" onClick={(e) => scrollToSection(e as React.MouseEvent<HTMLAnchorElement>, "reviews")}>Feed Back</a>
            </div>

            {/* Contact */}
            <div className="cb-footer__col">
              <h5 className="cb-footer__heading">Contact Us</h5>
              <a
                href="https://maps.app.goo.gl/LNysPdnnUDy4gbKU6"
                target="_blank"
                rel="noopener noreferrer"
                className="cb-footer__info"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Cao Bang Travel, Vietnam
              </a>
              <a href="mailto:info.caobangtravel@gmail.com" className="cb-footer__info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                info.caobangtravel@gmail.com
              </a>

              <h5 className="cb-footer__heading" style={{ marginTop: 20 }}>Hotline</h5>
              <a href="tel:+84966322829" className="cb-footer__info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +84 966 322 829
              </a>
              <a href="tel:+84916361128" className="cb-footer__info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +84 916 361 128
              </a>
            </div>

            {/* Newsletter + Social */}
            <div className="cb-footer__col">
              <h5 className="cb-footer__heading">Sign up for information</h5>
              <form
                className="cb-footer__newsletter"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="cb-footer__email-input"
                  required
                />
                <button type="submit" className="cb-footer__email-btn" aria-label="Subscribe">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </form>

              <h5 className="cb-footer__heading" style={{ marginTop: 20 }}>Follow Us</h5>
              <div className="cb-footer__socials">
                <a href="https://www.facebook.com/CaoBangTravelNature/" target="_blank" rel="noopener noreferrer" className="cb-footer__social" aria-label="Facebook">
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a href="https://www.instagram.com/caobang.travel/" target="_blank" rel="noopener noreferrer" className="cb-footer__social" aria-label="Instagram">
                  <i className="fa-brands fa-instagram" />
                </a>
                <a href="https://www.tiktok.com/@caobang.travel" target="_blank" rel="noopener noreferrer" className="cb-footer__social" aria-label="TikTok">
                  <i className="fa-brands fa-tiktok" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="cb-footer__bottom">
        <div className="container">
          <div className="cb-footer__bottom-inner">
            <a href="#" className="cb-footer__bottom-link">Cookies</a>
            <span className="cb-footer__copyright">© 2025 Cao Bang Travel · Privacy · Terms &amp; conditions</span>
            <a href="#" className="cb-footer__bottom-link">Privacy</a>
            <a href="#" className="cb-footer__bottom-link">Terms &amp; conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
