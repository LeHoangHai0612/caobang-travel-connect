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

export default function ThuVienPage() {
  const [images, setImages]       = useState<GalleryImage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]     = useState(true);
  const [page, setPage]           = useState(0);
  const [lightbox, setLightbox]   = useState<GalleryImage | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [bg, setBg]               = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");

  useEffect(() => {
    async function init() {
      const [{ data: imgs }, { data: s }] = await Promise.all([
        supabase.from("gallery_images").select("*").order("sort_order").range(0, PAGE_SIZE - 1),
        supabase.from("site_settings").select("key,value").eq("key", "gallery_bg"),
      ]);
      const list = imgs ?? [];
      setImages(list);
      setHasMore(list.length === PAGE_SIZE);
      if (s?.[0]?.value) setBg(s[0].value);
      setLoading(false);
    }
    init();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order")
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    const list = data ?? [];
    setImages(prev => [...prev, ...list]);
    setHasMore(list.length === PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  const openLightbox = (img: GalleryImage, idx: number) => {
    setLightbox(img);
    setLightboxIdx(idx);
  };

  const closeLightbox = () => setLightbox(null);

  const prevImg = () => {
    const idx = (lightboxIdx - 1 + images.length) % images.length;
    setLightbox(images[idx]);
    setLightboxIdx(idx);
  };

  const nextImg = () => {
    const idx = (lightboxIdx + 1) % images.length;
    setLightbox(images[idx]);
    setLightboxIdx(idx);
  };

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
    <div style={{ minHeight: "100vh", background: "#0e1a18" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(14,26,24,.88))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 24px 40px" }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginBottom: 10 }}>
            <i className="fa-solid fa-images" style={{ marginRight: 7 }} />Khoảnh Khắc
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900, margin: "0 0 6px", textAlign: "center" }}>Thư Viện Hình Ảnh</h1>
          <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".85rem", margin: 0 }}>
            {loading ? "Đang tải…" : `${images.length}${hasMore ? "+" : ""} hình ảnh Cao Bằng`}
          </p>
        </div>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <Link href="/#gallery" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.12)", backdropFilter: "blur(8px)", color: "white", padding: "7px 14px", borderRadius: 50, fontSize: ".8rem", fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,.2)" }}>
            <i className="fa-solid fa-arrow-left" /> Trang Chủ
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.5)" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, marginBottom: 14, display: "block" }} />
            Đang tải hình ảnh…
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,.4)" }}>
            <i className="fa-solid fa-image-slash" style={{ fontSize: 40, marginBottom: 16, display: "block" }} />
            <p>Chưa có hình ảnh nào.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
              {images.map((img, i) => (
                <div key={img.id}
                  onClick={() => openLightbox(img, i)}
                  style={{ position: "relative", aspectRatio: "1", overflow: "hidden", borderRadius: 12, cursor: "pointer", background: "#1a2e2c" }}>
                  <img src={img.image_url} alt={`Ảnh Cao Bằng ${i + 1}`} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease", display: "block" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "")} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(14,26,24,0)", transition: "background .3s", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(14,26,24,.45)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(14,26,24,0)"; }}>
                    <i className="fa-solid fa-magnifying-glass-plus" style={{ color: "white", fontSize: "1.4rem", opacity: 0, transition: "opacity .3s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0"; }} />
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <button onClick={loadMore} disabled={loadingMore}
                  style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 32px", borderRadius: 50, border: "2px solid rgba(196,141,16,.6)", background: "rgba(196,141,16,.1)", color: "#e5a919", fontWeight: 700, fontSize: ".86rem", cursor: loadingMore ? "not-allowed" : "pointer", letterSpacing: ".04em" }}>
                  {loadingMore
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Đang tải…</>
                    : <><i className="fa-solid fa-chevron-down" /> Xem Thêm Hình Ảnh</>}
                </button>
              </div>
            )}

            {!hasMore && images.length > 0 && (
              <p style={{ textAlign: "center", marginTop: 40, color: "rgba(255,255,255,.3)", fontSize: ".8rem", fontWeight: 600 }}>
                Đã hiển thị tất cả {images.length} hình ảnh
              </p>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={closeLightbox}>
          {/* Close */}
          <button onClick={closeLightbox}
            style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1.1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-xmark" />
          </button>

          {/* Counter */}
          <span style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.5)", fontSize: ".78rem", fontWeight: 700 }}>
            {lightboxIdx + 1} / {images.length}
          </span>

          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); prevImg(); }}
            style={{ position: "absolute", left: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-chevron-left" />
          </button>

          {/* Image */}
          <img src={lightbox.image_url} alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 24px 80px rgba(0,0,0,.6)" }} />

          {/* Next */}
          <button onClick={e => { e.stopPropagation(); nextImg(); }}
            style={{ position: "absolute", right: 16, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.15)", color: "white", fontSize: "1rem", cursor: "pointer", zIndex: 10 }}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      )}
    </div>
  );
}
