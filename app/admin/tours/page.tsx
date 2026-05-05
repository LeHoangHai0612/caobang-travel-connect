"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tour {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_from: number;
  duration: string;
  group_size: string;
  highlights: string;
  included: string;
  guide_count: number;
  zalo_number: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Omit<Tour, "id"> = {
  title: "", description: "", image_url: "", price_from: 0,
  duration: "1 ngày", group_size: "1-10 người",
  highlights: "", included: "", guide_count: 1,
  zalo_number: "", is_active: true, sort_order: 0,
};

export default function AdminTours() {
  const [tours, setTours]       = useState<Tour[]>([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState<Omit<Tour, "id">>(EMPTY);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("tours").select("*").order("sort_order");
    setTours(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditId(null); setForm(EMPTY); setError(""); setModalOpen(true); }
  function openEdit(t: Tour) {
    setEditId(t.id);
    setForm({ title: t.title, description: t.description, image_url: t.image_url, price_from: t.price_from, duration: t.duration, group_size: t.group_size, highlights: t.highlights, included: t.included, guide_count: t.guide_count, zalo_number: t.zalo_number, is_active: t.is_active, sort_order: t.sort_order });
    setError(""); setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Vui lòng nhập tên tour."); return; }
    setSaving(true); setError("");
    if (editId) {
      const { error: e } = await supabase.from("tours").update(form).eq("id", editId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("tours").insert(form);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false); setModalOpen(false); load();
  }

  async function handleDelete(id: string) {
    await supabase.from("tours").delete().eq("id", id);
    setDeleteId(null); load();
  }

  async function toggleActive(t: Tour) {
    await supabase.from("tours").update({ is_active: !t.is_active }).eq("id", t.id);
    load();
  }

  const f = (k: keyof typeof EMPTY, v: string | number | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Quản Lý Tours</h1>
          <p className="admin-header-subtitle">Thêm, sửa và quản lý các gói tour du lịch</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Thêm Tour
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tours.map((t) => (
            <div key={t.id} className="admin-card" style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 20px" }}>
              {t.image_url && (
                <img src={t.image_url} alt={t.title} style={{ width: 90, height: 66, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: "#0f172a", fontSize: ".92rem" }}>{t.title}</span>
                  <span className={`admin-badge ${t.is_active ? "admin-badge-success" : "admin-badge-danger"}`}>{t.is_active ? "Hiển thị" : "Ẩn"}</span>
                  {t.price_from > 0 && <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "2px 8px", fontSize: ".72rem", fontWeight: 700 }}>Từ {t.price_from.toLocaleString()}đ</span>}
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: ".75rem", color: "#64748b", marginBottom: 5 }}>
                  <span><i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{t.duration}</span>
                  <span><i className="fa-solid fa-users" style={{ marginRight: 4 }} />{t.group_size}</span>
                  <span><i className="fa-solid fa-person-hiking" style={{ marginRight: 4 }} />{t.guide_count} HDV</span>
                </div>
                <p style={{ color: "#64748b", fontSize: ".8rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <a href={`/tour/${t.id}`} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary" style={{ padding: "6px 10px" }} title="Xem tour">
                  <i className="fa-solid fa-eye" />
                </a>
                <button className="admin-btn admin-btn-secondary" onClick={() => toggleActive(t)} title={t.is_active ? "Ẩn" : "Hiện"} style={{ padding: "6px 10px" }}>
                  <i className={`fa-solid ${t.is_active ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(t)}><i className="fa-solid fa-pen" /></button>
                <button className="admin-btn admin-btn-danger" onClick={() => setDeleteId(t.id)}><i className="fa-solid fa-trash" /></button>
              </div>
            </div>
          ))}
          {tours.length === 0 && (
            <div className="admin-card" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              <i className="fa-solid fa-map" style={{ fontSize: 32, marginBottom: 10, display: "block" }} />
              <p style={{ fontWeight: 600 }}>Chưa có tour nào. Chạy update_v16.sql để thêm dữ liệu mẫu.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editId ? "Sửa Tour" : "Thêm Tour Mới"}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Tên tour *</label>
                  <input className="admin-form-input" value={form.title} onChange={(e) => f("title", e.target.value)} placeholder="VD: Thác Bản Giốc 1 Ngày" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Giá từ (VND, 0 = Liên hệ)</label>
                  <input className="admin-form-input" type="number" min={0} value={form.price_from} onChange={(e) => f("price_from", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL Ảnh</label>
                <input className="admin-form-input" value={form.image_url} onChange={(e) => f("image_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả</label>
                <textarea className="admin-form-input" rows={3} value={form.description} onChange={(e) => f("description", e.target.value)} style={{ resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Thời gian</label>
                  <input className="admin-form-input" value={form.duration} onChange={(e) => f("duration", e.target.value)} placeholder="1 ngày" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Quy mô nhóm</label>
                  <input className="admin-form-input" value={form.group_size} onChange={(e) => f("group_size", e.target.value)} placeholder="1-10 người" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Số lượng HDV</label>
                  <input className="admin-form-input" type="number" min={1} value={form.guide_count} onChange={(e) => f("guide_count", parseInt(e.target.value) || 1)} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Số Zalo liên hệ</label>
                  <input className="admin-form-input" value={form.zalo_number} onChange={(e) => f("zalo_number", e.target.value)} placeholder="0912345678" />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Điểm nổi bật (phân cách bằng |)</label>
                <input className="admin-form-input" value={form.highlights} onChange={(e) => f("highlights", e.target.value)} placeholder="Thác Bản Giốc|Động Ngườm Ngao|Ẩm thực địa phương" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Dịch vụ bao gồm (phân cách bằng |)</label>
                <input className="admin-form-input" value={form.included} onChange={(e) => f("included", e.target.value)} placeholder="HDV chuyên nghiệp|Xe đưa đón|Vé tham quan" />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Thứ tự hiển thị</label>
                  <input className="admin-form-input" type="number" min={0} value={form.sort_order} onChange={(e) => f("sort_order", parseInt(e.target.value) || 0)} />
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingBottom: 10 }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => f("is_active", e.target.checked)} style={{ width: 18, height: 18, accentColor: "#265C59" }} />
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>Hiển thị trên trang chủ</span>
                  </label>
                </div>
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: 13, background: "#fef2f2", padding: "10px 14px", borderRadius: 8 }}>{error}</p>}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk" /> Lưu</>}
              </button>
            </div>
          </div>
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
            <div className="admin-modal-body"><p style={{ color: "#4a6666" }}>Xóa tour này? Thao tác không thể hoàn tác.</p></div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>Hủy</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}><i className="fa-solid fa-trash" /> Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
