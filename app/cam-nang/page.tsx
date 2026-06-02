"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Tip { id: string; icon: string; tag: string; color: string; title: string; description: string; image_url: string; sort_order: number; }

export default function CamNangList() {
  const [tips, setTips]       = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [bg, setBg]           = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");

  useEffect(() => {
    Promise.all([
      supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("site_settings").select("key,value").eq("key", "cam_nang_bg"),
    ]).then(([{ data: t }, { data: s }]) => {
      setTips(t ?? []);
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    });
  }, []);

  const filtered = tips.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Hero */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden pt-safe">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bg}')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-teal-950/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10">
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/70 mb-2.5">
            <i className="fa-solid fa-book-open mr-2" />Bí Quyết Khám Phá
          </span>
          <h1 className="text-white text-3xl md:text-5xl font-black mb-6 text-center drop-shadow-lg">
            Cẩm Nang Du Lịch Cao Bằng
          </h1>
          <div className="relative w-full max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm cẩm nang..." 
              className="w-full py-3.5 pl-11 pr-4 rounded-full border-none text-sm outline-none shadow-xl focus:ring-2 focus:ring-teal-400 min-h-[44px]" />
          </div>
        </div>
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pt-safe">
          <Link href="/" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold border border-white/25 hover:bg-white/25 transition-colors active:scale-95">
            <i className="fa-solid fa-arrow-left" /> Trang Chủ
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        {loading ? (
          <div className="text-center py-16"><i className="fa-solid fa-spinner fa-spin text-3xl text-teal-800" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <i className="fa-solid fa-search text-5xl mb-4 opacity-50 block" />
            <p className="font-semibold text-slate-600">Không tìm thấy kết quả phù hợp.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6 font-bold uppercase tracking-wider">{filtered.length} bài viết</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(t => (
                <Link key={t.id} href={`/cam-nang/${t.id}`} className="block group h-full">
                  <article className="bg-white rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.1)] h-full flex flex-col">
                    {t.image_url && (
                      <div className="h-44 overflow-hidden shrink-0">
                        <img src={t.image_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-5 md:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: t.color + "18" }}>
                          <i className={`fa-solid ${t.icon}`} style={{ color: t.color, fontSize: 16 }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ color: t.color, backgroundColor: t.color + "15" }}>
                          {t.tag}
                        </span>
                      </div>
                      <h3 className="text-base md:text-lg font-black text-slate-900 mb-2 leading-snug line-clamp-2">{t.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3 flex-1">{t.description}</p>
                      <span className="text-xs font-bold flex items-center gap-1.5 mt-auto" style={{ color: t.color }}>
                        Đọc thêm <i className="fa-solid fa-arrow-right text-[10px]" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
