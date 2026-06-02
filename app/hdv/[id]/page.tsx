"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { Guide } from "@/lib/database.types";
import StickyBottomBar from "@/app/components/ui/StickyBottomBar";

const VI_DAYS_SHORT = ["CN","T2","T3","T4","T5","T6","T7"];
const VI_MONTHS_FULL = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                        "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function GuideCalendar({ guideId }: { guideId: string }) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guide_schedules")
      .select("date")
      .eq("guide_id", guideId)
      .gte("date", `${viewYear}-01-01`)
      .lte("date", `${viewYear}-12-31`);
    setBusyDates(new Set((data ?? []).map((d: { date: string }) => d.date)));
    setLoading(false);
  }, [guideId, viewYear]);

  useEffect(() => { load(); }, [load]);

  function prev() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const busyThisMonth = cells.filter((d) => {
    if (!d) return false;
    const k = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return busyDates.has(k);
  }).length;
  const freeThisMonth = daysInMonth - busyThisMonth;

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev}
          className="bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl w-10 h-10 flex items-center justify-center transition-colors active:scale-95">
          <i className="fa-solid fa-chevron-left" />
        </button>
        <div className="text-center">
          <p className="font-extrabold text-[15px] text-slate-800 m-0">
            {VI_MONTHS_FULL[viewMonth]} {viewYear}
          </p>
          {!loading && (
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {freeThisMonth} ngày trống · {busyThisMonth} ngày bận
            </p>
          )}
        </div>
        <button onClick={next}
          className="bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl w-10 h-10 flex items-center justify-center transition-colors active:scale-95">
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {VI_DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase">{d}</div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">
          <i className="fa-solid fa-spinner fa-spin text-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 md:gap-1.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const k       = `${viewYear}-${String(viewMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isPast  = k < todayKey;
            const isToday = k === todayKey;
            const isBusy  = busyDates.has(k);

            let bg     = "bg-white";
            let color  = "text-slate-700";
            let border = "border-slate-200";
            let label  = "";

            if (isPast)    { bg = "bg-slate-50"; color = "text-slate-300"; border = "border-slate-100"; }
            if (isBusy && !isPast) { bg = "bg-red-50"; color = "text-red-600"; border = "border-red-200"; label = "Bận"; }
            if (isToday)   { border = "border-teal-800"; }
            if (!isBusy && !isPast) { bg = "bg-green-50"; color = "text-green-700"; border = "border-green-200"; }

            return (
              <div key={i} title={isBusy && !isPast ? "HDV đã có lịch ngày này" : (!isPast ? "Còn trống" : "")}
                className={`flex flex-col items-center justify-center rounded-lg border-2 py-1.5 md:py-2 min-h-[44px] ${bg} ${color} ${border} ${isToday ? "border-2 shadow-sm font-black" : "font-bold"}`}>
                <span className="text-sm">{day}</span>
                {label && <span className="text-[9px] leading-none mt-0.5 font-bold uppercase tracking-wider">{label}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center flex-wrap">
        {[
          { bg: "bg-green-50", border: "border-green-200", label: "Còn trống" },
          { bg: "bg-red-50", border: "border-red-200", label: "Đã có lịch" },
          { bg: "bg-slate-50", border: "border-slate-200", label: "Đã qua" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded shadow-sm border-2 ${l.bg} ${l.border}`} />
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 tracking-wider flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <i key={s} className={`fa-${s <= Math.floor(rating) ? "solid" : rating >= s - 0.5 ? "solid fa-star-half-stroke" : "regular"} fa-star text-sm`} />
      ))}
    </span>
  );
}

export default function GuideProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("guides").select("*").eq("id", id).single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setGuide(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <i className="fa-solid fa-spinner fa-spin text-3xl text-teal-800" />
    </div>
  );

  if (notFound || !guide) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <i className="fa-solid fa-user-slash text-5xl text-slate-300" />
      <p className="font-bold text-slate-700">Không tìm thấy hướng dẫn viên</p>
      <a href="/hdv" className="text-teal-800 font-bold hover:underline flex items-center gap-2">
        <i className="fa-solid fa-arrow-left" /> Quay lại danh sách
      </a>
    </div>
  );

  const specialties = guide.specialty.split("·").map((s) => s.trim()).filter(Boolean);
  const langs = guide.languages ? guide.languages.split(",").map((l) => l.trim()) : ["Tiếng Việt"];
  const hasBio = guide.bio && guide.bio.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-6 h-14 flex items-center justify-between pt-safe">
        <a href="/hdv" className="flex items-center gap-2 text-teal-800 font-bold text-sm hover:gap-3 transition-all">
          <i className="fa-solid fa-arrow-left" /> <span className="hidden sm:inline">Danh sách HDV</span>
        </a>
        <a href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain brightness-0" />
          <span className="font-extrabold text-[13px] text-slate-800 hidden sm:inline">Cao Bằng Travel Connect</span>
        </a>
      </header>

      {/* Hero */}
      <div className="relative min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src={guide.image_url} alt="Background" fill className="object-cover object-top blur-xl brightness-[0.55] saturate-75 scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8 md:pb-10 pt-20 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden shrink-0 relative bg-slate-200">
            <Image src={guide.image_url} alt={guide.name} fill className="object-cover object-top" sizes="160px" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
            <p className="text-[11px] md:text-xs font-black text-white/70 uppercase tracking-[0.15em] mb-1.5">{guide.role}</p>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">{guide.name}</h1>
            <p className="text-white/80 font-semibold mb-4 drop-shadow">{guide.specialty}</p>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 mb-5">
              <span className="text-xl font-black text-amber-500">{guide.rating}</span>
              <StarRow rating={guide.rating} />
              <div className="w-px h-5 bg-white/20 mx-1" />
              <span className="text-xs font-bold text-white/70">Đánh giá</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full">
              {guide.zalo_number && (
                <button onClick={() => window.open(`https://zalo.me/${guide.zalo_number}`, "_blank")} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 active:scale-95 min-w-[140px]">
                  <i className="fa-brands fa-comment-dots text-lg" /> Chat Zalo
                </button>
              )}
              <a href={`/dat-lich?guide=${guide.id}`} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-sm transition-colors backdrop-blur-md active:scale-95 min-w-[140px]">
                <i className="fa-solid fa-calendar-check text-lg" /> Đặt Lịch
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-28 md:pb-12 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 md:gap-8">
        
        {/* Left column */}
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* Bio */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-5">
              <i className="fa-solid fa-id-card text-teal-700 text-sm" /> Giới Thiệu
            </h2>
            
            {hasBio ? (
              <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed font-medium">{guide.bio}</p>
            ) : (
              <p className="text-sm md:text-[15px] text-slate-500 leading-relaxed italic font-medium">
                {guide.name} là hướng dẫn viên địa phương với {guide.years_experience} năm kinh nghiệm dẫn tour tại Cao Bằng.
                Chuyên về {guide.specialty.replace("HDV ·", "").trim()}, {guide.name.split(" ").pop()} am hiểu sâu về địa lý, văn hóa và lịch sử vùng đất biên giới này.
                Mỗi chuyến đi cùng {guide.name} đều được cá nhân hóa để phù hợp với nhu cầu và sở thích của du khách.
              </p>
            )}

            {/* Specialty tags */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
              {specialties.map((s, i) => (
                <span key={i} className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-100">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Lịch làm việc */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              <i className="fa-solid fa-calendar-days text-teal-700 text-sm" /> Lịch Làm Việc
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-6">
              Xem ngày HDV còn trống để chọn thời gian phù hợp khi đặt lịch.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100 mb-6">
              <GuideCalendar guideId={guide.id} />
            </div>
            
            <a href={`/dat-lich?guide=${guide.id}`} 
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-teal-800 to-teal-700 hover:from-teal-900 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-teal-900/20 active:scale-95 transition-all">
              <i className="fa-solid fa-calendar-check" /> Đặt Lịch Ngày Trống
            </a>
          </div>
          
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 md:gap-8">
          
          {/* Quick info */}
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 shadow-sm border border-slate-100">
            <h2 className="flex items-center gap-2.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              <i className="fa-solid fa-circle-info text-teal-700 text-sm" /> Thông Tin Nhanh
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-briefcase text-teal-700 text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Kinh Nghiệm</p>
                  <p className="text-sm font-bold text-slate-800">{guide.years_experience} năm dẫn tour</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-star text-teal-700 text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Đánh Giá</p>
                  <p className="text-sm font-bold text-slate-800">{guide.rating} / 5.0 ★ trung bình</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-language text-teal-700 text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Ngôn Ngữ</p>
                  <p className="text-sm font-bold text-slate-800">{langs.join(" · ")}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-map-location-dot text-teal-700 text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Khu Vực</p>
                  <p className="text-sm font-bold text-slate-800">Cao Bằng, Việt Nam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact card */}
          {guide.zalo_number && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl md:rounded-3xl p-6 md:p-8 text-center shadow-lg shadow-blue-900/20 text-white relative overflow-hidden">
              <i className="fa-brands fa-whatsapp absolute -right-6 -bottom-6 text-9xl opacity-10" />
              <div className="relative z-10">
                <h2 className="flex items-center justify-center gap-2.5 text-[11px] font-black text-blue-200 uppercase tracking-widest mb-3">
                  <i className="fa-solid fa-headset text-sm" /> Liên Hệ Nhanh
                </h2>
                <p className="text-[13px] text-blue-100 mb-6 font-semibold leading-relaxed">
                  Nhắn tin Zalo để tư vấn tour miễn phí và đặt lịch ngay hôm nay với {guide.name.split(" ").pop()}
                </p>
                <button onClick={() => window.open(`https://zalo.me/${guide.zalo_number}`, "_blank")}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-blue-700 font-black text-sm active:scale-95 transition-transform shadow-lg">
                  <i className="fa-brands fa-comment-dots text-lg" /> Chat Zalo Ngay
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>

      <StickyBottomBar
        leftTitle="Hướng Dẫn Viên"
        leftSubtitle={guide.name}
        zaloNumber={guide.zalo_number}
        onBook={() => window.location.href = `/dat-lich?guide=${guide.id}`}
      />
    </div>
  );
}
