"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Setting {
  key: string;
  label: string;
  value: string;
}

function ImageSlot({
  setting,
  onSaved,
}: {
  setting: Setting;
  onSaved: (key: string, value: string) => void;
}) {
  const [url, setUrl] = useState(setting.value);
  const [preview, setPreview] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handlePreview = () => {
    setPreview(url.trim());
    setImgError(false);
  };

  const handleSave = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: trimmed })
      .eq("key", setting.key);
    setSaving(false);
    if (!error) {
      setSaved(true);
      onSaved(setting.key, trimmed);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Image preview */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/7", background: "#1a2e2e", overflow: "hidden" }}>
        {preview && !imgError ? (
          <img
            src={preview}
            alt={setting.label}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,.3)" }}>
            <i className="fa-solid fa-image" style={{ fontSize: 36 }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {imgError ? "URL ảnh không hợp lệ" : "Chưa có ảnh"}
            </span>
          </div>
        )}

        {/* Label overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,.65))",
          padding: "24px 20px 14px",
        }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: ".9rem" }}>{setting.label}</span>
          <span style={{ display: "block", color: "rgba(255,255,255,.6)", fontSize: ".75rem", marginTop: 2 }}>
            key: <code style={{ background: "rgba(255,255,255,.12)", padding: "1px 6px", borderRadius: 4 }}>{setting.key}</code>
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: "#6b8888", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            URL ảnh mới
          </label>
          <input
            className="admin-form-input"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setImgError(false); }}
            placeholder="https://..."
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={handlePreview}
            disabled={!url.trim() || url === preview}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <i className="fa-solid fa-eye" /> Xem trước
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving || !url.trim()}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {saving ? (
              <><i className="fa-solid fa-spinner fa-spin" /> Đang lưu...</>
            ) : saved ? (
              <><i className="fa-solid fa-circle-check" /> Đã lưu!</>
            ) : (
              <><i className="fa-solid fa-floppy-disk" /> Lưu ảnh</>
            )}
          </button>
        </div>

        {saved && (
          <p style={{ margin: 0, fontSize: ".8rem", color: "#16a34a", fontWeight: 600, textAlign: "center" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
            Đã cập nhật! Làm mới trang để thấy thay đổi.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, label, value")
      .order("key")
      .then(({ data }) => {
        setSettings(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleSaved = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s));
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Cài Đặt Website</h1>
          <p className="admin-header-subtitle">Thay đổi hình ảnh hiển thị trên website</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26 }} />
          <p style={{ marginTop: 12 }}>Đang tải...</p>
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ marginBottom: 24, background: "#fffbeb", border: "1.5px solid #fde68a" }}>
            <p style={{ margin: 0, fontSize: ".85rem", color: "#92400e", fontWeight: 600 }}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8 }} />
              Dán URL ảnh vào ô bên dưới, nhấn <strong>Xem trước</strong> để kiểm tra, rồi nhấn <strong>Lưu ảnh</strong> để áp dụng lên website.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24 }}>
            {settings.map((s) => (
              <ImageSlot key={s.key} setting={s} onSaved={handleSaved} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
