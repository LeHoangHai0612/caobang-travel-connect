"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface GalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

const PAGE_SIZE = 20;
const ROTATIONS = [-3, 2, -1, 4, -2, 1, -4, 3, 0, -3];

export default function ThuVienPage() {
  const [images, setImages]           = useState<GalleryImage[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [page, setPage]               = useState(0);
  const [lightbox, setLightbox]       = useState<GalleryImage | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    async function init() {
      const { data } = await supabase
        .from("gallery_images").select("*").order("sort_order").range(0, PAGE_SIZE - 1);
      const list = data ?? [];
      setImages(list);
      setHasMore(list.length === PAGE_SIZE);
      setLoading(false);
    }
    init();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await supabase
      .from("gallery_images").select("*").order("sort_order")
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    const list = data ?? [];
    setImages(prev => [...prev, ...list]);
    setHasMore(list.length === PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  const openLightbox = (img: GalleryImage, idx: number) => { setLightbox(img); setLightboxIdx(idx); };
  const closeLightbox = () => setLightbox(null);
  const prevImg = () => { const idx = (lightboxIdx - 1 + images.length) % images.length; setLightbox(images[idx]); setLightboxIdx(idx); };
  const nextImg = () => { const idx = (lightboxIdx + 1) % images.length; setLightbox(images[idx]); setLightboxIdx(idx); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, lightboxIdx, images]);

  return (
    <>
      <div className="min-h-screen bg-[#f5f2ec] pb-safe">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#2d4a2d] to-[#3a6b3a] pt-[calc(3rem+env(safe-area-inset-top))] pb-12 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pt-safe">
            <Link href="/#gallery" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold border border-white/20 hover:bg-white/25 transition-colors active:scale-95">
              <i className="fa-solid fa-arrow-left" /> Trang Chủ
            </Link>
          </div>
          <span className="text-3xl md:text-4xl block mb-2 mt-4 md:mt-0">🦋</span>
          <h1 className="font-caveat text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight drop-shadow-md">
            Thư Viện Kỷ Niệm
          </h1>
          <p className="font-caveat text-xl md:text-2xl text-white/80 mb-2">
            những khoảnh khắc từ hành trình Cao Bằng
          </p>
          {!loading && (
            <p className="text-xs text-white/60 font-bold mt-4 tracking-widest uppercase">
              {images.length}{hasMore ? "+" : ""} hình ảnh · #caobangtravel
            </p>
          )}
        </div>

        {/* Content */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-5 py-10 md:py-16">
          {loading ? (
            <div className="text-center py-20 text-[#7a6a50]">
              <i className="fa-solid fa-spinner fa-spin text-4xl mb-4 block" />
              <p className="font-caveat text-2xl">Đang tải ảnh…</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 text-[#a09080]">
              <span className="text-5xl block mb-4">📷</span>
              <p className="font-caveat text-2xl">Chưa có hình ảnh nào.</p>
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
                {images.map((img, i) => {
                  const rot = ROTATIONS[i % ROTATIONS.length];
                  return (
                    <div key={img.id} 
                      className="break-inside-avoid bg-white p-2 md:p-3 pb-8 md:pb-10 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 block relative hover:z-10 group"
                      style={{ transform: `rotate(${rot}deg)` }}
                      onClick={() => openLightbox(img, i)}>
                      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                        <img src={img.image_url} alt={`Ảnh Cao Bằng ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <p className="font-caveat text-lg md:text-xl font-bold text-[#7a6a50] text-center mt-3 leading-snug">#caobangtravel</p>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-12 md:mt-16">
                  <button onClick={loadMore} disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#3a6b3a] bg-white text-[#3a6b3a] font-bold text-sm hover:bg-[#3a6b3a] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#3a6b3a]/10 min-h-[44px]">
                    {loadingMore
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Đang tải…</>
                      : <><i className="fa-solid fa-chevron-down" /> Xem Thêm Hình Ảnh</>}
                  </button>
                </div>
              )}

              {!hasMore && images.length > 0 && (
                <p className="text-center mt-12 md:mt-16 text-[#a09080] font-caveat text-xl md:text-2xl">
                  ✨ Đã xem tất cả {images.length} khoảnh khắc
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10 active:scale-95">
            <i className="fa-solid fa-xmark" />
          </button>
          
          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold tracking-widest">
            {lightboxIdx + 1} / {images.length}
          </span>
          
          <button onClick={e => { e.stopPropagation(); prevImg(); }} className="absolute left-2 md:left-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors z-10 active:scale-95">
            <i className="fa-solid fa-chevron-left" />
          </button>
          
          <div onClick={e => e.stopPropagation()} className="bg-white p-3 pb-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] max-w-[90vw] md:max-w-[85vw] max-h-[85vh] flex flex-col">
            <div className="relative overflow-hidden flex-1 flex items-center justify-center bg-black/5">
              <img src={lightbox.image_url} alt="" className="max-w-[85vw] max-h-[75vh] object-contain block" />
            </div>
            <p className="font-caveat text-center mt-3 text-[#7a6a50] text-xl font-bold">
              #caobangtravel
            </p>
          </div>
          
          <button onClick={e => { e.stopPropagation(); nextImg(); }} className="absolute right-2 md:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors z-10 active:scale-95">
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </>
  );
}
