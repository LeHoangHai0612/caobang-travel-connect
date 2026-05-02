"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/login";
      } else {
        setUserEmail(session.user.email ?? "");
        setChecking(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f8" }}>
        <div style={{ textAlign: "center", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 12, fontWeight: 600 }}>Đang xác thực...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin",         icon: "fa-chart-pie",    label: "Tổng Quan" },
    { href: "/admin/guides",  icon: "fa-users",         label: "Hướng Dẫn Viên" },
    { href: "/admin/gallery", icon: "fa-images",        label: "Thư Viện Ảnh" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <i className="fa-solid fa-mountain-sun" />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-nav-link${pathname === link.href ? " active" : ""}`}
            >
              <i className={`fa-solid ${link.icon}`} />
              {link.label}
            </Link>
          ))}

          <Link href="/" target="_blank" className="admin-nav-link" style={{ marginTop: "auto" }}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
            Xem Website
          </Link>
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.12)" }}>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail}
          </p>
          <button onClick={handleLogout} className="admin-btn admin-btn-danger" style={{ width: "100%", justifyContent: "center" }}>
            <i className="fa-solid fa-right-from-bracket" /> Đăng Xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
