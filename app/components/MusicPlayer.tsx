"use client";

import { useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "ready" | "error";

export default function MusicPlayer({ src }: { src: string }) {
  const audioRef            = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState<Status>("idle");

  // Reset + autoplay khi URL thay đổi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!src) { setStatus("idle"); return; }

    setStatus("loading");
    audio.volume = 1;
    audio.loop   = true;
    audio.load();

    // Thử phát ngay (có thể bị block nếu chưa tương tác)
    const tryPlay = async () => {
      try {
        await audio.play();
        setPlaying(true);
        setStatus("ready");
      } catch {
        // Chờ tương tác đầu tiên của người dùng
        const onInteract = async () => {
          try {
            await audio.play();
            setPlaying(true);
            setStatus("ready");
          } catch { setStatus("ready"); }
          document.removeEventListener("click",      onInteract);
          document.removeEventListener("touchstart", onInteract);
          document.removeEventListener("keydown",    onInteract);
        };
        document.addEventListener("click",      onInteract, { once: true });
        document.addEventListener("touchstart", onInteract, { once: true });
        document.addEventListener("keydown",    onInteract, { once: true });
        setStatus("ready");
      }
    };
    tryPlay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Đồng bộ volume với audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      setStatus("loading");
      try {
        await audio.play();
        setPlaying(true);
        setStatus("ready");
      } catch {
        setStatus("error");
        setPlaying(false);
      }
    }
  };

  if (!src) return null;

  const errorMsg = status === "error"
    ? "Không thể phát. Kiểm tra URL nhạc."
    : null;

  return (
    <>
      <style>{`
        @keyframes bar1{0%,100%{height:4px}50%{height:14px}}
        @keyframes bar2{0%,100%{height:10px}50%{height:4px}}
        @keyframes bar3{0%,100%{height:7px}50%{height:16px}}
        @keyframes bar4{0%,100%{height:14px}50%{height:5px}}
        .mbars{display:flex;align-items:flex-end;gap:2px;height:18px}
        .mbar{width:3px;border-radius:2px;background:currentColor}
        .mb1{animation:bar1 .8s ease-in-out infinite}
        .mb2{animation:bar2 .7s ease-in-out infinite .1s}
        .mb3{animation:bar3 .9s ease-in-out infinite .2s}
        .mb4{animation:bar4 .75s ease-in-out infinite .05s}
        .mpanel{animation:mup .22s ease}
        @keyframes mup{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .vol-sl{-webkit-appearance:none;height:4px;border-radius:4px;background:rgba(255,255,255,.22);outline:none;cursor:pointer;width:100%}
        .vol-sl::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:white;cursor:pointer}
        .play-btn{width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:all .2s;color:white}
        .music-fab{width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .28s;color:white;font-size:19px}
      `}</style>

      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onCanPlayThrough={() => setStatus("ready")}
        onCanPlay={() => setStatus("ready")}
        onError={() => { setStatus("error"); setPlaying(false); }}
        onEnded={() => setPlaying(false)}
      />

      <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>

        {/* Panel mở rộng */}
        {expanded && (
          <div className="mpanel" style={{
            background: "rgba(10,28,26,.92)", backdropFilter: "blur(20px)",
            borderRadius: 18, padding: "16px 18px", width: 240,
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 12px 40px rgba(0,0,0,.5)",
          }}>
            {/* Header */}
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>
              🎵 Nhạc nền
            </p>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <button
                className="play-btn"
                onClick={toggle}
                style={{ background: playing ? "#3a9490" : "rgba(255,255,255,.18)", boxShadow: playing ? "0 0 16px rgba(58,148,144,.5)" : "none" }}
              >
                {status === "loading"
                  ? <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 13 }} />
                  : <i className={`fa-solid fa-${playing ? "pause" : "play"}`} />}
              </button>

              {playing
                ? <div className="mbars" style={{ color: "#5eead4" }}>
                    <div className="mbar mb1"/><div className="mbar mb2"/>
                    <div className="mbar mb3"/><div className="mbar mb4"/>
                  </div>
                : <span style={{ fontSize: ".78rem", color: "rgba(255,255,255,.45)", lineHeight: 1.4 }}>
                    {status === "loading" ? "Đang tải..." : status === "error" ? "⚠ Lỗi URL" : "Nhấn để phát"}
                  </span>}
            </div>

            {/* Error */}
            {errorMsg && (
              <p style={{ fontSize: ".72rem", color: "#f87171", marginBottom: 10, lineHeight: 1.5 }}>{errorMsg}</p>
            )}

            {/* Volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-volume-off" style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }} />
              <input type="range" className="vol-sl" min={0} max={1} step={0.02}
                value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
              <i className="fa-solid fa-volume-high" style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }} />
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          className="music-fab"
          onClick={() => {
            setExpanded((v) => !v);
            // Nếu chưa phát và đang mở panel → tự động thử phát
            if (!expanded && !playing) {
              setTimeout(() => toggle(), 80);
            }
          }}
          style={{
            background: playing
              ? "linear-gradient(135deg,#265C59,#3a9490)"
              : "rgba(15,40,35,.85)",
            backdropFilter: "blur(10px)",
            boxShadow: playing
              ? "0 4px 24px rgba(58,148,144,.6), 0 0 0 4px rgba(58,148,144,.15)"
              : "0 4px 20px rgba(0,0,0,.4)",
          }}
          title="Nhạc nền"
        >
          {playing
            ? <div className="mbars" style={{ color: "white" }}>
                <div className="mbar mb1"/><div className="mbar mb2"/>
                <div className="mbar mb3"/><div className="mbar mb4"/>
              </div>
            : <i className="fa-solid fa-music" />}
        </button>
      </div>
    </>
  );
}
