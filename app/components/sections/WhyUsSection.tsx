"use client";

import React from "react";

interface WhyUsSectionProps {
  whyusBg: string;
}

export default function WhyUsSection({ whyusBg }: WhyUsSectionProps) {
  return (
    <section className="why-us" id="why-us" aria-labelledby="why-heading"
      style={{ background: `linear-gradient(rgba(237,231,218,.90),rgba(237,231,218,.90)),url('${whyusBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Vì Sao Chọn Chúng Tôi</span>
          <h2 className="section-title" id="why-heading">Tại Sao Chọn Chúng Tôi?</h2>
          <p className="section-subtitle">Chúng tôi cung cấp những trải nghiệm du lịch sinh thái độc đáo và chân thực nhất tại Cao Bằng</p>
        </div>
        <div className="features-grid">
          {[
            { icon: "fa-map-pin",  title: "Kiến Thức Bản Địa Điểm", desc: "Hướng dẫn viên sinh ra và lớn lên tại Cao Bằng, am hiểu sâu về văn hóa, lịch sử và địa hình từng điểm đến bản địa." },
            { icon: "fa-route",    title: "Lộ Trình Thiết Kế Riêng", desc: "Mỗi chuyến đi được cá nhân hóa theo sở thích và nhu cầu của từng đoàn khách, đảm bảo trải nghiệm tốt nhất." },
            { icon: "fa-headset",  title: "Hỗ Trợ 24/7",             desc: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc và đảm bảo an toàn cho du khách trên toàn bộ hành trình." },
          ].map(({ icon, title, desc }) => (
            <article key={title} className="feature-card fade-up">
              <div className="feature-icon" aria-hidden="true"><i className={`fa-solid ${icon}`} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
