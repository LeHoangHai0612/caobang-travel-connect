"use client";

import React from "react";

interface CamNangSectionProps {
  camNangBg: string;
  camNangFromDB: boolean;
  camNangTips: any[];
}

export default function CamNangSection({ camNangBg, camNangFromDB, camNangTips }: CamNangSectionProps) {
  const tips = camNangFromDB ? camNangTips : [
    { id:"1", icon:"fa-calendar-sun",       tag:"Thời Điểm", color:"#f59e0b", title:"Mùa Đẹp Nhất",            description:"Tháng 9–11: lúa chín vàng, thác đầy nước, thời tiết mát mẻ. Tháng 3–4: hoa tam giác mạch nở rộ trên các sườn núi.", sort_order:1 },
    { id:"2", icon:"fa-bowl-food",          tag:"Ẩm Thực",   color:"#ef4444", title:"Đặc Sản Không Thể Bỏ Qua",description:"Bánh coóng phù, phở chua, lợn quay lá mắc mật, hạt dẻ Trùng Khánh — hương vị đặc trưng chỉ có ở Cao Bằng.",        sort_order:2 },
    { id:"3", icon:"fa-motorcycle",         tag:"Di Chuyển", color:"#8b5cf6", title:"Phương Tiện Phù Hợp",      description:"Xe máy là lựa chọn tốt nhất. Đường đèo quanh co nhưng cảnh đẹp hùng vĩ — thuê xe tại thị xã hoặc đi cùng HDV.",   sort_order:3 },
    { id:"4", icon:"fa-camera-retro",       tag:"Nhiếp Ảnh", color:"#06b6d4", title:"Góc Chụp Ảnh Đẹp Nhất",   description:"Cầu treo Bản Giốc, thuyền trên sông Quây Sơn, ruộng bậc thang Phia Oắc — ánh sáng buổi sáng sớm là lý tưởng nhất.", sort_order:4 },
    { id:"5", icon:"fa-hand-holding-heart", tag:"Văn Hóa",   color:"#10b981", title:"Tôn Trọng Phong Tục",      description:"Dân tộc Tày, Nùng chiếm đa số. Hỏi phép trước khi chụp ảnh, tìm hiểu phong tục trước khi đến thăm bản làng.",      sort_order:5 },
    { id:"6", icon:"fa-shield-halved",      tag:"An Toàn",   color:"#f97316", title:"Lưu Ý Quan Trọng",         description:"Mang theo thuốc chống muỗi, kem chống nắng và giày trekking chắc chắn. Đặt HDV địa phương để đảm bảo an toàn tối đa.", sort_order:6 },
  ];

  return (
    <section className="cam-nang" id="cam-nang" aria-labelledby="cam-nang-heading"
      style={{ background: `linear-gradient(rgba(14,42,40,.82),rgba(14,42,40,.78)),url('${camNangBg}') center/cover no-repeat` }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag" style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.9)", border: "1px solid rgba(255,255,255,.22)" }}>Cẩm Nang Du Lịch</span>
          <h2 className="section-title" id="cam-nang-heading" style={{ color: "white" }}>Bí Quyết Khám Phá Cao Bằng</h2>
          <p className="section-subtitle" style={{ color: "rgba(255,255,255,.72)" }}>Những điều bạn cần biết để có chuyến đi trọn vẹn và an toàn</p>
        </div>
        <div className="cam-nang-grid">
          {tips.map(({ id, icon, tag, color, title, description }) => {
            const cardInner = (
              <>
                <div className="cam-nang-card-top">
                  <span className="cam-nang-tag" style={{ background: color + "22", color }}>{tag}</span>
                  <div className="cam-nang-icon" style={{ background: color + "18" }}>
                    <i className={`fa-solid ${icon}`} style={{ color }} />
                  </div>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                {camNangFromDB && (
                  <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color, fontSize: ".78rem", fontWeight: 700 }}>
                    Đọc thêm <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} />
                  </div>
                )}
              </>
            );
            return camNangFromDB
              ? <a key={id} href={`/cam-nang/${id}`} className="cam-nang-card fade-up" style={{ textDecoration: "none", display: "block" }}>{cardInner}</a>
              : <article key={id} className="cam-nang-card fade-up">{cardInner}</article>;
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <a href="/cam-nang" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 50, border: "2px solid rgba(255,255,255,.5)", color: "white", fontWeight: 700, fontSize: ".84rem", textDecoration: "none", backdropFilter: "blur(6px)", background: "rgba(255,255,255,.1)", letterSpacing: ".04em" }}>
            <i className="fa-solid fa-book-open" /> Xem Tất Cả Cẩm Nang <i className="fa-solid fa-arrow-right" />
          </a>
        </div>
      </div>
    </section>
  );
}
