"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    SC: any;
  }
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

/* ─── MP3 Player ─── */
function Mp3Player({ src }: { src: string }) {
  const audioRef            = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState<"idle"|"loading"|"ready"|"error">("idle");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    setStatus("loading");
    audio.volume = 1;
    audio.loop   = true;
    audio.load();

    const tryPlay = async () => {
      try { await audio.play(); setPlaying(true); setStatus("ready"); }
      catch {
        const onInteract = async () => {
          try { await audio.play(); setPlaying(true); setStatus("ready"); } catch { setStatus("ready"); }
          document.removeEventListener("click",      onInteract);
          document.removeEventListener("touchstart", onInteract);
        };
        document.addEventListener("click",      onInteract, { once: true });
        document.addEventListener("touchstart", onInteract, { once: true });
        setStatus("ready");
      }
    };
    tryPlay();
  }, [src]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { try { await audio.play(); setPlaying(true); } catch { setStatus("error"); } }
  };

  return <PlayerShell playing={playing} expanded={expanded} setExpanded={setExpanded}
    volume={volume} setVolume={setVolume} toggle={toggle} status={status}>
    <audio ref={audioRef} src={src} loop preload="auto"
      onCanPlay={() => setStatus("ready")}
      onError={() => { setStatus("error"); setPlaying(false); }} />
  </PlayerShell>;
}

/* ─── YouTube Player ─── */
function YouTubePlayer({ videoId }: { videoId: string }) {
  const ytRef               = useRef<any>(null);
  const playerDivId         = useRef(`yt-bg-${videoId}`);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(100);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState<"idle"|"loading"|"ready"|"error">("loading");

  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled) return;
      ytRef.current = new window.YT.Player(playerDivId.current, {
        height: "120", width: "120",
        videoId,
        playerVars: { autoplay: 1, loop: 1, playlist: videoId, controls: 0, rel: 0, iv_load_policy: 3 },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            e.target.setVolume(100);
            setStatus("ready");
            try { e.target.playVideo(); } catch { /* blocked */ }
            const onInteract = () => {
              try { e.target.playVideo(); } catch { /* ignore */ }
            };
            document.addEventListener("click",      onInteract, { once: true });
            document.addEventListener("touchstart", onInteract, { once: true });
          },
          onStateChange: (e: any) => {
            if (!cancelled) setPlaying(e.data === window.YT?.PlayerState?.PLAYING);
          },
          onError: () => { if (!cancelled) setStatus("error"); },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      // Giữ callback cũ nếu có (tránh ghi đè)
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") prev();
        createPlayer();
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      try { ytRef.current?.destroy(); } catch { /* ignore */ }
    };
  }, [videoId]);

  useEffect(() => { try { ytRef.current?.setVolume(volume); } catch { /* ignore */ } }, [volume]);

  const toggle = () => {
    if (!ytRef.current) return;
    try {
      if (playing) { ytRef.current.pauseVideo(); }
      else         { ytRef.current.playVideo();  }
    } catch { /* ignore */ }
  };

  return <PlayerShell playing={playing} expanded={expanded} setExpanded={setExpanded}
    volume={volume / 100} setVolume={v => setVolume(Math.round(v * 100))}
    toggle={toggle} status={status}>
    {/* YouTube player — cần trong viewport để browser load */}
    <div style={{ position: "fixed", bottom: 80, right: 22, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
      <div id={playerDivId.current} style={{ width: 120, height: 120 }} />
    </div>
  </PlayerShell>;
}

/* ─── Shared Shell UI ─── */
function PlayerShell({ playing, expanded, setExpanded, volume, setVolume, toggle, status, children }: {
  playing: boolean; expanded: boolean; setExpanded: (v: boolean) => void;
  volume: number; setVolume: (v: number) => void;
  toggle: () => void; status: string; children?: React.ReactNode;
}) {
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

      {children}

      <div style={{ position: "fixed", bottom: 22, right: 22, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        {expanded && (
          <div className="mpanel" style={{ background: "rgba(10,28,26,.92)", backdropFilter: "blur(20px)", borderRadius: 18, padding: "16px 18px", width: 240, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
            <p style={{ fontSize: ".68rem", fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>🎵 Nhạc nền</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <button className="play-btn" onClick={toggle}
                style={{ background: playing ? "#3a9490" : "rgba(255,255,255,.18)", boxShadow: playing ? "0 0 16px rgba(58,148,144,.5)" : "none" }}>
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
                    {status === "loading" ? "Đang tải..." : status === "error" ? "⚠ Lỗi" : "Nhấn để phát"}
                  </span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-volume-off" style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }} />
              <input type="range" className="vol-sl" min={0} max={1} step={0.02}
                value={volume} onChange={e => setVolume(parseFloat(e.target.value))} />
              <i className="fa-solid fa-volume-high" style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }} />
            </div>
          </div>
        )}

        <button className="music-fab"
          onClick={() => { setExpanded(!expanded); }}
          style={{
            background: playing ? "linear-gradient(135deg,#265C59,#3a9490)" : "rgba(15,40,35,.85)",
            backdropFilter: "blur(10px)",
            boxShadow: playing ? "0 4px 24px rgba(58,148,144,.6),0 0 0 4px rgba(58,148,144,.15)" : "0 4px 20px rgba(0,0,0,.4)",
          }} title="Nhạc nền">
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

/* ─── SoundCloud Player ─── */
function SoundCloudPlayer({ trackUrl }: { trackUrl: string }) {
  const iframeRef           = useRef<HTMLIFrameElement>(null);
  const widgetRef           = useRef<any>(null);
  const [playing, setPlaying]   = useState(false);
  const [volume, setVolume]     = useState(100);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus]     = useState<"idle"|"loading"|"ready"|"error">("loading");

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&buying=false&sharing=false&download=false`;

  useEffect(() => {
    let cancelled = false;

    const initWidget = () => {
      if (cancelled || !iframeRef.current || !window.SC) return;
      const SC = window.SC;
      widgetRef.current = SC.Widget(iframeRef.current);
      widgetRef.current.bind(SC.Widget.Events.READY, () => {
        if (cancelled) return;
        widgetRef.current.setVolume(100);
        setStatus("ready");
        try { widgetRef.current.play(); } catch { /* blocked */ }
        const onInteract = () => {
          try { widgetRef.current?.play(); } catch { /* ignore */ }
        };
        document.addEventListener("click",      onInteract, { once: true });
        document.addEventListener("touchstart", onInteract, { once: true });
      });
      widgetRef.current.bind(SC.Widget.Events.PLAY,  () => { if (!cancelled) setPlaying(true);  });
      widgetRef.current.bind(SC.Widget.Events.PAUSE, () => { if (!cancelled) setPlaying(false); });
      widgetRef.current.bind(SC.Widget.Events.ERROR, () => { if (!cancelled) setStatus("error"); });
    };

    if (window.SC) {
      initWidget();
    } else if (!document.querySelector('script[src*="soundcloud.com/player/api"]')) {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.onload = () => initWidget();
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => { if (window.SC) { clearInterval(check); initWidget(); } }, 150);
      setTimeout(() => clearInterval(check), 6000);
    }

    return () => { cancelled = true; };
  }, [trackUrl]);

  useEffect(() => { try { widgetRef.current?.setVolume(volume); } catch { /* ignore */ } }, [volume]);

  const toggle = () => {
    if (!widgetRef.current) return;
    try {
      if (playing) widgetRef.current.pause();
      else         widgetRef.current.play();
    } catch { /* ignore */ }
  };

  return <PlayerShell playing={playing} expanded={expanded} setExpanded={setExpanded}
    volume={volume / 100} setVolume={v => setVolume(Math.round(v * 100))}
    toggle={toggle} status={status}>
    <div style={{ position: "fixed", bottom: 80, right: 22, opacity: 0, pointerEvents: "none", zIndex: -1 }}>
      <iframe ref={iframeRef} width="300" height="166" scrolling="no" frameBorder="no"
        allow="autoplay" src={embedUrl} />
    </div>
  </PlayerShell>;
}

/* ─── Helpers ─── */
function getSoundCloudUrl(url: string): string | null {
  return url.includes("soundcloud.com") ? url : null;
}

/* ─── Main export — tự nhận diện mp3 / YouTube / SoundCloud ─── */
export default function MusicPlayer({ src }: { src: string }) {
  if (!src) return null;
  const ytId = getYouTubeId(src);
  if (ytId) return <YouTubePlayer videoId={ytId} />;
  const scUrl = getSoundCloudUrl(src);
  if (scUrl) return <SoundCloudPlayer trackUrl={scUrl} />;
  return <Mp3Player src={src} />;
}
