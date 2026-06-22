"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_location: string;
  stars: number;
  review_text: string;
  avatar_url: string;
  is_approved: boolean;
  created_at: string;
}

const FILTER_OPTS = [
  { label: "Tất cả",       value: "all"      },
  { label: "Chờ duyệt",   value: "pending"  },
  { label: "Đã duyệt",    value: "approved" },
];

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- cap nhat state co chu dich khi tai du lieu / khoi tao
  useEffect(() => { fetchReviews(); }, []);

  async function approve(id: string) {
    await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    fetchReviews();
  }

  async function reject(id: string) {
    await supabase.from("reviews").update({ is_approved: false }).eq("id", id);
    fetchReviews();
  }

  async function handleDelete(id: string) {
    await supabase.from("reviews").delete().eq("id", id);
    setDeleteId(null);
    fetchReviews();
  }

  const displayed = reviews.filter((r) =>
    filter === "all"     ? true :
    filter === "approved" ? r.is_approved :
    !r.is_approved
  );

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter((r) => !r.is_approved).length,
    approved: reviews.filter((r) => r.is_approved).length,
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Đánh Giá</h1>
          <p className="admin-header-subtitle">Duyệt và quản lý đánh giá từ khách hàng</p>
        </div>
        {counts.pending > 0 && (
          <span className="admin-badge admin-badge-warning" style={{ fontSize: ".8rem", padding: "6px 14px" }}>
            <i className="fa-solid fa-clock" style={{ marginRight: 5 }} />
            {counts.pending} chờ duyệt
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {FILTER_OPTS.map((opt) => (
          <button key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "1.5px solid",
              borderColor: filter === opt.value ? "#265C59" : "#e2e8f0",
              background: filter === opt.value ? "#265C59" : "white",
              color: filter === opt.value ? "white" : "#475569",
              fontFamily: "inherit", fontSize: ".81rem", fontWeight: 700, cursor: "pointer",
            }}>
            {opt.label}
            <span style={{ marginLeft: 7, background: filter === opt.value ? "rgba(255,255,255,.25)" : "#f1f5f9", padding: "1px 7px", borderRadius: 20, fontSize: ".74rem" }}>
              {counts[opt.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <i className="fa-solid fa-star" style={{ fontSize: 32, marginBottom: 12, display: "block" }} />
          <p>Không có đánh giá nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayed.map((r) => (
            <div key={r.id} className="admin-card" style={{
              display: "flex", gap: 18, alignItems: "flex-start",
              borderLeft: `4px solid ${r.is_approved ? "#22c55e" : "#f59e0b"}`,
              padding: "18px 20px",
            }}>
              {/* Avatar */}
              <img src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.reviewer_name)}&background=265C59&color=fff&size=48`}
                alt={r.reviewer_name}
                style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <strong style={{ fontSize: ".9rem", color: "#0f172a" }}>{r.reviewer_name}</strong>
                  {r.reviewer_location && <span style={{ fontSize: ".78rem", color: "#94a3b8" }}>{r.reviewer_location}</span>}
                  <span style={{ color: "#E5A919", fontSize: ".82rem" }}>
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </span>
                  <span className={`admin-badge ${r.is_approved ? "admin-badge-success" : "admin-badge-warning"}`}>
                    {r.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                  <span style={{ fontSize: ".74rem", color: "#94a3b8", marginLeft: "auto" }}>
                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p style={{ fontSize: ".85rem", color: "#334155", lineHeight: 1.7, margin: 0 }}>{r.review_text}</p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!r.is_approved
                  ? <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => approve(r.id)}>
                      <i className="fa-solid fa-check" /> Duyệt
                    </button>
                  : <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => reject(r.id)}>
                      <i className="fa-solid fa-eye-slash" /> Ẩn
                    </button>}
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteId(r.id)}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Xác nhận xóa</h2>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#4a6666" }}>Xóa đánh giá này? Thao tác không thể hoàn tác.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>
                <i className="fa-solid fa-trash" /> Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
