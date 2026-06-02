"use client";

import React from "react";

interface GalleryScrapbookProps {
  galleryImages: any[];
}

export default function GalleryScrapbook({ galleryImages }: GalleryScrapbookProps) {
  return (
    <section className="gallery" id="gallery" aria-labelledby="gallery-heading"
      style={{ background: "#f5f2ec", padding: "72px 0 64px", overflow: "hidden" }}>

      <div style={{ textAlign: "center", marginBottom: 40, position: "relative" }}>
        <div style={{ display: "inline-block", position: "relative" }}>
          <span style={{ position: "absolute", top: -10, left: -40, fontSize: "1.9rem", transform: "rotate(-18deg)", pointerEvents: "none", userSelect: "none" }}>🦋</span>
          <h2 id="gallery-heading" style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "clamp(2.6rem, 5vw, 4rem)", fontWeight: 700, color: "#3a6b3a", lineHeight: 1.05, margin: 0 }}>
            Khoảnh Khắc Đáng Nhớ
          </h2>
          <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.3rem", color: "#7a9e5a", fontWeight: 600, margin: "4px 0 0" }}>
            that will last a lifetime
          </p>
        </div>
      </div>

      <div className="gallery-scrapbook-scatter" style={{ position: "relative", width: "100%", height: 480, overflow: "hidden" }}>
        {galleryImages[0] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "-1%", top: 80, width: "13%", minWidth: 110, zIndex: 2, textDecoration: "none", background: "white", padding: "8px 8px 30px", boxShadow: "0 6px 20px rgba(0,0,0,.14)", transform: "rotate(-8deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(-8deg)"; el.style.zIndex="2"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.14)"; }}>
            <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[0].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
          </a>
        )}

        {galleryImages[1] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "8%", top: 110, width: "16%", minWidth: 130, zIndex: 3, textDecoration: "none", background: "white", padding: "9px 9px 32px", boxShadow: "0 6px 20px rgba(0,0,0,.13)", transform: "rotate(5deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(5deg)"; el.style.zIndex="3"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.13)"; }}>
            <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[1].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
            <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".85rem", color:"#7a6a50", textAlign:"center", marginTop:7, fontWeight:600 }}>#caobangtravel</p>
          </a>
        )}

        {galleryImages[2] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "22%", top: 40, width: "17%", minWidth: 140, zIndex: 4, textDecoration: "none", background: "white", padding: "9px 9px 32px", boxShadow: "0 6px 20px rgba(0,0,0,.13)", transform: "rotate(-4deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(-4deg)"; el.style.zIndex="4"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.13)"; }}>
            <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[2].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
            <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".85rem", color:"#7a6a50", textAlign:"center", marginTop:7, fontWeight:600 }}>#caobangtravel</p>
          </a>
        )}

        {/* Photo 3 — CENTER Instagram mockup */}
        {galleryImages[3] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "50%", top: 18, transform: "translateX(-50%)", width: "22%", minWidth: 200, zIndex: 5, textDecoration: "none", background: "white", padding: "0", boxShadow: "0 8px 32px rgba(0,0,0,.18)", display: "block", borderRadius: 4, transition: "transform .3s, box-shadow .3s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateX(-50%) scale(1.05)"; el.style.boxShadow="0 20px 50px rgba(0,0,0,.25)"; el.style.zIndex="20"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="translateX(-50%)"; el.style.boxShadow="0 8px 32px rgba(0,0,0,.18)"; el.style.zIndex="5"; }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderBottom:"1px solid #f0f0f0" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"#ddd" }}>
                <img src={galleryImages[3].image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
              <span style={{ fontSize:".72rem", fontWeight:700, color:"#1a1a1a" }}>caobangtravel</span>
            </div>
            <div style={{ aspectRatio:"1", overflow:"hidden", position:"relative" }}>
              <img src={galleryImages[3].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,220,50,.9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,.2)" }}>
                  <i className="fa-solid fa-play" style={{ color:"#1a1a1a", fontSize:"1rem", marginLeft:3 }} />
                </div>
              </div>
            </div>
            <div style={{ padding:"8px 10px 4px" }}>
              <div style={{ display:"flex", gap:12, marginBottom:5 }}>
                <i className="fa-solid fa-heart" style={{ color:"#e33", fontSize:"1.1rem" }} />
                <i className="fa-regular fa-comment" style={{ color:"#333", fontSize:"1.1rem" }} />
                <i className="fa-regular fa-paper-plane" style={{ color:"#333", fontSize:"1.1rem" }} />
              </div>
              <p style={{ fontSize:".7rem", fontWeight:700, color:"#1a1a1a", margin:"2px 0" }}>1,234 lượt thích</p>
              <p style={{ fontSize:".68rem", color:"#555", margin:0 }}><strong>caobangtravel</strong> <span style={{ fontFamily:"var(--font-caveat),cursive" }}>#caobangtravel 🌿</span></p>
            </div>
          </a>
        )}

        {/* Note sticker */}
        <div style={{ position:"absolute", left:"62%", top:50, width:130, zIndex:6, background:"#fffef0", padding:"12px 14px", boxShadow:"0 4px 16px rgba(0,0,0,.10)", transform:"rotate(4deg)", pointerEvents:"none", userSelect:"none" }}>
          <div style={{ position:"absolute", top:-8, left:"50%", transform:"translateX(-50%)", width:30, height:12, background:"rgba(255,255,255,.5)", border:"1px solid rgba(0,0,0,.08)", boxShadow:"0 1px 2px rgba(0,0,0,.05)" }} />
          <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:"1.35rem", color:"#d94848", margin:0, lineHeight:1.1, fontWeight:700 }}>Memories are made here!</p>
        </div>

        {galleryImages[4] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "69%", top: 100, width: "15%", minWidth: 120, zIndex: 4, textDecoration: "none", background: "white", padding: "8px 8px 30px", boxShadow: "0 6px 20px rgba(0,0,0,.14)", transform: "rotate(7deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(7deg)"; el.style.zIndex="4"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.14)"; }}>
            <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[4].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
          </a>
        )}

        {galleryImages[5] && (
          <a href="/thu-vien" style={{ position: "absolute", left: "83%", top: 60, width: "14%", minWidth: 110, zIndex: 3, textDecoration: "none", background: "white", padding: "8px 8px 30px", boxShadow: "0 6px 20px rgba(0,0,0,.14)", transform: "rotate(-5deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(-5deg)"; el.style.zIndex="3"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.14)"; }}>
            <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[5].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
          </a>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 24, position: "relative", zIndex: 10 }}>
        <a href="/thu-vien" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 36px", borderRadius: 50, border: "2px solid #3a6b3a", color: "#3a6b3a", fontWeight: 700, fontSize: ".9rem", textDecoration: "none", background: "transparent", transition: "all .2s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background="#3a6b3a"; el.style.color="white"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background="transparent"; el.style.color="#3a6b3a"; }}>
          Xem Toàn Bộ Thư Viện <i className="fa-solid fa-images" />
        </a>
      </div>
    </section>
  );
}
