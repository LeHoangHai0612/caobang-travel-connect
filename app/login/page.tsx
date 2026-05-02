"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase"; // Nhập cái cầu nối vừa tạo ở bước 3.1

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Hàm Đăng ký (Tạo tài khoản mới)
  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) setMessage("Lỗi đăng ký: " + error.message);
    else setMessage("Đăng ký thành công! Giờ bạn có thể đăng nhập.");
    setLoading(false);
  };

  // Hàm Đăng nhập
  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setMessage("Sai email hoặc mật khẩu!");
    else {
      setMessage("Đăng nhập thành công! Đang chuyển hướng...");
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9EC]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-[#265C59]/10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#265C59] to-[#3a9490] text-white rounded-lg flex items-center justify-center text-xl mx-auto mb-3">
            <i className="fa-solid fa-mountain-sun"></i>
          </div>
          <h2 className="text-2xl font-bold text-[#1a2e2e]">Quản Trị Hệ Thống</h2>
          <p className="text-[#6b8888] text-sm mt-1">Cao Bằng Eco Tour</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3d5555] uppercase tracking-wider mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F9EC] border border-[#265C59]/10 rounded-lg focus:outline-none focus:border-[#3a9490] transition-colors"
              placeholder="admin@caobangecotour.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3d5555] uppercase tracking-wider mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F9EC] border border-[#265C59]/10 rounded-lg focus:outline-none focus:border-[#3a9490] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <div className={`p-3 rounded text-sm font-medium ${message.includes('Lỗi') || message.includes('Sai') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-[#265C59] hover:bg-[#2e7370] text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-transparent border-2 border-[#265C59] text-[#265C59] hover:bg-[#265C59]/5 font-bold py-3 rounded-lg transition-colors"
            >
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}