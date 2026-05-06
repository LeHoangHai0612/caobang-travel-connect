"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PriceRow {
  key: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  unit: string;
  hint: string;
}

const PRICE_KEYS = [
  { key: "price_hdv_ca_nhan", icon: "fa-person-hiking", color: "#265C59", unit: "đ/ngày", hint: "Áp dụng cho tour cá nhân hoặc cặp đôi" },
  { key: "price_hdv_doan",    icon: "fa-users",          color: "#3b82f6", unit: "đ/ngày", hint: "Áp dụng cho nhóm 5–20 người" },
  { key: "price_hdv_xe_may",  icon: "fa-motorcycle",     color: "#8b5cf6", unit: "đ/ngày", hint: "Áp dụng cho tour phượt xe máy" },
  { key: "deposit_pct",       icon: "fa-percent",        color: "#f59e0b", unit: "%",       hint: "Phần trăm tiền cọc khách phải đặt khi xác nhận" },
];

function fmt(v: number) { return v.toLocaleString("vi-VN") + "đ"; }

export default function PricingAdmin() {
  const [rows, setRows]       = useState<PriceRow[]>([]);
  const [saving, setSaving]   = useState<Record<string, boolean>>({});
  const [saved, setSaved]     = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("key,label,value")
      .in("key", PRICE_KEYS.map(p => p.key))
      .then(({ data }) => {
        const merged = PRICE_KEYS.map(p => {
          const found = data?.find(d => d.key === p.key);
          return { ...p, label: found?.label ?? p.key, value: found?.value ?? "0" };
        });
        setRows(merged);
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, val: string) => {
    setRows(prev => prev.map(r => r.key === key ? { ...r, value: val } : r));
  };

  const handleSave = async (key: string, value: string) => {
    setSaving(prev => ({ ...prev, [key]: true }));
    await supabase.from("site_settings").update({ value }).eq("key", key);
    setSaving(prev => ({ ...prev, [key]: false }));
    setSaved(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2500);
  };

  const handleSaveAll = async () => {
    for (const r of rows) await handleSave(r.key, r.value);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", color: "#265C59" }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }} />
    </div>
  );

  const depositRow = rows.find(r => r.key === "deposit_pct");
  const priceRows  = rows.filter(r => r.key !== "deposit_pct");

  return (
    <div className="admin-content">
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Quản Lý Giá Dịch Vụ</h1>
          <p className="admin-header-subtitle">Chỉnh giá HDV, tỉ lệ tiền cọc — áp dụng ngay trên trang đặt lịch</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSaveAll}>
          <i className="fa-solid fa-floppy-disk" /> Lưu Tất Cả
        </button>
      </div>

      {/* Giá HDV */}
      <h2 style={{ fontSize: ".75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
        <i className="fa-solid fa-tag" style={{ marginRight: 8 }} />Giá Theo Gói
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18, marginBottom: 32 }}>
        {priceRows.map(r => {
          const numVal = parseInt(r.value) || 0;
          return (
            <div key={r.key} className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Top color bar */}
              <div style={{ height: 5, background: r.color }} />
              <div style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: r.color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${r.icon}`} style={{ color: r.color, fontSize: 18 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: ".92rem", color: "#0f172a", margin: 0 }}>{r.label}</p>
                    <p style={{ fontSize: ".72rem", color: "#94a3b8", margin: "2px 0 0" }}>{r.hint}</p>
                  </div>
                </div>

                {/* Current price display */}
                <div style={{ background: r.color + "08", border: `1.5px solid ${r.color}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 14, textAlign: "center" }}>
                  <p style={{ fontSize: ".68rem", color: "#94a3b8", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: ".08em" }}>Giá hiện tại</p>
                  <p style={{ fontSize: "1.4rem", fontWeight: 900, color: r.color, margin: 0 }}>{fmt(numVal)}</p>
                  <p style={{ fontSize: ".72rem", color: "#94a3b8", margin: "2px 0 0" }}>mỗi ngày</p>
                </div>

                {/* Input */}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input type="number" value={r.value} min={0} step={10000}
                      onChange={e => handleChange(r.key, e.target.value)}
                      className="admin-form-input"
                      style={{ paddingRight: 36, fontWeight: 700, fontSize: ".9rem" }} />
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: ".72rem", color: "#94a3b8", fontWeight: 600 }}>đ</span>
                  </div>
                  <button className="admin-btn admin-btn-primary" onClick={() => handleSave(r.key, r.value)}
                    disabled={saving[r.key]} style={{ flexShrink: 0 }}>
                    {saving[r.key]
                      ? <i className="fa-solid fa-spinner fa-spin" />
                      : saved[r.key]
                        ? <><i className="fa-solid fa-check" /> Đã lưu</>
                        : <><i className="fa-solid fa-floppy-disk" /> Lưu</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tiền cọc */}
      <h2 style={{ fontSize: ".75rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
        <i className="fa-solid fa-coins" style={{ marginRight: 8 }} />Cài Đặt Tiền Cọc
      </h2>
      {depositRow && (() => {
        const pct = parseInt(depositRow.value) || 30;
        const examplePrice = 500000;
        return (
          <div className="admin-card" style={{ maxWidth: 600 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label className="admin-form-label">Phần trăm tiền cọc</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="number" value={depositRow.value} min={0} max={100}
                    onChange={e => handleChange(depositRow.key, e.target.value)}
                    className="admin-form-input"
                    style={{ width: 100, fontWeight: 700, fontSize: "1.1rem", textAlign: "center" }} />
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#265C59" }}>%</span>
                  <button className="admin-btn admin-btn-primary" onClick={() => handleSave(depositRow.key, depositRow.value)}
                    disabled={saving[depositRow.key]}>
                    {saving[depositRow.key]
                      ? <i className="fa-solid fa-spinner fa-spin" />
                      : saved[depositRow.key]
                        ? <><i className="fa-solid fa-check" /> Đã lưu</>
                        : <><i className="fa-solid fa-floppy-disk" /> Lưu</>}
                  </button>
                </div>
                <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 8 }}>{depositRow.hint}</p>
              </div>

              {/* Preview */}
              <div style={{ background: "#fffbeb", border: "1.5px solid #fde047", borderRadius: 14, padding: "16px 20px", minWidth: 220 }}>
                <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#854d0e", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                  <i className="fa-solid fa-calculator" style={{ marginRight: 5 }} />Ví dụ tính cọc
                </p>
                {[
                  { label: "Giá tour",     val: fmt(examplePrice) },
                  { label: `Cọc ${pct}%`, val: fmt(Math.round(examplePrice * pct / 100)), highlight: true },
                  { label: "Còn lại",      val: fmt(examplePrice - Math.round(examplePrice * pct / 100)) },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #fde68a" : "none" }}>
                    <span style={{ fontSize: ".78rem", color: "#92400e" }}>{item.label}</span>
                    <span style={{ fontSize: ".82rem", fontWeight: 800, color: item.highlight ? "#b45309" : "#78350f" }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Info */}
      <div className="admin-card" style={{ marginTop: 24, background: "#f0faf9", border: "1.5px solid #b2dfdb" }}>
        <p style={{ margin: 0, fontSize: ".84rem", color: "#265C59", fontWeight: 600 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }} />
          Giá thay đổi sẽ được áp dụng ngay trên trang <strong>Đặt Lịch</strong>. Khách đặt tour riêng sẽ dùng giá từ bảng Tours.
        </p>
      </div>
    </div>
  );
}
