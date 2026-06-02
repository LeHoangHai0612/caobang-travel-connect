"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/admin",               icon: "fa-chart-pie",          label: "Tổng Quan"       },
  { href: "/admin/bookings",      icon: "fa-calendar-check",     label: "Đặt Lịch"        },
  { href: "/admin/tours",         icon: "fa-map",                 label: "Tours"            },
  { href: "/admin/pricing",      icon: "fa-tags",                label: "Quản Lý Giá"     },
  { href: "/admin/contacts",      icon: "fa-envelope",            label: "Liên Hệ"         },
  { href: "/admin/guides",        icon: "fa-person-hiking",       label: "Hướng Dẫn Viên" },
  { href: "/admin/destinations",  icon: "fa-map-location-dot",    label: "Điểm Đến"        },
  { href: "/admin/gallery",       icon: "fa-images",              label: "Thư Viện Ảnh"    },
  { href: "/admin/cam-nang",      icon: "fa-book-open",           label: "Cẩm Nang"        },
  { href: "/admin/reviews",       icon: "fa-star",                label: "Đánh Giá"        },
  { href: "/admin/users",         icon: "fa-users-gear",          label: "Tài Khoản"       },
  { href: "/admin/settings",      icon: "fa-sliders",             label: "Cài Đặt Website" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/dang-nhap"; return; }

      const { data: profile } = await supabase
        .from("user_profiles").select("is_admin").eq("id", session.user.id).single();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        window.location.href = "/dang-nhap?error=unauthorized";
        return;
      }
      setUserEmail(session.user.email ?? "");
      setChecking(false);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/dang-nhap";
  };

  const currentNav = NAV.find((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href)));

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center text-teal-800">
        <i className="fa-solid fa-spinner fa-spin text-3xl" />
        <p className="mt-3 font-bold text-sm">Đang xác thực...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-montserrat">
      
      {/* Mobile overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-2xl lg:shadow-none ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-[60px] flex items-center gap-3 px-6 bg-slate-950/50 border-b border-white/10 shrink-0">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain brightness-0 invert opacity-90" />
          <span className="font-bold text-sm tracking-wide">Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-hide">
          {NAV.map((link) => {
            const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-teal-600 text-white shadow-md shadow-teal-900/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <div className={`w-6 flex justify-center ${active ? "text-white" : "text-slate-500"}`}>
                  <i className={`fa-solid ${link.icon} text-sm`} />
                </div>
                {link.label}
              </Link>
            );
          })}

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <div className="w-6 flex justify-center text-slate-500">
                <i className="fa-solid fa-arrow-up-right-from-square text-sm" />
              </div>
              Xem Website
            </Link>
          </div>
        </nav>

        <div className="p-4 bg-slate-950/50 border-t border-white/10 shrink-0 pb-safe">
          <p className="text-xs text-slate-400 font-medium truncate mb-3 text-center">{userEmail}</p>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all">
            <i className="fa-solid fa-right-from-bracket" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#f8fafc]">
        {/* Top bar */}
        <header className="h-[60px] bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-10 pt-safe">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <i className="fa-solid fa-bars text-[17px]" />
            </button>
            <div>
              <p className="text-[15px] sm:text-[17px] font-black text-slate-900 leading-tight">{currentNav?.label ?? "Admin"}</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 hidden sm:block uppercase tracking-wider mt-0.5">Cao Bằng Travel Connect</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <i className="fa-solid fa-circle text-[8px] text-emerald-500" />
            <span className="text-[11px] font-bold text-slate-600 hidden sm:block max-w-[150px] truncate">{userEmail}</span>
            <span className="text-[11px] font-bold text-slate-600 sm:hidden">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-safe">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
