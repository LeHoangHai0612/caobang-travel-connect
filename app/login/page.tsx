"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Sai email hoặc mật khẩu.");
      setLoading(false);
      return;
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setError("Tài khoản này không có quyền truy cập Admin.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9EC]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#265C59]/10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e2e]">Quản Trị Hệ Thống</h2>
          <p className="text-[#6b8888] text-sm mt-1">Chỉ dành cho Admin · Cao Bằng Eco Tour</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3d5555] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#F9F9EC] border border-[#265C59]/10 rounded-lg focus:outline-none focus:border-[#3a9490] transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3d5555] uppercase tracking-wider mb-2">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#F9F9EC] border border-[#265C59]/10 rounded-lg focus:outline-none focus:border-[#3a9490] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100">
              <i className="fa-solid fa-circle-exclamation mr-2" />{error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#265C59] hover:bg-[#2e7370] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Đang xác thực..." : "ĐĂNG NHẬP ADMIN"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-[#9e9e9e]">
          Người dùng thường?{" "}
          <a href="/dang-nhap" className="text-[#265C59] font-bold hover:underline">Đăng nhập tại đây</a>
        </p>
      </div>
    </div>
  );
}
