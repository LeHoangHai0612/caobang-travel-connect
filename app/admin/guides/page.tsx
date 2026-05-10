"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const EMPTY_FORM = {
  name: "", specialty: "", role: "Chuyên gia HDV Sinh Thái",
  rating: 5, image_url: "", zalo_number: "", bio: "",
  years_experience: 1, languages: "Tiếng Việt", is_active: true, is_featured: false,
};
type FormData = typeof EMPTY_FORM;

interface ScheduleEntry {
  id: string;
  date: string;
  status: "booked" | "blocked";
  note: string;
  booking_id: string | null;
  created_by: string | null;
  created_by_name: string;
}

interface LogEntry {
  id: string;
  date: string;
  action: string;
  admin_name: string;
  note: string;
  created_at: string;
}

const VI_DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                   "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const ACTION_LABEL: Record<string, { label: string; color: string }> = {
  blocked:   { label: "Chặn",        color: "#c2410c" },
  unblocked: { label: "Bỏ chặn",     color: "#0369a1" },
  booked:    { label: "Đặt lịch",    color: "#dc2626" },
  cancelled: { label: "Hủy lịch",    color: "#7c3aed" },
};

function toDateKey(d: Date) { return d.toISOString().slice(0, 10); }
function initials(name: string) { return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(); }

// ── Calendar Modal ────────────────────────────────────────────────────────────
function ScheduleModal({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const today = new Date();
  const [viewYear, setViewYear]     = useState(today.getFullYear());
  const [viewMonth, setViewMonth]   = useState(today.getMonth());
  const [schedule, setSchedule]     = useState<Record<string, ScheduleEntry>>({});
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [blockNote, setBlockNote]   = useState("");
  const [pending, setPending]       = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<{ dateKey: string; blockedBy: string } | null>(null);
  const [adminId, setAdminId]       = useState<string>("");
  const [adminName, setAdminName]   = useState<string>("");
  const [showLog, setShowLog]       = useState(false);

  // Lấy thông tin admin đang đăng nhập
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setAdminId(session.user.id);
      const { data } = await supabase.from("user_profiles").select("full_name").eq("id", session.user.id).single();
      setAdminName(data?.full_name || session.user.email || "Admin");
    });
  }, []);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guide_schedules")
      .select("id,date,status,note,booking_id,created_by,created_by_name")
      .eq("guide_id", guide.id)
      .gte("date", `${viewYear}-01-01`)
      .lte("date", `${viewYear}-12-31`);
    const map: Record<string, ScheduleEntry> = {};
    (data ?? []).forEach((e) => { map[e.date] = e; });
    setSchedule(map);
    setLoading(false);
  }, [guide.id, viewYear]);

  const loadLogs = useCallback(async () => {
    const { data } = await supabase
      .from("schedule_logs")
      .select("id,date,action,admin_name,note,created_at")
      .eq("guide_id", guide.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setLogs(data ?? []);
  }, [guide.id]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);
  useEffect(() => { if (showLog) loadLogs(); }, [showLog, loadLogs]);

  async function writeLog(date: string, action: string, note: string) {
    await supabase.from("schedule_logs").insert({
      guide_id: guide.id, guide_name: guide.name,
      date, action, admin_id: adminId, admin_name: adminName, note,
    });
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  async function doBlock(dateKey: string) {
    setPending(dateKey);
    const { data } = await supabase.from("guide_schedules").insert({
      guide_id: guide.id, date: dateKey, status: "blocked",
      note: blockNote.trim(), created_by: adminId, created_by_name: adminName,
    }).select().single();
    if (data) {
      setSchedule((prev) => ({ ...prev, [dateKey]: data }));
      await writeLog(dateKey, "blocked", blockNote.trim());
      if (showLog) loadLogs();
    }
    setPending(null);
  }

  async function doUnblock(dateKey: string, entry: ScheduleEntry) {
    setPending(dateKey);
    await supabase.from("guide_schedules").delete().eq("id", entry.id);
    setSchedule((prev) => { const next = { ...prev }; delete next[dateKey]; return next; });
    await writeLog(dateKey, "unblocked", entry.note);
    if (showLog) loadLogs();
    setConfirmEntry(null);
    setPending(null);
  }

  async function toggleDay(dateKey: string) {
    const entry = schedule[dateKey];
    if (entry?.status === "booked") return;

    if (entry?.status === "blocked") {
      // Nếu là của admin khác → yêu cầu xác nhận
      if (entry.created_by && entry.created_by !== adminId) {
        setConfirmEntry({ dateKey, blockedBy: entry.created_by_name || "Admin khác" });
        return;
      }
      await doUnblock(dateKey, entry);
    } else {
      await doBlock(dateKey);
    }
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const bookedCount  = Object.values(schedule).filter((e) => e.status === "booked").length;
  const blockedCount = Object.values(schedule).filter((e) => e.status === "blocked").length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "white", borderRadius: 18, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "#265C59", padding: "20px 24px", borderRadius: "18px 18px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>Lịch — {guide.name}</p>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".78rem", margin: "4px 0 0" }}>
              {bookedCount} đã đặt · {blockedCount} đã chặn
              {adminName && <span style={{ marginLeft: 8, opacity: .7 }}>· Bạn: {adminName}</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowLog((v) => !v)}
              title="Lịch sử thay đổi"
              style={{ background: showLog ? "rgba(255,255,255,.3)" : "rgba(255,255,255,.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: ".8rem" }}>
              <i className="fa-solid fa-clock-rotate-left" />
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {showLog ? (
            /* ── Activity log panel ── */
            <div>
              <p style={{ fontWeight: 800, fontSize: ".85rem", color: "#1a2e2e", marginBottom: 14 }}>
                <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 7, color: "#265C59" }} />
                Lịch Sử Thay Đổi
              </p>
              {logs.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "24px 0", fontSize: ".84rem" }}>Chưa có thay đổi nào được ghi lại.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {logs.map((log) => {
                    const act = ACTION_LABEL[log.action] ?? { label: log.action, color: "#64748b" };
                    return (
                      <div key={log.id} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#265C59", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "white", fontSize: ".65rem", fontWeight: 800 }}>{initials(log.admin_name)}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: ".82rem", color: "#1a2e2e" }}>{log.admin_name}</span>
                            <span style={{ fontSize: ".73rem", fontWeight: 700, color: act.color, background: act.color + "18", padding: "1px 7px", borderRadius: 6 }}>{act.label}</span>
                            <span style={{ fontSize: ".78rem", color: "#265C59", fontWeight: 700 }}>
                              {new Date(log.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {log.note && <p style={{ margin: "3px 0 0", fontSize: ".75rem", color: "#64748b" }}>{log.note}</p>}
                          <p style={{ margin: "2px 0 0", fontSize: ".68rem", color: "#94a3b8" }}>
                            {new Date(log.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <button onClick={() => setShowLog(false)}
                style={{ width: "100%", marginTop: 16, padding: "9px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                ← Quay lại lịch
              </button>
            </div>
          ) : (
            <>
              {/* Month nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button onClick={prevMonth} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", color: "#265C59", fontWeight: 700 }}>‹</button>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1a2e2e" }}>{VI_MONTHS[viewMonth]} {viewYear}</span>
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
                    const dateKey   = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const entry     = schedule[dateKey];
                    const isPast    = new Date(dateKey) < new Date(toDateKey(today));
                    const isBooked  = entry?.status === "booked";
                    const isBlocked = entry?.status === "blocked";
                    const isToday   = dateKey === toDateKey(today);
                    const isLoading = pending === dateKey;
                    const isOther   = isBlocked && entry?.created_by && entry.created_by !== adminId;

                    let bg = "white", color = "#1a2e2e", border = "1.5px solid #e2e8f0";
                    if (isBooked)  { bg = "#fee2e2"; color = "#dc2626"; border = "1.5px solid #fca5a5"; }
                    if (isBlocked) { bg = isOther ? "#fdf4ff" : "#fff7ed"; color = isOther ? "#7c3aed" : "#c2410c"; border = `1.5px solid ${isOther ? "#e9d5ff" : "#fed7aa"}`; }
                    if (isPast)    { bg = "#f8fafc"; color = "#cbd5e1"; border = "1.5px solid #f1f5f9"; }
                    if (isToday)   { border = "2px solid #265C59"; }

                    const tooltipText = isBooked
                      ? `Đã đặt${entry?.note ? ": " + entry.note : ""}`
                      : isBlocked
                        ? `Chặn bởi: ${entry.created_by_name || "Admin"}${entry.note ? "\n" + entry.note : ""}`
                        : isPast ? "" : "Click để chặn";

                    return (
                      <button key={i}
                        title={tooltipText}
                        onClick={() => !isPast && !isBooked && toggleDay(dateKey)}
                        disabled={isPast || isBooked || isLoading}
                        style={{
                          background: bg, color, border, borderRadius: 8,
                          padding: "5px 0 4px", fontWeight: isToday ? 800 : 600,
                          fontSize: ".8rem", cursor: isPast || isBooked ? "default" : "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                          opacity: isLoading ? .5 : 1, transition: "all .1s",
                        }}>
                        {day}
                        {isBooked  && <span style={{ fontSize: ".52rem", lineHeight: 1 }}>ĐẶT</span>}
                        {isBlocked && !isPast && (
                          <span style={{ fontSize: ".52rem", lineHeight: 1, fontWeight: 800 }}>
                            {initials(entry.created_by_name || "?")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Block note input */}
              <div style={{ marginTop: 18, padding: 14, background: "#f8fafc", borderRadius: 12 }}>
                <p style={{ margin: "0 0 7px", fontSize: ".68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Ghi chú khi chặn ngày</p>
                <input className="admin-form-input" style={{ marginBottom: 0 }}
                  value={blockNote} onChange={(e) => setBlockNote(e.target.value)}
                  placeholder="HDV nghỉ phép, bận việc riêng..." />
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { bg: "white",   border: "#e2e8f0", label: "Trống" },
                  { bg: "#fee2e2", border: "#fca5a5", label: "Đã đặt" },
                  { bg: "#fff7ed", border: "#fed7aa", label: "Bạn chặn" },
                  { bg: "#fdf4ff", border: "#e9d5ff", label: "Admin khác chặn" },
                ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.border}` }} />
                      <span style={{ fontSize: ".68rem", color: "#64748b" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 10, fontSize: ".68rem", color: "#94a3b8", textAlign: "center" }}>
                  Ô hiển thị chữ tắt tên admin đã chặn. Hover để xem chi tiết.
                </p>
              </>
            )}
        </div>

        {/* Confirm dialog — bỏ chặn của admin khác */}
        {confirmEntry && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 10 }}>
            <div style={{ background: "white", borderRadius: 14, padding: 24, maxWidth: 340, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "#d97706", fontSize: 20 }} />
              </div>
              <p style={{ fontWeight: 800, fontSize: ".95rem", color: "#1a2e2e", textAlign: "center", marginBottom: 8 }}>
                Bỏ chặn ngày của admin khác?
              </p>
              <p style={{ fontSize: ".82rem", color: "#64748b", textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
                Ngày <strong>{new Date(confirmEntry.dateKey).toLocaleDateString("vi-VN")}</strong> đang được chặn bởi <strong>{confirmEntry.blockedBy}</strong>. Bạn có chắc muốn bỏ chặn không?
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmEntry(null)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                  Hủy
                </button>
                <button onClick={() => doUnblock(confirmEntry.dateKey, schedule[confirmEntry.dateKey])}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                  Xác nhận bỏ chặn
                </button>
              </div>
            </div>
          </div>
        )}
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
      is_active: guide.is_active, is_featured: guide.is_featured ?? false });
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

  async function toggleFeatured(guide: Guide) {
    await supabase.from("guides").update({ is_featured: !guide.is_featured }).eq("id", guide.id);
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
                  <th>Nổi Bật</th>
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
                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => toggleFeatured(g)}
                        title={g.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", lineHeight: 1, padding: 4, transition: "transform .2s" }}
                        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                        {g.is_featured ? "⭐" : "☆"}
                      </button>
                    </td>
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
                <div className="admin-form-group" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", justifyContent: "flex-end", paddingBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#265C59" }} />
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>Hiển thị trên trang chủ</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#E5A919" }} />
                    <span className="admin-form-label" style={{ marginBottom: 0 }}>⭐ HDV Nổi Bật</span>
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
