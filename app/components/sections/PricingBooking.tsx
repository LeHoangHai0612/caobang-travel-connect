"use client";

import React from "react";
import type { Destination } from "@/lib/database.types";

interface PricingBookingProps {
  pricingBg: string;
  destinations: Destination[];
  openBooking: (packageType: string) => void;
}

export default function PricingBooking({ pricingBg, destinations, openBooking }: PricingBookingProps) {
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-heading"
      style={{ background: `linear-gradient(135deg,rgba(10,35,35,.90),rgba(26,60,55,.86),rgba(15,45,40,.90)),url('${pricingBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Bảng Giá Minh Bạch</span>
          <h2 className="section-title" id="pricing-heading">Bảng Giá Dịch Vụ HDV</h2>
          <p className="section-subtitle">Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn</p>
        </div>

        <div className="pricing-grid">
          {/* HDV Cá Nhân */}
          <article className="price-card fade-up">
            <h3>HDV Cá Nhân</h3>
            <p className="price-subtitle">Dành cho 1–2 người</p>
            <ul>
              {["HDV 1 cả ngày", "Lộ trình riêng", "Phiên dịch", "Cá nhân hóa", "Hỗ trợ 24/7"].map((item) => (
                <li key={item}><i className="fa-solid fa-check" /> {item}</li>
              ))}
            </ul>
            <button className="btn-price" onClick={() => openBooking("HDV Cá Nhân · 500.000đ / Ngày")} aria-label="Đặt gói HDV Cá Nhân">
              500.000đ / Ngày
            </button>
          </article>

          {/* HDV Đoàn */}
          <article className="price-card featured fade-up">
            <h3>HDV Đoàn</h3>
            <p className="price-subtitle">Dành cho 5–20 người</p>
            <ul>
              {["HDV 1 cả ngày", "HDV trưởng nhóm", "Lộ trình đoàn", "Xe riêng", "Hỗ trợ 24/7"].map((item) => (
                <li key={item}><i className="fa-solid fa-check" /> {item}</li>
              ))}
            </ul>
            <button className="btn-price" onClick={() => openBooking("HDV Đoàn · 650.000đ / Ngày")} aria-label="Đặt gói HDV Đoàn">
              650.000đ / Ngày
            </button>
          </article>

          {/* HDV Xe Máy */}
          <article className="price-card fade-up">
            <h3>HDV Xe Máy</h3>
            <p className="price-subtitle">Phượt cung đường đẹp</p>
            <ul>
              {["HDV 1 cả ngày", "Cho thuê xe máy", "HDV địa hình núi", "Bảo hiểm chuyến đi", "Hỗ trợ 24/7"].map((item) => (
                <li key={item}><i className="fa-solid fa-check" /> {item}</li>
              ))}
            </ul>
            <button className="btn-price" onClick={() => openBooking("HDV Xe Máy · 550.000đ / Ngày")} aria-label="Đặt gói HDV Xe Máy">
              550.000đ / Ngày
            </button>
          </article>

          {/* Tìm kiếm HDV */}
          <div className="search-card fade-up" role="search">
            <h3>Tìm Kiếm HDV</h3>
            <div className="form-group">
              <label htmlFor="tour-type">Loại Tour</label>
              <select id="tour-type" name="tour-type">
                <option value="">Tất cả loại tour</option>
                <option>Tour Sinh Thái</option>
                <option>Tour Văn Hóa</option>
                <option>Tour Lịch Sử</option>
                <option>Tour Phượt Xe Máy</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="destination-filter">Điểm Đến</label>
              <select id="destination-filter" name="destination">
                <option value="">Tất cả địa điểm</option>
                {destinations.map((d) => (
                  <option key={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="budget">Ngân Sách</label>
              <select id="budget" name="budget">
                <option value="">Tất cả mức giá</option>
                <option>Dưới 500.000đ</option>
                <option>500.000 – 700.000đ</option>
                <option>Trên 700.000đ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngôn Ngữ HDV</label>
              <div className="checkbox-group">
                <label><input type="checkbox" name="lang" value="vi" defaultChecked /> Tiếng Việt</label>
                <label><input type="checkbox" name="lang" value="en" /> Tiếng Anh</label>
              </div>
            </div>
            <button className="btn-search" type="button" onClick={() => openBooking("Tư vấn chọn HDV")}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Tìm Kiếm
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
