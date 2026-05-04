"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Contact {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
  admin_reply?: string;
  replied_at?: string;
  replied_by?: string;
}

export default function AdminContacts() {
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "unread" | "read">("all");
  const [detail, setDetail]       = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying]   = useState(false);

  async function load() {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: number, is_read: boolean) {
    await supabase.from("contacts").update({ is_read }).eq("id", id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, is_read } : c));
    if (detail?.id === id) setDetail((prev) => prev ? { ...prev, is_read } : prev);
  }

  async function openDetail(c: Contact) {
    setDetail(c);
    if (!c.is_read) await markRead(c.id, true);
  }

  async function sendReply(contact: Contact) {
    if (!replyText.trim()) return;
    setReplying(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data: profile } = session
      ? await supabase.from("user_profiles").select("full_name").eq("id", session.user.id).single()
      : { data: null };
    const adminName = profile?.full_name || session?.user.email || "Admin";
    const repliedAt = new Date().toISOString();

    await supabase.from("contacts").update({
      admin_reply: replyText.trim(),
      replied_at:  repliedAt,
      replied_by:  adminName,
      is_read:     true,
    }).eq("id", contact.id);

    const updated = { ...contact, admin_reply: replyText.trim(), replied_at: repliedAt, replied_by: adminName, is_read: true };
    setContacts((prev) => prev.map((c) => c.id === contact.id ? updated : c));
    setDetail(updated);
    setReplyText("");
    setReplying(false);
  }

  async function handleDelete(id: number) {
    await supabase.from("contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  const displayed = contacts.filter((c) =>
    filter === "all"    ? true :
    filter === "unread" ? !c.is_read :
    c.is_read
  );

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  const TABS = [
    { value: "all",    label: "Tất cả",    count: contacts.length },
    { value: "unread", label: "Chưa đọc",  count: unreadCount },
    { value: "read",   label: "Đã đọc",    count: contacts.length - unreadCount },
  ] as const;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Tin Nhắn Liên Hệ</h1>
          <p className="admin-header-subtitle">Tin nhắn từ khách hàng gửi qua website</p>
        </div>
        {unreadCount > 0 && (
          <span className="admin-badge admin-badge-warning" style={{ fontSize: ".8rem", padding: "6px 14px" }}>
            <i className="fa-solid fa-envelope" style={{ marginRight: 5 }} />
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            style={{
              padding: "7px 18px", borderRadius: 20, border: "2px solid",
              borderColor: filter === t.value ? "#265C59" : "#e2e8f0",
              background: filter === t.value ? "#265C59" : "white",
              color: filter === t.value ? "white" : "#475569",
              fontWeight: 600, fontSize: ".82rem", cursor: "pointer",
            }}>
            {t.label}
            <span style={{ marginLeft: 6, background: filter === t.value ? "rgba(255,255,255,.25)" : "#f1f5f9", color: filter === t.value ? "white" : "#64748b", borderRadius: 10, padding: "1px 7px", fontSize: ".75rem" }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26 }} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 36, marginBottom: 12, display: "block" }} />
          <p style={{ fontWeight: 600 }}>Không có tin nhắn nào.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map((c) => (
            <div key={c.id}
              onClick={() => openDetail(c)}
              className="admin-card"
              style={{
                cursor: "pointer", padding: "16px 20px",
                borderLeft: `4px solid ${c.is_read ? "#e2e8f0" : "#265C59"}`,
                display: "flex", gap: 16, alignItems: "flex-start",
                background: c.is_read ? "white" : "#f0faf9",
                transition: "box-shadow .15s",
              }}>
              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: c.is_read ? "#f1f5f9" : "#265C59", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: c.is_read ? "#94a3b8" : "white", fontWeight: 800, fontSize: ".85rem" }}>
                  {(c.fullname || "?")[0].toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: c.is_read ? 600 : 800, color: "#0f172a", fontSize: ".9rem" }}>{c.fullname || "Ẩn danh"}</span>
                  {!c.is_read && (
                    <span style={{ background: "#265C59", color: "white", borderRadius: 20, padding: "1px 8px", fontSize: ".68rem", fontWeight: 700 }}>MỚI</span>
                  )}
                  <span style={{ marginLeft: "auto", fontSize: ".75rem", color: "#94a3b8", flexShrink: 0 }}>
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {c.phone && <p style={{ margin: "0 0 3px", fontSize: ".78rem", color: "#64748b" }}><i className="fa-solid fa-phone" style={{ marginRight: 5, fontSize: ".7rem" }} />{c.phone}</p>}
                <p style={{ margin: 0, fontSize: ".83rem", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
                  {c.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setDetail(null)}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ background: "#265C59", padding: "20px 24px", borderRadius: "16px 16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>{detail.fullname || "Ẩn danh"}</p>
                <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".78rem", margin: "4px 0 0" }}>
                  {new Date(detail.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24 }}>
              {/* Contact info */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                {detail.email && (
                  <a href={`mailto:${detail.email}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "#f0faf9", borderRadius: 8, color: "#265C59", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                    <i className="fa-solid fa-envelope" />
                    {detail.email}
                  </a>
                )}
                {detail.phone && (
                  <a href={`tel:${detail.phone}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "#f0faf9", borderRadius: 8, color: "#265C59", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                    <i className="fa-solid fa-phone" />
                    {detail.phone}
                  </a>
                )}
                {detail.phone && (
                  <a href={`https://zalo.me/${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "#e8f4fd", borderRadius: 8, color: "#0068ff", fontWeight: 700, fontSize: ".82rem", textDecoration: "none" }}>
                    <i className="fa-brands fa-facebook-messenger" />
                    Zalo
                  </a>
                )}
              </div>

              {/* Message */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 18, marginBottom: 20 }}>
                <p style={{ margin: "0 0 8px", fontSize: ".7rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".08em" }}>Nội dung tin nhắn</p>
                <p style={{ margin: 0, color: "#334155", fontSize: ".9rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{detail.message}</p>
              </div>

              {/* Actions */}
              {/* Reply đã gửi */}
              {detail.admin_reply && (
                <div style={{ background: "#f0faf9", border: "1.5px solid #b2dfdb", borderRadius: 12, padding: 14 }}>
                  <p style={{ margin: "0 0 6px", fontSize: ".68rem", fontWeight: 800, color: "#265C59", textTransform: "uppercase" }}>
                    <i className="fa-solid fa-reply" style={{ marginRight: 5 }} />
                    Đã phản hồi · {detail.replied_by}
                    {detail.replied_at && <span style={{ fontWeight: 400, opacity: .7, marginLeft: 6 }}>· {new Date(detail.replied_at).toLocaleString("vi-VN")}</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: ".85rem", color: "#1e293b", lineHeight: 1.7 }}>{detail.admin_reply}</p>
                  <a href={`/tin-nhan/${detail.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: ".72rem", color: "#265C59", fontWeight: 700, textDecoration: "none" }}>
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: ".65rem" }} />
                    Link xem phản hồi của khách
                  </a>
                </div>
              )}

              {/* Ô nhập reply */}
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}>
                <p style={{ margin: "0 0 8px", fontSize: ".68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
                  {detail.admin_reply ? "Sửa phản hồi" : "Viết phản hồi cho khách"}
                </p>
                <textarea
                  className="admin-form-input"
                  rows={3}
                  style={{ resize: "vertical", fontFamily: "inherit", marginBottom: 8 }}
                  placeholder="Nhập nội dung phản hồi... Khách hàng sẽ thấy tại link /tin-nhan/[id]"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  defaultValue={detail.admin_reply || ""}
                />
                <button onClick={() => sendReply(detail)} disabled={replying || !replyText.trim()}
                  style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".84rem", cursor: "pointer", opacity: !replyText.trim() ? .5 : 1 }}>
                  {replying
                    ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Đang gửi...</>
                    : <><i className="fa-solid fa-reply" style={{ marginRight: 6 }} />{detail.admin_reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}</>}
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => markRead(detail.id, !detail.is_read)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "2px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                  <i className={`fa-solid ${detail.is_read ? "fa-envelope" : "fa-envelope-open"}`} style={{ marginRight: 6 }} />
                  {detail.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                </button>
                <button
                  onClick={() => handleDelete(detail.id)}
                  style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: ".84rem", cursor: "pointer" }}>
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
