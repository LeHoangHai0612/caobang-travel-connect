"use client";

import React, { useState, useRef } from "react";

interface TourCategoryProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bgClass?: string;
  icon?: "motorbike" | "jeep";
  seeMoreHref?: string;
  tabs?: string[];
}

function MotorbikeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6H9l-2 6h10l-2-6z"/><path d="M15 6l2 5"/><path d="M9 6L7 11"/>
    </svg>
  );
}

function JeepIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
}

const DEFAULT_TABS = ["Cao Bang Loop", "Ha Giang Loop", "Ha Giang + Cao Bang"];

export default function TourCategory({
  id,
  title,
  subtitle,
  children,
  bgClass = "bg-white",
  icon = "motorbike",
  seeMoreHref = "/tour",
  tabs = DEFAULT_TABS,
}: TourCategoryProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <section id={id} className={`cb-tour-section ${bgClass}`}>
      <div className="container">
        {/* Header */}
        <div className="cb-tour-section__header">
          <div className="cb-tour-section__title-wrap">
            {/* Underline decoration */}
            <div className="cb-tour-section__underline" aria-hidden="true">
              <svg viewBox="0 0 120 10" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0 5 Q30 0 60 5 Q90 10 120 5" stroke="#265C59" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="cb-tour-section__title">{title}</h2>
          </div>
          <div className="cb-tour-section__icon">
            {icon === "jeep" ? <JeepIcon /> : <MotorbikeIcon />}
          </div>
        </div>

        {subtitle && <p className="cb-tour-section__subtitle">{subtitle}</p>}

        {/* Tabs + All Tour link */}
        <div className="cb-tour-section__tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cb-tour-section__tab${activeTab === tab ? " cb-tour-section__tab--active" : ""}`}
            >
              {tab}
            </button>
          ))}
          <a href={seeMoreHref} className="cb-tour-section__all-link">
            All Tour
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        {/* Cards with prev/next */}
        <div className="cb-tour-section__carousel-wrap">
          <button className="cb-tour-section__nav cb-tour-section__nav--left" onClick={() => scroll("left")} aria-label="Prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="cb-tour-section__cards" ref={scrollRef}>
            {children}
          </div>

          <button className="cb-tour-section__nav cb-tour-section__nav--right" onClick={() => scroll("right")} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* See more */}
        <div className="cb-tour-section__more">
          <a href={seeMoreHref} className="cb-tour-section__more-link">
            See more
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
