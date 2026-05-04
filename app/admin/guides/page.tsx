"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const EMPTY_FORM = {
  name: "", specialty: "", role: "Chuyên gia HDV Sinh Thái",
  rating: 5, image_url: "", zalo_number: "", bio: "",
  years_experience: 1, languages: "Tiếng Việt", is_active: true,
};
type FormData = typeof EMPTY_FORM;

interface ScheduleEntry {
  id: string;
  date: string;
  status: "booked" | "blocked";
  note: string;
  booking_id: string | null;
}

const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                   "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ── Calendar Modal ────────────────────────────────────────────────────────────
function ScheduleModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [schedule, setSchedule]   = useState<Record<string, ScheduleEntry>>({});
  const [loading, setLoading]     = useState(true);
  const [blockNote, setBlockNote] = useState("");
  const [pending, setPending]     = useState<string | null>(null); // date being toggled

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guide_schedules")
      .select("id,date,status,note,booking_id")
      .eq("guide_id", guide.id)
      .gte("date", `${viewYear}-01-01`)
      .lte("date", `${viewYear}-12-31`);
    const map: Record<string, ScheduleEntry> = {};
    (data ?? []).forEach((e) => { map[e.date] = e; });
    setSchedule(map);
    setLoading(false);
  }, [guide.id, viewYear]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  async function toggleDay(dateKey: string) {
    const entry = schedule[dateKey];
    if (entry?.status === "booked") return; // không chặn ngày đã đặt
    setPending(dateKey);

    if (entry?.status === "blocked") {
      // Bỏ chặn
      await supabase.from("guide_schedules").delete().eq("id", entry.id);
      setSchedule((prev) => { const next = { ...prev }; delete next[dateKey]; return next; });
    } else {
      // Chặn thủ công
      const { data } = await supabase.from("guide_schedules").insert({
        guide_id: guide.id, date: dateKey, status: "blocked", note: blockNote.trim(),
      }).select().single();
      if (data) setSchedule((prev) => ({ ...prev, [dateKey]: data }));
    }
    setPending(null);
  }

  // Tạo ô ngày trong tháng
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const bookedCount  = Object.values(schedule).filter((e) => e.status === "booked").length;
  const blockedCount = Object.values(schedule).filter((e) => e.status === "blocked").length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "white", borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "#265C59", padding: "20px 24px", borderRadius: "18px 18px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>Lịch — {guide.name}</p>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".78rem", margin: "4px 0 0" }}>
              {bookedCount} đã đặt · {blockedCount} đã chặn
            </p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", color: "#265C59", fontWeight: 700 }}>‹</button>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1a2e2e" }}>
              {VI_MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", color: "#265C59", fontWeight: 700 }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
            {VI_DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#265C59" }}>
              <i className="fa-solid fa-spinner fa-spin" />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const entry   = schedule[dateKey];
                const isPast  = new Date(dateKey) < new Date(toDateKey(today));
                const isBooked  = entry?.status === "booked";
                const isBlocked = entry?.status === "blocked";
                const isToday   = dateKey === toDateKey(today);
                const isLoading = pending === dateKey;

                let bg = "white", color = "#1a2e2e", border = "1.5px solid #e2e8f0";
                if (isBooked)  { bg = "#fee2e2"; color = "#dc2626"; border = "1.5px solid #fca5a5"; }
                if (isBlocked) { bg = "#fff7ed"; color = "#c2410c"; border = "1.5px solid #fed7aa"; }
                if (isPast)    { bg = "#f8fafc"; color = "#cbd5e1"; border = "1.5px solid #f1f5f9"; }
                if (isToday)   { border = "2px solid #265C59"; }

                return (
                  <button key={i}
                    title={isBooked ? `Đã đặt${entry?.note ? ": " + entry.note : ""}` : isBlocked ? `Đã chặn${entry?.note ? ": " + entry.note : ""}` : "Click để chặn ngày này"}
                    onClick={() => !isPast && !isBooked && toggleDay(dateKey)}
                    disabled={isPast || isBooked || isLoading}
                    style={{
                      background: bg, color, border, borderRadius: 8,
                      padding: "6px 0", fontWeight: isToday ? 800 : 600,
                      fontSize: ".82rem", cursor: isPast || isBooked ? "default" : "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      transition: "all .1s",
                      opacity: isLoading ? .5 : 1,
                    }}>
                    {day}
                    {isBooked  && <span style={{ fontSize: ".55rem", lineHeight: 1 }}>ĐẶT</span>}
                    {isBlocked && <span style={{ fontSize: ".55rem", lineHeight: 1 }}>CHẶN</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Block note input */}
          <div style={{ marginTop: 20, padding: 16, background: "#f8fafc", borderRadius: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: ".72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Ghi chú khi chặn ngày</p>
            <input
              className="admin-form-input"
              style={{ marginBottom: 0 }}
              value={blockNote}
              onChange={(e) => setBlockNote(e.target.value)}
              placeholder="Ví dụ: HDV nghỉ phép, bận việc riêng..."
            />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 14, justifyContent: "center" }}>
            {[
              { color: "white", border: "#e2e8f0", label: "Trống" },
              { color: "#fee2e2", border: "#fca5a5", label: "Đã đặt (booking)" },
              { color: "#fff7ed", border: "#fed7aa", label: "Đã chặn (thủ công)" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1.5px solid ${l.border}` }} />
                <span style={{ fontSize: ".72rem", color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GuidesAdmin() {
  const [guides, setGuides]     = useState<Guide[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<FormData>(EMPTY_FORM);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [scheduleGuide, setScheduleGuide] = useState<Guide | null>(null);

  async function fetchGuides() {
    const { data } = await supabase.from("guides").select("*").order("created_at", { ascending: false });
    setGuides(data ?? []);
    setLoading(false);
  }
  useEffect(() => { fetchGuides(); }, []);

  function openAdd() { setEditingId(null); setForm(EMPTY_FORM); setError(""); setModalOpen(true); }
  function openEdit(guide: Guide) {
    setEditingId(guide.id);
    setForm({ name: guide.name, specialty: guide.specialty, role: guide.role, rating: guide.rating,
      image_url: guide.image_url, zalo_number: guide.zalo_number ?? "", bio: guide.bio ?? "",
      years_experience: guide.years_experience ?? 1, languages: guide.languages ?? "Tiếng Việt",
      is_active: guide.is_active });
    setError(""); setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditingId(null); }

  async function handleSave() {
    if (!form.name.trim()) { setError("Vui lòng nhập tên HDV."); return; }
    if (!form.image_url.trim()) { setError("Vui lòng nhập URL ảnh."); return; }
    setSaving(true); setError("");
    const payload = { ...form };
    if (editingId) {
      const { error: e } = await supabase.from("guides").update(payload).eq("id", editingId);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("guides").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    setSaving(false); closeModal(); fetchGuides();
  }

  async function handleDelete(id: string) {
    await supabase.from("guides").delete().eq("id", id);
    setDeleteId(null); fetchGuides();
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
                      <img src={g.image_url || "https://via.placeholder.com/48"} alt={g.name} className="admin-img-avatar" />
                    </td>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td style={{ color: "#6b8888" }}>{g.specialty}</td>
                    <td>{g.zalo_number || <span style={{ color: "#bbb" }}>—</span>}</td>
                    <td><span style={{ color: "#E5A919", fontWeight: 700 }}>{g.rating}★</span></td>
                    <td>
                      <button onClick={() => toggleActive(g)}
                        className={`admin-badge ${g.is_active ? "admin-badge-success" : "admin-badge-danger"}`}
                        style={{ cursor: "pointer", border: "none" }}>
                        {g.is_active ? "Đang hoạt động" : "Tạm ẩn"}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="admin-btn admin-btn-secondary" onClick={() => setScheduleGuide(g)}
                          title="Xem lịch" style={{ padding: "6px 10px" }}>
                          <i className="fa-solid fa-calendar-days" />
                        </button>
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

      {/* Schedule modal */}
      {scheduleGuide && <ScheduleModal guide={scheduleGuide} onClose={() => setScheduleGuide(null)} />}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editingId ? "Chỉnh Sửa HDV" : "Thêm HDV Mới"}</h2>
              <button className="admin-modal-close" onClick={closeModal}><i className="fa-solid fa-xmark" /></button>
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
                  <input className="admin-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Anh Minh" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Chuyên môn *</label>
                  <input className="admin-form-input" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="HDV · Trekking & Sinh Thái" />
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Vai trò</label>
                  <input className="admin-form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Đánh giá (1–5)</label>
                  <input className="admin-form-input" type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL Ảnh *</label>
                <input className="admin-form-input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Số Zalo</label>
                  <input className="admin-form-input" value={form.zalo_number} onChange={(e) => setForm({ ...form, zalo_number: e.target.value })} placeholder="0912345678" />
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingBottom: 10 }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#265C59" }} />
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>Hiển thị trên trang chủ</span>
                  </label>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Kinh nghiệm (năm)</label>
                  <input className="admin-form-input" type="number" min={0} max={50} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Ngôn ngữ</label>
                  <input className="admin-form-input" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="Tiếng Việt, English" />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Giới thiệu (Bio)</label>
                <textarea className="admin-form-input" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Mô tả ngắn về HDV..." style={{ resize: "vertical", fontFamily: "inherit" }} />
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: 13, background: "#fef2f2", padding: "10px 14px", borderRadius: 8, marginTop: 8 }}>{error}</p>}
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Xác nhận xóa</h2>
              <button className="admin-modal-close" onClick={() => setDeleteId(null)}><i className="fa-solid fa-xmark" /></button>
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
