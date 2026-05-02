"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TaiKhoanLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = "/dang-nhap";
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F9EC" }}>
        <div style={{ textAlign: "center", color: "#265C59" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28 }} />
          <p style={{ marginTop: 10, fontWeight: 600 }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
