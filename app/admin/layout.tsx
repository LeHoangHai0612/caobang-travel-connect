"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/admin",          icon: "fa-chart-pie",   label: "Tổng Quan"       },
  { href: "/admin/guides",   icon: "fa-users",        label: "Hướng Dẫn Viên" },
  { href: "/admin/gallery",  icon: "fa-images",       label: "Thư Viện Ảnh"   },
  { href: "/admin/settings", icon: "fa-sliders",      label: "Cài Đặt Website" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/login"; return; }

      const { data: profile } = await supabase
        .from("user_profiles").select("is_admin").eq("id", session.user.id).single();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        window.location.href = "/login?error=unauthorized";
        return;
      }
      setUserEmail(session.user.email ?? "");
      setChecking(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const currentNav = NAV.find((n) => n.href === pathname);

  if (checking) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
      <div style={{ textAlign: "center", color: "#265C59" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
        <p style={{ marginTop: 12, fontWeight: 700, fontSize: ".9rem" }}>Đang xác thực...</p>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src="/logo.png" alt="Logo"
            style={{ width: 28, height: 28, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: .85 }} />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href}
              className={`admin-nav-link${pathname === link.href ? " active" : ""}`}>
              <i className={`fa-solid ${link.icon}`} />
              {link.label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <Link href="/" target="_blank" className="admin-nav-link" style={{ marginTop: 8 }}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
            Xem Website
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-sidebar-email">{userEmail}</p>
          <button onClick={handleLogout} className="admin-btn admin-btn-danger"
            style={{ width: "100%", justifyContent: "center", fontSize: ".78rem" }}>
            <i className="fa-solid fa-right-from-bracket" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div>
            <p className="admin-topbar-title">{currentNav?.label ?? "Admin"}</p>
            <p className="admin-topbar-sub">Cao Bằng Travel Connect</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".75rem", color: "#94a3b8", fontWeight: 600 }}>
              <i className="fa-solid fa-circle" style={{ color: "#22c55e", fontSize: 8, marginRight: 5 }} />
              {userEmail}
            </span>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
