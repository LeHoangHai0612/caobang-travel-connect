"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Destination } from "@/lib/database.types";

const EMPTY: Omit<Destination, "id" | "created_at"> = {
  title: "",
  description: "",
  image_url: "",
  sort_order: 1,
};

export default function DestinationsAdmin() {
  const [items, setItems]       = useState<Destination[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [preview, setPreview]   = useState("");

  async function fetchItems() {
    const { data } = await supabase.from("destinations").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  function openAdd() {
    setEditingId(null);
    const maxOrder = items.reduce((m, d) => Math.max(m, d.sort_order), 0);
    setForm({ ...EMPTY, sort_order: maxOrder + 1 });
    setPreview("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(dest: Destination) {
    setEditingId(dest.id);
    setForm({ title: dest.title, description: dest.description, image_url: dest.image_url, sort_order: dest.sort_order });
    setPreview(dest.image_url);
    setError("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim())     { setError("Vui lòng nhập tiêu đề."); return; }
    if (!form.image_url.trim()) { setError("Vui lòng nhập URL ảnh."); return; }
    setSaving(true); setError("");

    if (editingId) {
      const { error: e } = await supabase.from("destinations").update(form).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("destinations").insert(form);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false);
    setModalOpen(false);
    fetchItems();
  }

  async function handleDelete(id: string) {
    await supabase.from("destinations").delete().eq("id", id);
    setDeleteId(null);
    fetchItems();
  }

  async function moveOrder(dest: Destination, dir: -1 | 1) {
    const neighbor = items.find((d) => d.sort_order === dest.sort_order + dir);
    if (!neighbor) return;
    await Promise.all([
      supabase.from("destinations").update({ sort_order: neighbor.sort_order }).eq("id", dest.id),
      supabase.from("destinations").update({ sort_order: dest.sort_order }).eq("id", neighbor.id),
    ]);
    fetchItems();
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Điểm Đến</h1>
          <p className="admin-header-subtitle">Quản lý các điểm tham quan hiển thị trên trang chủ</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Thêm điểm đến
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {items.map((dest, idx) => (
            <div key={dest.id} className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Image */}
              <div style={{ position: "relative", height: 160, background: "#f1f5f9", overflow: "hidden" }}>
                {dest.image_url ? (
                  <img src={dest.image_url} alt={dest.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    <i className="fa-solid fa-image" style={{ fontSize: 28 }} />
                  </div>
                )}
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.55)", color: "white", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  #{dest.sort_order}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: "14px 16px 16px" }}>
                <h3 style={{ fontWeight: 800, fontSize: ".9rem", color: "#0f172a", marginBottom: 6 }}>{dest.title}</h3>
                <p style={{ fontSize: ".78rem", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {dest.description}
                </p>

                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => moveOrder(dest, -1)} disabled={idx === 0} title="Lên">
                    <i className="fa-solid fa-arrow-up" />
                  </button>
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => moveOrder(dest, 1)} disabled={idx === items.length - 1} title="Xuống">
                    <i className="fa-solid fa-arrow-down" />
                  </button>
                  <div style={{ flex: 1 }} />
                  <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(dest)}>
                    <i className="fa-solid fa-pen" /> Sửa
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteId(dest.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
              <i className="fa-solid fa-map-location-dot" style={{ fontSize: 32, marginBottom: 12, display: "block" }} />
              <p>Chưa có điểm đến nào.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editingId ? "Chỉnh Sửa Điểm Đến" : "Thêm Điểm Đến Mới"}</h2>
              <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Preview */}
              {preview && (
                <img src={preview} alt="Preview"
                  style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e2e8f0" }}
                  onError={() => setPreview("")} />
              )}

              <div className="admin-form-group">
                <label className="admin-form-label">Tiêu đề *</label>
                <input className="admin-form-input" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Thác Bản Giốc" />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả</label>
                <textarea className="admin-form-input" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn về điểm đến..."
                  style={{ resize: "vertical", fontFamily: "inherit" }} />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">URL Ảnh *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="admin-form-input" value={form.image_url}
                    onChange={(e) => { setForm({ ...form, image_url: e.target.value }); }}
                    placeholder="https://..." style={{ flex: 1 }} />
                  <button className="admin-btn admin-btn-secondary" onClick={() => setPreview(form.image_url)}>
                    <i className="fa-solid fa-eye" />
                  </button>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Thứ tự hiển thị</label>
                <input className="admin-form-input" type="number" min={1} value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 1 })}
                  style={{ maxWidth: 120 }} />
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: ".82rem", background: "#fef2f2", padding: "10px 14px", borderRadius: 8 }}>
                  {error}
                </p>
              )}
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

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Xác nhận xóa</h2>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#4a6666", fontSize: ".88rem" }}>Bạn có chắc muốn xóa điểm đến này? Thao tác không thể hoàn tác.</p>
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
