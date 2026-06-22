import React from "react";

interface TourCardProps {
  id: string;
  title: string;
  imageUrl: string;
  locationTag: string;
  duration: string;
  price: string;
  transport?: string; // "motorbike" | "jeep" | "van"
  isHot?: boolean;
  onBookNow?: () => void;
}

function TransportIcon({ type }: { type?: string }) {
  if (type === "jeep")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    );
  // motorbike default
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
      <path d="M15 6H9l-2 6h10l-2-6z"/><path d="M15 6l2 5"/><path d="M9 6L7 11"/>
    </svg>
  );
}

export default function TourCard({
  title,
  imageUrl,
  locationTag,
  duration,
  price,
  transport = "motorbike",
  isHot = true,
  onBookNow,
}: TourCardProps) {
  return (
    <div className="cb-tour-card">
      {/* Image */}
      <div className="cb-tour-card__img-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="cb-tour-card__img" loading="lazy" />
        ) : (
          <div className="cb-tour-card__img-placeholder">
            <i className="fa-solid fa-map" />
          </div>
        )}
        {isHot && <span className="cb-tour-card__badge">Hot deal</span>}
      </div>

      {/* Body */}
      <div className="cb-tour-card__body">
        {/* Meta chips */}
        <div className="cb-tour-card__meta">
          <span className="cb-tour-card__meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {locationTag}
          </span>
          <span className="cb-tour-card__meta-item">
            <TransportIcon type={transport} />
            {transport === "jeep" ? "Jeep" : "Motorbike"}
          </span>
          <span className="cb-tour-card__meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="cb-tour-card__title">{title}</h3>

        {/* Footer: price + CTA */}
        <div className="cb-tour-card__footer">
          <div className="cb-tour-card__price">
            <span className="cb-tour-card__price-from">From</span>
            <span className="cb-tour-card__price-value">{price}</span>
          </div>
          <button onClick={onBookNow} className="cb-tour-card__cta" aria-label="Book tour">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
