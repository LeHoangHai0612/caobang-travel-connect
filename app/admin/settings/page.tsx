"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Setting {
  key: string;
  label: string;
  value: string;
}

const AUDIO_KEYS = ["background_music"];
const ICONS: Record<string, string> = {
  hero_bg:          "fa-mountain-sun",
  login_bg:         "fa-right-to-bracket",
  destinations_bg:  "fa-map-location-dot",
  pricing_bg:       "fa-tag",
  background_music: "fa-music",
};

function SettingSlot({ setting, onSaved }: { setting: Setting; onSaved: (key: string, value: string) => void }) {
  const [url, setUrl]         = useState(setting.value);
  const [preview, setPreview] = useState(setting.value);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [imgErr, setImgErr]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const isAudio = AUDIO_KEYS.includes(setting.key);

  async function handleFileUpload(file: File) {
    if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop() ?? "mp3";
    const path = `music_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("audio").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { alert("Upload thất bại: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(path);
    setUrl(publicUrl);
    setPreview(publicUrl);
    setUploading(false);
  }

  const handleSave = async () => {
    const v = url.trim();
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({ value: v }).eq("key", setting.key);
    setSaving(false);
    if (!error) { setSaved(true); onSaved(setting.key, v); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Preview area */}
      <div style={{ position: "relative", width: "100%", background: "#0f172a", overflow: "hidden", minHeight: isAudio ? 120 : 0, aspectRatio: isAudio ? undefined : "16/7" }}>
        {isAudio ? (
          /* Audio preview */
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: preview ? "rgba(58,148,144,.3)" : "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <i className="fa-solid fa-music" style={{ color: preview ? "#5eead4" : "rgba(255,255,255,.3)", fontSize: 22 }} />
            </div>
            {preview
              ? <audio controls src={preview} style={{ width: "100%", maxWidth: 280, height: 36 }} />
              : <span style={{ fontSize: ".8rem", color: "rgba(255,255,255,.3)", fontWeight: 600 }}>Chưa có nhạc nền</span>}
          </div>
        ) : (
          /* Image preview */
          preview && !imgErr
            ? <img src={preview} alt={setting.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={() => setImgErr(true)} />
            : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(255,255,255,.25)", padding: "32px 0" }}>
                <i className="fa-solid fa-image" style={{ fontSize: 32 }} />
                <span style={{ fontSize: ".78rem" }}>{imgErr ? "URL không hợp lệ" : "Chưa có ảnh"}</span>
              </div>
        )}

        {/* Label overlay */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,.7))", padding: "20px 18px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className={`fa-solid ${ICONS[setting.key] ?? "fa-gear"}`} style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }} />
            <span style={{ color: "white", fontWeight: 800, fontSize: ".87rem" }}>{setting.label}</span>
          </div>
          <code style={{ fontSize: ".68rem", color: "rgba(255,255,255,.45)", marginTop: 3, display: "block" }}>{setting.key}</code>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>
            {isAudio ? "URL file nhạc (mp3, ogg...)" : "URL ảnh mới"}
          </label>
          <input
            className="admin-form-input"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setImgErr(false); }}
            placeholder={isAudio ? "https://...music.mp3" : "https://..."}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        {/* Upload file MP3 (chỉ audio) */}
        {isAudio && (
          <div>
            <label style={{ display: "block", fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>
              Hoặc tải file MP3 trực tiếp
            </label>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 0", borderRadius: 10, border: "2px dashed #cbd5e1",
              background: "#f8fafc", cursor: uploading ? "wait" : "pointer",
              color: "#64748b", fontWeight: 600, fontSize: ".82rem",
              transition: "border-color .15s",
            }}>
              {uploading
                ? <><i className="fa-solid fa-spinner fa-spin" /> Đang upload...</>
                : <><i className="fa-solid fa-cloud-arrow-up" /> Chọn file MP3 / OGG</>}
              <input type="file" accept="audio/*" style={{ display: "none" }}
                disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }} />
            </label>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {!isAudio && (
            <button className="admin-btn admin-btn-secondary" onClick={() => { setPreview(url.trim()); setImgErr(false); }}
              disabled={!url.trim() || url === preview} style={{ flex: 1, justifyContent: "center" }}>
              <i className="fa-solid fa-eye" /> Xem trước
            </button>
          )}
          {isAudio && (
            <button className="admin-btn admin-btn-secondary" onClick={() => setPreview(url.trim())}
              disabled={!url.trim() || url === preview} style={{ flex: 1, justifyContent: "center" }}>
              <i className="fa-solid fa-headphones" /> Nghe thử
            </button>
          )}
          <button className="admin-btn admin-btn-primary" onClick={handleSave}
            disabled={saving || !url.trim()} style={{ flex: 1, justifyContent: "center" }}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Đang lưu...</>
              : saved
                ? <><i className="fa-solid fa-circle-check" /> Đã lưu!</>
                : <><i className="fa-solid fa-floppy-disk" /> {isAudio ? "Lưu nhạc" : "Lưu ảnh"}</>}
          </button>
        </div>

        {saved && (
          <p style={{ margin: 0, fontSize: ".78rem", color: "#16a34a", fontWeight: 600, textAlign: "center" }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
            Đã cập nhật! Tải lại trang để áp dụng.
          </p>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("key, label, value").order("key")
      .then(({ data }) => { setSettings(data ?? []); setLoading(false); });
  }, []);

  const handleSaved = (key: string, value: string) =>
    setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value } : s));

  // Nhóm: images vs audio
  const images = settings.filter((s) => !AUDIO_KEYS.includes(s.key));
  const audio  = settings.filter((s) => AUDIO_KEYS.includes(s.key));

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Cài Đặt Website</h1>
          <p className="admin-header-subtitle">Thay đổi hình ảnh và nhạc nền hiển thị trên website</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : (
        <>
          <div className="admin-card" style={{ marginBottom: 24, background: "#fffbeb", border: "1.5px solid #fde68a", padding: "14px 18px" }}>
            <p style={{ margin: 0, fontSize: ".84rem", color: "#92400e", fontWeight: 600 }}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8 }} />
              Dán URL vào ô bên dưới → <strong>Xem trước / Nghe thử</strong> → <strong>Lưu</strong>.
              Tải lại trang chủ để thấy thay đổi.
            </p>
          </div>

          {/* Ảnh nền */}
          {images.length > 0 && (
            <>
              <h2 style={{ fontSize: ".75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
                <i className="fa-solid fa-image" style={{ marginRight: 8 }} />Hình Ảnh
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20, marginBottom: 32 }}>
                {images.map((s) => <SettingSlot key={s.key} setting={s} onSaved={handleSaved} />)}
              </div>
            </>
          )}

          {/* Nhạc nền */}
          {audio.length > 0 && (
            <>
              <h2 style={{ fontSize: ".75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
                <i className="fa-solid fa-music" style={{ marginRight: 8 }} />Nhạc Nền
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
                {audio.map((s) => <SettingSlot key={s.key} setting={s} onSaved={handleSaved} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
