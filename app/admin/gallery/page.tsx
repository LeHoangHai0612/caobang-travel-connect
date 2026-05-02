"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GalleryImage } from "@/lib/database.types";

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [addUrl, setAddUrl] = useState("");
  const [addPreview, setAddPreview] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchImages() {
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order");
    setImages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchImages(); }, []);

  async function handleAdd() {
    const url = addUrl.trim();
    if (!url) return;
    setSaving(true);
    setMessage("");
    const maxOrder = images.reduce((m, img) => Math.max(m, img.sort_order), 0);
    const { error } = await supabase
      .from("gallery_images")
      .insert({ image_url: url, sort_order: maxOrder + 1 });
    if (error) {
      setMessage("Lỗi: " + error.message);
    } else {
      setAddUrl("");
      setAddPreview("");
      fetchImages();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("gallery_images").delete().eq("id", id);
    setDeleteId(null);
    fetchImages();
  }

  async function handleUrlChange(id: string, newUrl: string) {
    await supabase.from("gallery_images").update({ image_url: newUrl }).eq("id", id);
    fetchImages();
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const a = images[index];
    const b = images[index - 1];
    await Promise.all([
      supabase.from("gallery_images").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("gallery_images").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchImages();
  }

  async function moveDown(index: number) {
    if (index === images.length - 1) return;
    const a = images[index];
    const b = images[index + 1];
    await Promise.all([
      supabase.from("gallery_images").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("gallery_images").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchImages();
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Thư Viện Ảnh</h1>
          <p className="admin-header-subtitle">Quản lý ảnh hiển thị trên trang chủ</p>
        </div>
        <span style={{ color: "#6b8888", fontSize: 14, fontWeight: 600 }}>
          {images.length} ảnh
        </span>
      </div>

      {/* Add new image */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1a2e2e", marginBottom: 16 }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8, color: "#265C59" }} />
          Thêm Ảnh Mới
        </h2>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              className="admin-form-input"
              value={addUrl}
              onChange={(e) => { setAddUrl(e.target.value); setAddPreview(e.target.value.trim()); }}
              placeholder="Dán URL ảnh vào đây..."
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          {addPreview && (
            <img
              src={addPreview}
              alt="Preview"
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: "2px solid #e0e0e0" }}
              onError={() => setAddPreview("")}
            />
          )}
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleAdd}
            disabled={saving || !addUrl.trim()}
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-plus" />}
            Thêm ảnh
          </button>
        </div>
        {message && (
          <p style={{ marginTop: 10, color: "#dc2626", fontSize: 13 }}>{message}</p>
        )}
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : images.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b8888", padding: "48px 0" }}>Chưa có ảnh nào.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {images.map((img, index) => (
            <div key={img.id} className="admin-card" style={{ padding: 16 }}>
              <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", borderRadius: 12, marginBottom: 12, background: "#f4f6f8" }}>
                <img
                  src={img.image_url}
                  alt={`Ảnh ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Lỗi+ảnh"; }}
                />
                <span style={{
                  position: "absolute", top: 8, left: 8,
                  background: "rgba(0,0,0,.55)", color: "#fff",
                  fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                }}>
                  #{index + 1}
                </span>
              </div>

              <EditableUrl
                value={img.image_url}
                onSave={(url) => handleUrlChange(img.id, url)}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Lên"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <i className="fa-solid fa-arrow-up" />
                </button>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => moveDown(index)}
                  disabled={index === images.length - 1}
                  title="Xuống"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <i className="fa-solid fa-arrow-down" />
                </button>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => setDeleteId(img.id)}
                  title="Xóa"
                  style={{ flex: 1, justifyContent: "center" }}
                >
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
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Xác nhận xóa ảnh</h2>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: "#4a6666" }}>Bạn có chắc muốn xóa ảnh này? Thao tác này không thể hoàn tác.</p>
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

function EditableUrl({ value, onSave }: { value: string; onSave: (url: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        style={{
          width: "100%", textAlign: "left", background: "#f4f6f8",
          border: "1px dashed #d0d0d0", borderRadius: 8, padding: "6px 10px",
          fontSize: 12, color: "#6b8888", cursor: "pointer", overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
        title="Nhấn để sửa URL"
      >
        <i className="fa-solid fa-link" style={{ marginRight: 6 }} />
        {value}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <input
        className="admin-form-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        style={{ fontSize: 12, padding: "6px 10px" }}
        autoFocus
      />
      <button
        className="admin-btn admin-btn-primary"
        onClick={() => { onSave(draft); setEditing(false); }}
        style={{ flexShrink: 0 }}
      >
        <i className="fa-solid fa-check" />
      </button>
      <button
        className="admin-btn admin-btn-secondary"
        onClick={() => setEditing(false)}
        style={{ flexShrink: 0 }}
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}
