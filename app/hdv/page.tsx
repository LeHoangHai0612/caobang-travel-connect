"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";

const LANGS = ["Tiếng Việt", "English", "中文", "한국어"];

function StarIcons({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const full = s <= Math.floor(rating);
        const half = !full && rating >= s - 0.5;
        return <i key={s} className={`fa-${full || half ? "solid" : "regular"} ${full ? "fa-star" : half ? "fa-star-half-stroke" : "fa-star"} text-amber-500 text-xs`} />;
      })}
    </div>
  );
}

export default function AllGuidesPage() {
  const [guides, setGuides]           = useState<Guide[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterLang, setFilterLang]   = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [filterSpec, setFilterSpec]   = useState("");

  useEffect(() => {
    supabase.from("guides").select("*").or("is_active.is.null,is_active.eq.true")
      .order("rating", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []).sort((a, b) => ((b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)));
        setGuides(list);
        setLoading(false);
      });
  }, []);

  const filtered = guides.filter((g) => {
    const q = search.toLowerCase();
    const matchQ    = !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q) || g.bio?.toLowerCase().includes(q);
    const matchLang = !filterLang   || g.languages?.toLowerCase().includes(filterLang.toLowerCase());
    const matchRate = !filterRating || g.rating >= parseFloat(filterRating);
    const matchSpec = !filterSpec   || g.specialty.toLowerCase().includes(filterSpec.toLowerCase());
    return matchQ && matchLang && matchRate && matchSpec;
  });

  const specialties = [...new Set(guides.map((g) => {
    const parts = g.specialty.split("·");
    return parts[1]?.trim() ?? g.specialty;
  }))].slice(0, 8);

  const hasFilter = search || filterLang || filterRating || filterSpec;

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Header */}
      <header className="relative z-10 px-6 h-14 flex items-center justify-between border-b border-white/10 bg-teal-900 pt-safe">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="Logo" width={30} height={30} className="object-contain invert brightness-0 shrink-0" />
          <span className="text-white font-extrabold text-sm md:text-base">Cao Bằng Travel Connect</span>
        </a>
        <a href="/" className="text-white/80 text-sm font-semibold no-underline flex items-center gap-1.5">
          <i className="fa-solid fa-arrow-left" /> <span className="hidden sm:inline">Trang chủ</span>
        </a>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 pt-12 pb-10 px-6 text-center">
        <span className="inline-block bg-white/15 text-white/90 text-[11px] font-bold px-3.5 py-1 rounded-full tracking-widest uppercase">
          Đội Ngũ Chuyên Nghiệp
        </span>
        <h1 className="text-white font-black text-2xl md:text-4xl mt-3 mb-2 drop-shadow-md">
          Tất Cả Hướng Dẫn Viên
        </h1>
        <p className="text-white/75 text-sm max-w-lg mx-auto mb-7">
          {loading ? "Đang tải..." : `${guides.length} hướng dẫn viên giàu kinh nghiệm tại Cao Bằng`}
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, chuyên môn, giới thiệu..."
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border-none text-sm outline-none shadow-lg focus:ring-2 focus:ring-teal-400 min-h-[44px]" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 mb-10">
        {/* Filters - Horizontal scrolling chips on mobile */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bộ lọc</span>
            {hasFilter && (
              <button onClick={() => { setSearch(""); setFilterLang(""); setFilterRating(""); setFilterSpec(""); }}
                className="text-xs font-bold text-teal-700 flex items-center gap-1 active:scale-95 transition-transform min-h-[32px]">
                <i className="fa-solid fa-rotate-left" /> Đặt lại
              </button>
            )}
          </div>
          
          <div className="flex overflow-x-auto md:flex-wrap pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 md:gap-3 custom-scrollbar snap-x">
            {/* Rating Filter */}
            <div className="flex gap-2 snap-start shrink-0 pr-2 border-r border-slate-200">
              <button onClick={() => setFilterRating("")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${!filterRating ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                Tất cả đánh giá
              </button>
              <button onClick={() => setFilterRating("5")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${filterRating === "5" ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                ⭐ 5 sao
              </button>
              <button onClick={() => setFilterRating("4")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${filterRating === "4" ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                ⭐ 4+ sao
              </button>
            </div>
            
            {/* Lang Filter */}
            <div className="flex gap-2 snap-start shrink-0 pr-2 border-r border-slate-200">
              <button onClick={() => setFilterLang("")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${!filterLang ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                Mọi ngôn ngữ
              </button>
              {LANGS.map(l => (
                <button key={l} onClick={() => setFilterLang(l)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${filterLang === l ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                  {l}
                </button>
              ))}
            </div>

            {/* Specialty Filter */}
            <div className="flex gap-2 snap-start shrink-0 pr-4">
              <button onClick={() => setFilterSpec("")}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${!filterSpec ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                Mọi chuyên môn
              </button>
              {specialties.map(s => (
                <button key={s} onClick={() => setFilterSpec(s)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border-2 min-h-[40px] ${filterSpec === s ? "bg-teal-800 text-white border-teal-800" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1">
            Đang hiển thị {filtered.length} HDV
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-teal-800">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
            <p className="mt-3 font-semibold">Đang tải danh sách HDV...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <i className="fa-solid fa-person-hiking text-5xl mb-4 opacity-50" />
            <p className="font-bold text-slate-600 text-base">Không tìm thấy HDV phù hợp</p>
            <p className="text-sm mt-1">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((g) => (
              <a key={g.id} href={`/hdv/${g.id}`} className="block group">
                <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col ${g.is_featured ? "shadow-[0_4px_24px_rgba(229,169,25,0.25)] border-2 border-amber-500 group-hover:-translate-y-1 group-hover:shadow-[0_8px_28px_rgba(229,169,25,0.35)]" : "shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-1"}`}>
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                    <img src={g.image_url} alt={g.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 right-2 bg-black/60 text-amber-500 rounded-lg px-2.5 py-1 text-xs font-black backdrop-blur-md">
                      {g.rating}★
                    </div>
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
                      {g.is_featured && (
                        <div className="bg-amber-500 text-white rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <i className="fa-solid fa-star" /> Nổi Bật
                        </div>
                      )}
                      {g.languages?.includes("English") && (
                        <div className="bg-teal-800 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-sm">EN</div>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <h3 className="font-extrabold text-slate-900 text-base mb-1 truncate">{g.name}</h3>
                    <p className="text-teal-800 text-xs font-bold mb-2 truncate">{g.specialty}</p>
                    {g.bio && <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{g.bio}</p>}
                    
                    <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
                      <StarIcons rating={g.rating} />
                      {g.years_experience > 0 && (
                        <span className="bg-teal-50 text-teal-800 rounded-md px-2 py-1 text-[10px] font-bold border border-teal-100">
                          {g.years_experience} năm KN
                        </span>
                      )}
                    </div>
                    
                    {g.zalo_number && (
                      <button onClick={(e) => { e.preventDefault(); window.open(`https://zalo.me/${g.zalo_number}`, "_blank"); }}
                        className="w-full mt-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-800 text-teal-800 hover:text-white border border-teal-100 hover:border-teal-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]">
                        <i className="fa-brands fa-comment-dots text-sm" /> Chat Zalo
                      </button>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
