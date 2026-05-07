"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
      <style>{`
        .tv-masonry {
          columns: 4; column-gap: 20px;
        }
        @media (max-width: 1024px) { .tv-masonry { columns: 3; } }
        @media (max-width: 640px)  { .tv-masonry { columns: 2; column-gap: 12px; } }

        .polaroid {
          break-inside: avoid;
          background: white;
          padding: 10px 10px 40px;
          box-shadow: 0 4px 18px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
          margin-bottom: 20px;
          cursor: pointer;
          transition: transform .3s ease, box-shadow .3s ease;
          display: block;
        }
        .polaroid:hover {
          transform: rotate(0deg) scale(1.04) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,.18);
          z-index: 10;
          position: relative;
        }
        .polaroid img { display: block; width: 100%; height: auto; }
        .polaroid-caption {
          font-family: var(--font-caveat), cursive;
          font-size: 1rem; font-weight: 600;
          color: #7a6a50; text-align: center;
          margin-top: 10px; line-height: 1.3;
        }
        @media (max-width: 640px) {
          .polaroid { padding: 7px 7px 30px; margin-bottom: 12px; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f2ec" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #2d4a2d, #3a6b3a)", padding: "56px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .06, backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "absolute", top: 20, left: 20 }}>
            <Link href="/#gallery" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "white", padding: "7px 14px", borderRadius: 50, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.2)" }}>
              <i className="fa-solid fa-arrow-left" /> Trang Chủ
            </Link>
          </div>
          <span style={{ fontSize: "2rem", display: "block", marginBottom: 10 }}>🦋</span>
          <h1 style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 700, color: "white", margin: "0 0 8px", lineHeight: 1.1 }}>
            Thư Viện Kỷ Niệm
          </h1>
          <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.2rem", color: "rgba(255,255,255,.75)", margin: "0 0 6px" }}>
            những khoảnh khắc từ hành trình Cao Bằng
          </p>
          {!loading && (
            <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)", fontWeight: 600, marginTop: 12 }}>
              {images.length}{hasMore ? "+" : ""} hình ảnh · #caobangtravel
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px 80px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#7a6a50" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 14, display: "block" }} />
              <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.2rem" }}>Đang tải ảnh…</p>
            </div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#a09080" }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: 16 }}>📷</span>
              <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.3rem" }}>Chưa có hình ảnh nào.</p>
            </div>
          ) : (
            <>
              <div className="tv-masonry">
                {images.map((img, i) => {
                  const rot = ROTATIONS[i % ROTATIONS.length];
                  return (
                    <div key={img.id} className="polaroid"
                      style={{ transform: `rotate(${rot}deg)` }}
                      onClick={() => openLightbox(img, i)}>
                      <img src={img.image_url} alt={`Ảnh Cao Bằng ${i + 1}`} loading="lazy" />
                      <p className="polaroid-caption">#caobangtravel</p>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 48 }}>
                  <button onClick={loadMore} disabled={loadingMore}
                    style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 36px", borderRadius: 50, border: "2px solid #3a6b3a", background: "white", color: "#3a6b3a", fontWeight: 700, fontSize: ".88rem", cursor: loadingMore ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(58,107,58,.15)", fontFamily: "inherit" }}>
                    {loadingMore
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Đang tải…</>
                      : <><i className="fa-solid fa-chevron-down" /> Xem Thêm Hình Ảnh</>}
                  </button>
                </div>
              )}

              {!hasMore && images.length > 0 && (
                <p style={{ textAlign: "center", marginTop: 48, color: "#a09080", fontFamily: "var(--font-caveat), cursive", fontSize: "1.1rem" }}>
                  ✨ Đã xem tất cả {images.length} khoảnh khắc
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={closeLightbox}>
          <button onClick={closeLightbox}
            style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1.1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-xmark" />
          </button>
          <span style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.5)", fontSize: ".78rem", fontWeight: 700 }}>
            {lightboxIdx + 1} / {images.length}
          </span>
          <button onClick={e => { e.stopPropagation(); prevImg(); }}
            style={{ position: "absolute", left: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "white", padding: "12px 12px 48px", boxShadow: "0 24px 80px rgba(0,0,0,.5)", maxWidth: "88vw" }}>
            <img src={lightbox.image_url} alt=""
              style={{ maxWidth: "80vw", maxHeight: "78vh", objectFit: "contain", display: "block" }} />
            <p style={{ fontFamily: "var(--font-caveat), cursive", textAlign: "center", marginTop: 10, color: "#7a6a50", fontSize: "1.1rem", fontWeight: 600 }}>
              #caobangtravel
            </p>
          </div>
          <button onClick={e => { e.stopPropagation(); nextImg(); }}
            style={{ position: "absolute", right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </>
  );
}
