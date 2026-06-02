"use client";

import React, { useState } from "react";
import type { Review } from "@/lib/database.types";

interface TestimonialsProps {
  testimonialsBg: string;
  reviews: Review[];
  openReview: () => void;
}

export default function Testimonials({ testimonialsBg, reviews, openReview }: TestimonialsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / cardsPerPage) || 1;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  const StarIcons = ({ rating }: { rating: number }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<i key={i} className="fa-solid fa-star" />);
      else if (i - 0.5 <= rating) stars.push(<i key={i} className="fa-solid fa-star-half-stroke" />);
      else stars.push(<i key={i} className="fa-regular fa-star" />);
    }
    return <>{stars}</>;
  };

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testi-heading"
      style={{ background: `linear-gradient(150deg,rgba(13,40,38,.88),rgba(26,60,58,.85),rgba(17,46,44,.88)),url('${testimonialsBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Khách Hàng Nói Gì</span>
          <h2 className="section-title" id="testi-heading">Ý Kiến Khách Hàng</h2>
          <p className="section-subtitle">Những chia sẻ chân thực từ du khách đã trải nghiệm dịch vụ của chúng tôi</p>
          <button
            onClick={openReview}
            style={{
              marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 30,
              background: "var(--teal-dark)", color: "white",
              border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: ".84rem", fontWeight: 700,
              boxShadow: "0 4px 14px rgba(38,92,89,.3)", transition: "all .2s",
            }}
          >
            <i className="fa-solid fa-star" /> Viết Đánh Giá
          </button>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track">
            {reviews.map((review, i) => {
              const isVisible = i >= currentPage * cardsPerPage && i < (currentPage + 1) * cardsPerPage;
              const initials = review.reviewer_name
                .split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase();
              return (
                <article key={review.id} className="review-card" style={{ display: isVisible ? "flex" : "none" }}>
                  <div className="review-stars" aria-label={`${review.stars} sao`}>
                    <StarIcons rating={review.stars} />
                    <span style={{ fontSize: ".74rem", fontWeight: 700, color: "#94a3b8", marginLeft: 6 }}>
                      {review.stars}.0
                    </span>
                  </div>
                  <blockquote className="review-text">{review.review_text}</blockquote>
                  <footer className="reviewer">
                    {review.avatar_url
                      ? <img className="reviewer-avatar" src={review.avatar_url} alt={review.reviewer_name} loading="lazy" />
                      : <div className="reviewer-initial">{initials}</div>}
                    <div className="reviewer-info">
                      <h4>{review.reviewer_name}</h4>
                      <span>{review.reviewer_location}</span>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
        </div>

        <div className="carousel-nav">
          <button className="carousel-btn prev" onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0} aria-label="Trang trước">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="carousel-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i}
                className={`carousel-dot${i === currentPage ? " active" : ""}`}
                onClick={() => handlePageChange(i)} aria-label={`Trang ${i + 1}`} />
            ))}
          </div>
          <button className="carousel-btn next" onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1} aria-label="Trang tiếp theo">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>
    </section>
  );
}
