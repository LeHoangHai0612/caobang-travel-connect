"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HeroSectionProps {
  backgroundImageUrl?: string;
  onSearch?: (query: string) => void;
}

const HOT_DEALS = [
  "2 DAYS MOTORBIKE CAO BANG LOOP TOUR",
  "FULL DAY JEEP CAO BANG LOOP",
  "3 DAYS MOTORBIKE HA GIANG LOOP TOUR",
  "4 DAYS MOTORBIKE HA GIANG LOOP TOUR",
  "FULL DAY MOTORBIKE CAO BANG LOOP",
];

const TAGS = ["History", "Cao Bang", "Motorbike", "Jeep Tour", "Hot", "Ha Giang", "Ban Gioc"];

export default function HeroSection({
  backgroundImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg",
  onSearch,
}: HeroSectionProps) {
  const [, setDealIdx] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Cycle hot deals
  useEffect(() => {
    const t = setInterval(() => setDealIdx((i) => (i + 1) % HOT_DEALS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    onSearch?.(tag);
  };

  return (
    <section className="cb-hero" id="hero">
      {/* Background */}
      <div className="cb-hero__bg">
        <img src={backgroundImageUrl} alt="Cao Bằng" className="cb-hero__bg-img" />
        <div className="cb-hero__overlay" />
      </div>

      {/* Nav arrows */}
      <button className="cb-hero__arrow cb-hero__arrow--left" aria-label="Prev">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button className="cb-hero__arrow cb-hero__arrow--right" aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Main content */}
      <div className="cb-hero__content">
        {/* Sun + Welcome */}
        <div className="cb-hero__welcome">
          <img
            src="https://caobang.travel/wp-content/uploads/2025/04/sun.png"
            alt="sun"
            className="cb-hero__sun"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className="cb-hero__welcome-text">Welcome to</span>
        </div>

        <h1 className="cb-hero__title">Cao Bằng Travel</h1>

        {/* Search bar */}
        <div className="cb-hero__search-wrap">
          <button
            className="cb-hero__search-icon-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {searchOpen && (
            <input
              autoFocus
              type="text"
              className="cb-hero__search-input"
              placeholder="Tìm tour, điểm đến..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); onSearch?.(e.target.value); }}
            />
          )}
        </div>

        {/* CTA buttons */}
        <div className="cb-hero__actions">
          <Link href="/dat-lich" className="cb-hero__btn-primary">
            Book Now
          </Link>
          <a
            href="https://wa.me/84966322829"
            target="_blank"
            rel="noopener noreferrer"
            className="cb-hero__btn-whatsapp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Bottom area: hot deal ticker + tags */}
      <div className="cb-hero__bottom">
        {/* Hot deal ticker */}
        <div className="cb-hero__deals">
          <div className="cb-hero__deals-track">
            {[...HOT_DEALS, ...HOT_DEALS].map((deal, i) => (
              <Link key={i} href="/tour" className="cb-hero__deal-item">
                <span className="cb-hero__deal-badge">Hot deal</span>
                <span className="cb-hero__deal-name">{deal}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tags row */}
        <div className="cb-hero__tags">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`cb-hero__tag${activeTags.includes(tag) ? " cb-hero__tag--active" : ""}`}
            >
              {tag}
              {activeTags.includes(tag) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
