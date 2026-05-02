"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const EMPTY_FORM = {
  name: "",
  specialty: "",
  role: "Chuyên gia HDV Sinh Thái",
  rating: 5,
  image_url: "",
  zalo_number: "",
  is_active: true,
};

type FormData = typeof EMPTY_FORM;

export default function GuidesAdmin() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchGuides() {
    const { data } = await supabase.from("guides").select("*").order("created_at", { ascending: false });
    setGuides(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchGuides(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(guide: Guide) {
    setEditingId(guide.id);
    setForm({
      name: guide.name,
      specialty: guide.specialty,
      role: guide.role,
      rating: guide.rating,
      image_url: guide.image_url,
      zalo_number: guide.zalo_number ?? "",
      is_active: guide.is_active,
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Vui lòng nhập tên HDV."); return; }
    if (!form.image_url.trim()) { setError("Vui lòng nhập URL ảnh."); return; }
    setSaving(true);
    setError("");

    const payload = { ...form };

    if (editingId) {
      const { error: e } = await supabase.from("guides").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("guides").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }

    setSaving(false);
    closeModal();
    fetchGuides();
  }

  async function handleDelete(id: string) {
    await supabase.from("guides").delete().eq("id", id);
    setDeleteId(null);
    fetchGuides();
  }

  async function toggleActive(guide: Guide) {
    await supabase.from("guides").update({ is_active: !guide.is_active }).eq("id", guide.id);
    fetchGuides();
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Hướng Dẫn Viên</h1>
          <p className="admin-header-subtitle">Quản lý danh sách hướng dẫn viên</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Thêm HDV
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#265C59" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
          </div>
        ) : guides.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b8888", padding: "48px 0" }}>Chưa có hướng dẫn viên nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Chuyên môn</th>
                  <th>Zalo</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {guides.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <img
                        src={g.image_url || "https://via.placeholder.com/48"}
                        alt={g.name}
                        className="admin-img-avatar"
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td style={{ color: "#6b8888" }}>{g.specialty}</td>
                    <td>{g.zalo_number || <span style={{ color: "#bbb" }}>—</span>}</td>
                    <td>
                      <span style={{ color: "#E5A919", fontWeight: 700 }}>{g.rating}★</span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(g)}
                        className={`admin-badge ${g.is_active ? "admin-badge-success" : "admin-badge-danger"}`}
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {g.is_active ? "Đang hoạt động" : "Tạm ẩn"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(g)}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button className="admin-btn admin-btn-danger" onClick={() => setDeleteId(g.id)}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editingId ? "Chỉnh Sửa HDV" : "Thêm HDV Mới"}</h2>
              <button className="admin-modal-close" onClick={closeModal}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div className="admin-modal-body">
              {form.image_url && (
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <img src={form.image_url} alt="Preview" className="admin-img-preview" />
                </div>
              )}

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Tên HDV *</label>
                  <input
                    className="admin-form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Anh Minh"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Chuyên môn *</label>
                  <input
                    className="admin-form-input"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="HDV · Trekking & Sinh Thái"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Vai trò</label>
                  <input
                    className="admin-form-input"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Đánh giá (1–5)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    min={1} max={5} step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">URL Ảnh *</label>
                <input
                  className="admin-form-input"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Số Zalo</label>
                  <input
                    className="admin-form-input"
                    value={form.zalo_number}
                    onChange={(e) => setForm({ ...form, zalo_number: e.target.value })}
                    placeholder="0912345678"
                  />
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: "#265C59" }}
                    />
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>Hiển thị trên trang chủ</span>
                  </label>
                </div>
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: 13, background: "#fef2f2", padding: "10px 14px", borderRadius: 8, marginTop: 8 }}>
                  {error}
                </p>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Hủy</button>
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
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Xác nhận xóa</h2>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#4a6666" }}>Bạn có chắc muốn xóa hướng dẫn viên này? Thao tác này không thể hoàn tác.</p>
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
