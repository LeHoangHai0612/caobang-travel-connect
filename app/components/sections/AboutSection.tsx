"use client";

import React from "react";

interface AboutSectionProps {
  aboutImage: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

export default function AboutSection({ aboutImage, scrollToSection }: AboutSectionProps) {
  return (
    <section style={{ background: "#f0ede4", position: "relative", zIndex: 1, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(180,160,120,.04) 28px,rgba(180,160,120,.04) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(180,160,120,.03) 28px,rgba(180,160,120,.03) 29px)", pointerEvents: "none" }} />

      <div className="container about-grid">
        <div>
          <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#6b8f5e", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 32, height: 2, background: "#6b8f5e", borderRadius: 2 }} />
            Khám Phá Cao Bằng
          </p>

          <h2 style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, fontStyle: "italic", lineHeight: 1.38, marginBottom: 28, color: "#1a3a18" }}>
            Cao Bằng — vùng đất biên cương hùng vĩ phương Bắc,{" "}
            <span style={{ opacity: .38, fontWeight: 400 }}>nơi thiên nhiên hoang sơ và văn hóa dân tộc hòa quyện thành những hành trình không thể quên.</span>
          </h2>

          <p style={{ fontSize: ".95rem", color: "#3d3d2d", lineHeight: 1.88, marginBottom: 18 }}>
            Nằm ở cực Đông Bắc Việt Nam, Cao Bằng là vùng đất của những thác nước hùng vĩ, hang động kỳ bí và bản làng dân tộc còn nguyên vẹn nét đẹp ngàn đời.{" "}
            <strong style={{ color: "#2d5a27" }}>Thác Bản Giốc</strong> — một trong những thác nước đẹp nhất Đông Nam Á,{" "}
            <strong style={{ color: "#2d5a27" }}>Động Ngườm Ngao</strong>,{" "}
            <strong style={{ color: "#2d5a27" }}>hồ Thang Hen</strong>... mỗi địa danh là một trang thơ của tạo hóa.
          </p>

          <p style={{ fontSize: ".95rem", color: "#3d3d2d", lineHeight: 1.88, marginBottom: 44 }}>
            Không chỉ là thiên nhiên, Cao Bằng còn là cái nôi lịch sử với{" "}
            <strong style={{ color: "#2d5a27" }}>di tích Pác Bó</strong> thiêng liêng. Văn hóa Tày, Nùng đặc sắc cùng ẩm thực độc đáo — phở chua, bánh coóng phù, hạt dẻ Trùng Khánh — tạo nên hành trình đa chiều, sâu sắc và đầy cảm xúc.
          </p>

          <a href="#destinations" onClick={e => scrollToSection(e, "destinations")}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#2d5a27", color: "white", padding: "14px 32px", borderRadius: 4, fontWeight: 700, fontSize: ".86rem", letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1e3e1a"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#2d5a27"}>
            Khám Phá Ngay <i className="fa-solid fa-arrow-right" />
          </a>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative", transform: "rotate(3deg)", transition: "transform .4s ease" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.02)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "rotate(3deg)"}>
            <div style={{ position: "absolute", top: -28, right: 36, fontSize: "2.2rem", transform: "rotate(-12deg)", userSelect: "none", zIndex: 2, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.2))" }}>📎</div>
            <div style={{ background: "white", padding: "12px 12px 56px", boxShadow: "0 10px 40px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)", maxWidth: 400 }}>
              <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", background: "#d4c9aa" }}>
                {aboutImage
                  ? <img src={aboutImage} alt="Cao Bằng Travel Team" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#9a8a6a" }}>
                      <i className="fa-solid fa-camera" style={{ fontSize: 36 }} />
                      <span style={{ fontSize: ".82rem", fontWeight: 600 }}>Thêm ảnh từ Admin → Cài Đặt</span>
                    </div>
                }
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 8, paddingTop: 4, borderTop: "1px solid #f0f0f0" }}>
                <i className="fa-solid fa-heart" style={{ color: "#e33", fontSize: "1.15rem" }} />
                <i className="fa-regular fa-comment" style={{ color: "#444", fontSize: "1rem" }} />
                <i className="fa-regular fa-paper-plane" style={{ color: "#444", fontSize: "1rem" }} />
                <span style={{ marginLeft: "auto", fontSize: ".7rem", color: "#999", fontWeight: 600 }}>#caobangtravel</span>
              </div>
              <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.5rem", fontWeight: 700, color: "#2d5a27", margin: 0, lineHeight: 1.15 }}>
                Cao Bằng Travel Team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(45,90,39,.12)", marginTop: 0 }}>
        <div className="about-marquee-track">
          {[0, 1].map(i => (
            <span key={i} className="about-marquee-text">
              Chuyên Nghiệp · Am Hiểu · Tận Tâm · Hành Trình Trọn Vẹn ·&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
