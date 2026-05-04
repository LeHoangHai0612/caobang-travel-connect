"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Contact {
  id: string;
  name: string;
  message: string;
  created_at: string;
  admin_reply: string;
  replied_at: string | null;
  replied_by: string;
}

export default function TinNhanPage() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("contacts")
      .select("id,name,message,created_at,admin_reply,replied_at,replied_by")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setContact(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f4f4; font-family: 'Be Vietnam Pro', sans-serif; }
        .tm-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        .tm-card { background: white; border-radius: 20px; box-shadow: 0 4px 32px rgba(0,0,0,.08); width: 100%; max-width: 560px; overflow: hidden; }
        .tm-header { background: #265C59; padding: 28px 32px; }
        .tm-header h1 { color: white; font-size: 1.1rem; font-weight: 800; margin: 0 0 4px; }
        .tm-header p { color: rgba(255,255,255,.65); font-size: .78rem; margin: 0; }
        .tm-body { padding: 28px 32px; display: flex; flex-direction: column; gap: 20px; }
        .tm-bubble { border-radius: 14px; padding: 16px 18px; }
        .tm-bubble-label { font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
        .tm-bubble-text { font-size: .9rem; line-height: 1.75; white-space: pre-wrap; }
        .tm-bubble-time { font-size: .7rem; margin-top: 8px; opacity: .6; }
        .tm-customer { background: #f0faf9; border: 1.5px solid #b2dfdb; }
        .tm-customer .tm-bubble-label { color: #265C59; }
        .tm-customer .tm-bubble-text { color: #1e293b; }
        .tm-reply { background: #265C59; }
        .tm-reply .tm-bubble-label { color: rgba(255,255,255,.7); }
        .tm-reply .tm-bubble-text { color: white; }
        .tm-reply .tm-bubble-time { color: rgba(255,255,255,.55); }
        .tm-waiting { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 16px 18px; }
        .tm-back { display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; color: #265C59; font-weight: 700; font-size: .82rem; text-decoration: none; }
        .tm-back:hover { text-decoration: underline; }
      `}</style>

      <div className="tm-page">
        {loading ? (
          <div style={{ color: "#265C59", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>Đang tải...</p>
          </div>
        ) : notFound || !contact ? (
          <div className="tm-card">
            <div className="tm-header">
              <h1>Không tìm thấy</h1>
              <p>Link đã hết hạn hoặc không hợp lệ</p>
            </div>
            <div className="tm-body">
              <p style={{ color: "#64748b", fontSize: ".88rem" }}>
                Tin nhắn không tồn tại. Vui lòng kiểm tra lại đường link hoặc gửi tin nhắn mới từ trang chủ.
              </p>
              <a href="/#lien-he" className="tm-back">← Quay về trang chủ</a>
            </div>
          </div>
        ) : (
          <div className="tm-card">
            <div className="tm-header">
              <h1>Tin nhắn của {contact.name}</h1>
              <p>Cao Bằng Travel Connect · {new Date(contact.created_at).toLocaleDateString("vi-VN")}</p>
            </div>
            <div className="tm-body">
              {/* Tin nhắn của khách */}
              <div className="tm-bubble tm-customer">
                <p className="tm-bubble-label"><i className="fa-solid fa-user" style={{ marginRight: 5 }} />Tin nhắn của bạn</p>
                <p className="tm-bubble-text">{contact.message}</p>
                <p className="tm-bubble-time">{new Date(contact.created_at).toLocaleString("vi-VN")}</p>
              </div>

              {/* Phản hồi admin */}
              {contact.admin_reply ? (
                <div className="tm-bubble tm-reply">
                  <p className="tm-bubble-label">
                    <i className="fa-solid fa-headset" style={{ marginRight: 5 }} />
                    Phản hồi từ {contact.replied_by || "Cao Bằng Travel Connect"}
                  </p>
                  <p className="tm-bubble-text">{contact.admin_reply}</p>
                  {contact.replied_at && (
                    <p className="tm-bubble-time">{new Date(contact.replied_at).toLocaleString("vi-VN")}</p>
                  )}
                </div>
              ) : (
                <div className="tm-waiting">
                  <p style={{ fontSize: ".83rem", color: "#92400e", fontWeight: 600 }}>
                    <i className="fa-solid fa-clock" style={{ marginRight: 7 }} />
                    Chúng tôi đang xem xét tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.
                  </p>
                  <p style={{ fontSize: ".75rem", color: "#a16207", marginTop: 8 }}>
                    Bạn có thể tải lại trang này để kiểm tra phản hồi, hoặc liên hệ qua Zalo để được hỗ trợ nhanh hơn.
                  </p>
                </div>
              )}

              <a href="/" className="tm-back">
                <i className="fa-solid fa-arrow-left" /> Quay về trang chủ
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
