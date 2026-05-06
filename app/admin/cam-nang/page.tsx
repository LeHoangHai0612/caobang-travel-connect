"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tip {
  id: string;
  icon: string;
  tag: string;
  color: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY: Omit<Tip, "id"> = {
  icon: "fa-lightbulb", tag: "Mẹo Hay", color: "#265C59",
  title: "", description: "", sort_order: 0, is_active: true,
  image_url: "", content: "",
};

const COLOR_PRESETS = ["#f59e0b","#ef4444","#8b5cf6","#06b6d4","#10b981","#f97316","#265C59","#3b82f6","#ec4899"];

export default function CamNangAdmin() {
  const [tips, setTips]       = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState<Omit<Tip,"id"> & { id?: string }>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [delId, setDelId]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("cam_nang_tips").select("*").order("sort_order").order("created_at");
    setTips(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = (t: Tip) => { setForm(t); setModal(true); };
  const closeModal = () => { setModal(false); };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    if (form.id) {
      await supabase.from("cam_nang_tips").update({ ...form }).eq("id", form.id);
    } else {
      await supabase.from("cam_nang_tips").insert({ ...form });
    }
    setSaving(false);
    setModal(false);
    load();
  };

  const toggleActive = async (t: Tip) => {
    await supabase.from("cam_nang_tips").update({ is_active: !t.is_active }).eq("id", t.id);
    setTips(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x));
  };

  const handleDelete = async () => {
    if (!delId) return;
    await supabase.from("cam_nang_tips").delete().eq("id", delId);
    setDelId(null);
    load();
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Cẩm Nang Du Lịch</h1>
          <p className="admin-header-subtitle">Quản lý các mẹo và bí quyết du lịch Cao Bằng</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>
          <i className="fa-solid fa-plus" /> Thêm Mục Mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 18 }}>
          {tips.map(t => (
            <div key={t.id} className="admin-card" style={{ padding: 0, overflow: "hidden", opacity: t.is_active ? 1 : .55 }}>
              {/* Header màu */}
              <div style={{ background: t.color + "18", borderBottom: `3px solid ${t.color}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 16 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: ".68rem", fontWeight: 700, color: t.color, textTransform: "uppercase", letterSpacing: ".08em" }}>{t.tag}</span>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: ".9rem", color: "#0f172a" }}>{t.title}</p>
                </div>
                <span style={{ fontSize: ".7rem", fontWeight: 700, color: "#94a3b8" }}>#{t.sort_order}</span>
              </div>
              {/* Body */}
              <div style={{ padding: "14px 18px" }}>
                <p style={{ fontSize: ".82rem", color: "#64748b", lineHeight: 1.6, margin: "0 0 14px" }}>{t.description}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="admin-btn admin-btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: ".78rem" }} onClick={() => openEdit(t)}>
                    <i className="fa-solid fa-pen" /> Sửa
                  </button>
                  <button className="admin-btn" onClick={() => toggleActive(t)}
                    style={{ flex: 1, justifyContent: "center", fontSize: ".78rem", background: t.is_active ? "#dcfce7" : "#f1f5f9", color: t.is_active ? "#16a34a" : "#64748b", border: "none" }}>
                    <i className={`fa-solid ${t.is_active ? "fa-eye" : "fa-eye-slash"}`} />
                    {t.is_active ? "Hiện" : "Ẩn"}
                  </button>
                  <button className="admin-btn admin-btn-danger" style={{ justifyContent: "center", fontSize: ".78rem", padding: "0 12px" }} onClick={() => setDelId(t.id)}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{form.id ? "Sửa Mục Cẩm Nang" : "Thêm Mục Mới"}</h3>
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="admin-form-label">Tag danh mục</label>
                  <input className="admin-form-input" value={form.tag} onChange={e => set("tag", e.target.value)} placeholder="Ẩm Thực, Di Chuyển..." />
                </div>
                <div>
                  <label className="admin-form-label">Icon (Font Awesome)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="admin-form-input" value={form.icon} onChange={e => set("icon", e.target.value)} placeholder="fa-bowl-food" style={{ flex: 1 }} />
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: form.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa-solid ${form.icon}`} style={{ color: form.color }} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="admin-form-label">Màu sắc</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_PRESETS.map(c => (
                    <button key={c} onClick={() => set("color", c)}
                      style={{ width: 28, height: 28, borderRadius: 8, background: c, border: form.color === c ? "3px solid #0f172a" : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                  <input type="color" value={form.color} onChange={e => set("color", e.target.value)}
                    style={{ width: 28, height: 28, border: "none", borderRadius: 8, cursor: "pointer", padding: 0 }} />
                </div>
              </div>

              <div>
                <label className="admin-form-label">Tiêu đề *</label>
                <input className="admin-form-input" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Mùa Đẹp Nhất để Đến Cao Bằng" />
              </div>

              <div>
                <label className="admin-form-label">Mô tả ngắn * (hiển thị trên thẻ)</label>
                <textarea className="admin-form-input" value={form.description} onChange={e => set("description", e.target.value)}
                  rows={2} placeholder="Tóm tắt ngắn gọn..." style={{ resize: "vertical" }} />
              </div>

              <div>
                <label className="admin-form-label">Ảnh bìa bài viết (URL)</label>
                <input className="admin-form-input" value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://images.unsplash.com/..." />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" onError={e => (e.currentTarget.style.display = "none")}
                    style={{ marginTop: 8, width: "100%", height: 120, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                )}
              </div>

              <div>
                <label className="admin-form-label">Nội dung đầy đủ (xuống dòng = đoạn mới)</label>
                <textarea className="admin-form-input" value={form.content} onChange={e => set("content", e.target.value)}
                  rows={6} placeholder="Viết nội dung chi tiết cho bài cẩm nang. Xuống dòng để tạo đoạn mới..." style={{ resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="admin-form-label">Thứ tự hiển thị</label>
                  <input type="number" className="admin-form-input" value={form.sort_order}
                    onChange={e => set("sort_order", parseInt(e.target.value) || 0)} min={0} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".84rem", fontWeight: 600, color: "#374151" }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#265C59" }} />
                    Hiển thị trên website
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving || !form.title || !form.description}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Đang lưu...</> : <><i className="fa-solid fa-floppy-disk" /> Lưu</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá */}
      {delId && (
        <div className="admin-modal-overlay" onClick={() => setDelId(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Xác Nhận Xoá</h3>
              <button className="admin-btn admin-btn-secondary" onClick={() => setDelId(null)}><i className="fa-solid fa-xmark" /></button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: ".88rem", color: "#64748b" }}>Mục này sẽ bị xoá vĩnh viễn. Bạn có chắc không?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDelId(null)}>Hủy</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}><i className="fa-solid fa-trash" /> Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
