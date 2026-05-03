"use client";

import { useEffect, useRef, useState } from "react";

export default function MusicPlayer({ src }: { src: string }) {
  const audioRef  = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(0.35);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady]       = useState(false);

  // Khi src thay đổi, load bài mới
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.volume = volume;
    audio.loop   = true;
    setReady(false);
    audio.load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (!src) return null;

  return (
    <>
      <style>{`
        @keyframes bar1 { 0%,100%{height:4px} 50%{height:14px} }
        @keyframes bar2 { 0%,100%{height:10px} 50%{height:4px} }
        @keyframes bar3 { 0%,100%{height:7px} 50%{height:16px} }
        @keyframes bar4 { 0%,100%{height:14px} 50%{height:5px} }
        .music-bars { display:flex; align-items:flex-end; gap:2px; height:18px; }
        .music-bar  { width:3px; border-radius:2px; background:currentColor; }
        .music-bar.b1 { animation: bar1 .8s ease-in-out infinite; }
        .music-bar.b2 { animation: bar2 .7s ease-in-out infinite .1s; }
        .music-bar.b3 { animation: bar3 .9s ease-in-out infinite .2s; }
        .music-bar.b4 { animation: bar4 .75s ease-in-out infinite .05s; }
        .music-panel { animation: slideUp .25s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        input[type=range].vol-slider { -webkit-appearance:none; height:4px; border-radius:4px; background:rgba(255,255,255,.25); outline:none; cursor:pointer; }
        input[type=range].vol-slider::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:white; cursor:pointer; }
      `}</style>

      <audio
        ref={audioRef}
        src={src}
        loop
        preload="metadata"
        onCanPlay={() => setReady(true)}
        onEnded={() => setPlaying(false)}
      />

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>

        {/* Expanded panel */}
        {expanded && (
          <div className="music-panel" style={{
            background: "rgba(20,40,35,.88)", backdropFilter: "blur(16px)",
            borderRadius: 16, padding: "14px 18px", minWidth: 230,
            border: "1px solid rgba(255,255,255,.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,.35)",
            color: "white",
          }}>
            {/* Title */}
            <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,.55)", fontWeight: 600, marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>
              🎵 Nhạc nền Cao Bằng
            </p>

            {/* Play / Pause row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <button onClick={toggle} disabled={!ready}
                style={{ width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer", background: playing ? "#3a9490" : "rgba(255,255,255,.15)", color: "white", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                <i className={`fa-solid fa-${playing ? "pause" : "play"}`} />
              </button>
              {playing
                ? <div className="music-bars" style={{ color: "#5eead4" }}>
                    <div className="music-bar b1" /><div className="music-bar b2" />
                    <div className="music-bar b3" /><div className="music-bar b4" />
                  </div>
                : <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.5)" }}>{ready ? "Nhấn để phát" : "Đang tải..."}</span>}
            </div>

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <i className="fa-solid fa-volume-low" style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }} />
              <input
                type="range" className="vol-slider"
                min={0} max={1} step={0.05}
                value={volume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <i className="fa-solid fa-volume-high" style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }} />
            </div>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "none", cursor: "pointer",
            background: playing ? "linear-gradient(135deg,#265C59,#3a9490)" : "rgba(30,50,45,.82)",
            backdropFilter: "blur(8px)",
            color: "white", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: playing ? "0 4px 20px rgba(58,148,144,.5)" : "0 4px 16px rgba(0,0,0,.3)",
            transition: "all .25s",
            position: "relative",
          }}
          title={expanded ? "Đóng" : "Nhạc nền"}
        >
          {playing
            ? <div className="music-bars" style={{ color: "white" }}>
                <div className="music-bar b1" /><div className="music-bar b2" />
                <div className="music-bar b3" /><div className="music-bar b4" />
              </div>
            : <i className="fa-solid fa-music" />}
        </button>
      </div>
    </>
  );
}
