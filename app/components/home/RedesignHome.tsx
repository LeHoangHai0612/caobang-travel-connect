"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Guide, Destination } from "@/lib/database.types";
import MusicPlayer from "@/app/components/MusicPlayer";
import { initHomeEffects } from "./effects";

interface Tour {
  id: string; title: string; description: string; image_url: string;
  price_from: number; duration: string; group_size: string; zalo_number: string;
}

const FB_TOURS: Tour[] = [
  { id: "f1", title: "Vòng quanh Cao Bằng", description: "Hành trình xe máy qua những cung đèo đẹp nhất.", image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=80&auto=format", price_from: 2900000, duration: "3 ngày 2 đêm", group_size: "6–12 khách", zalo_number: "" },
  { id: "f2", title: "Thác Bản Giốc & Pác Bó", description: "Khám phá hai biểu tượng của Cao Bằng trong một ngày.", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg", price_from: 1500000, duration: "1 ngày", group_size: "4–8 khách", zalo_number: "" },
  { id: "f3", title: "Trekking Núi Mắt Thần", description: "Chinh phục ngọn núi có lỗ xuyên thủng độc nhất.", image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80&auto=format", price_from: 1800000, duration: "2 ngày", group_size: "4–10 khách", zalo_number: "" },
];

const FB_DESTS: Destination[] = [
  { id: "d1", title: "Thác Bản Giốc", description: "Trùng Khánh", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg", sort_order: 1, created_at: "" },
  { id: "d2", title: "Hang Pác Bó", description: "Hà Quảng", image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/1280px-Pac_Bo_Cave_Cao_Bang.jpg", sort_order: 2, created_at: "" },
  { id: "d3", title: "Đèo Mã Phục", description: "Quảng Hòa", image_url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=900&q=80&auto=format", sort_order: 3, created_at: "" },
];

export default function RedesignHome() {
  const [tours, setTours] = useState<Tour[]>(FB_TOURS);
  const [dests, setDests] = useState<Destination[]>(FB_DESTS);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [heroBg, setHeroBg] = useState("https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg");
  const [musicSrc, setMusicSrc] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: t }, { data: d }, { data: g }, { data: settings }] = await Promise.all([
        supabase.from("tours").select("id,title,description,image_url,price_from,duration,group_size,zalo_number").eq("is_active", true).order("sort_order").limit(6),
        supabase.from("destinations").select("*").order("sort_order").limit(6),
        supabase.from("guides").select("*").order("is_featured", { ascending: false }).order("rating", { ascending: false }).limit(6),
        supabase.from("site_settings").select("key,value"),
      ]);
      if (!alive) return;
      if (t && t.length) setTours(t as Tour[]);
      if (d && d.length) setDests(d as Destination[]);
      if (g && g.length) setGuides(g as Guide[]);
      if (settings) {
        const find = (k: string) => (settings as { key: string; value: string }[]).find((s) => s.key === k)?.value;
        if (find("hero_bg")) setHeroBg(find("hero_bg")!);
        if (find("background_music")) setMusicSrc(find("background_music")!);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const cleanup = initHomeEffects();
    return cleanup;
  }, []);

  const journeyStops = [
    { idx: "01", name: "Thác Bản Giốc", nav: "Bản Giốc", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg", desc: "Trùng Khánh — thác nước tự nhiên lớn nhất Đông Nam Á, nơi dòng Quây Sơn đổ trắng xóa giữa đại ngàn." },
    { idx: "02", name: "Hang Pác Bó", nav: "Pác Bó", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/1280px-Pac_Bo_Cave_Cao_Bang.jpg", desc: "Hà Quảng — suối Lê-nin trong vắt, núi Các Mác, cái nôi của cách mạng Việt Nam." },
    { idx: "03", name: "Hồ Thang Hen", nav: "Thang Hen", img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80&auto=format", desc: "Quảng Hòa — hồ nước ngọt trên núi cao, mặt nước phẳng lặng soi bóng mây trời." },
    { idx: "04", name: "Đèo Mã Phục", nav: "Mã Phục", img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80&auto=format", desc: "Cung đèo bảy tầng uốn lượn giữa hai bức tường đá vôi dựng đứng hùng vĩ." },
    { idx: "05", name: "Núi Mắt Thần", nav: "Mắt Thần", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format", desc: "Trà Lĩnh — ngọn núi có “con mắt” xuyên thủng độc nhất vô nhị giữa thảo nguyên." },
  ];

  const exp = [
    { n: "— 01", t: "Bình minh trên đèo", loc: "Mã Phục", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=80&auto=format", cls: "down" },
    { n: "— 02", t: "Hơi nước thác đổ", loc: "Bản Giốc", img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&q=80&auto=format", cls: "up" },
    { n: "— 03", t: "Mây phủ đỉnh non", loc: "Mắt Thần", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=80&auto=format", cls: "down" },
    { n: "— 04", t: "Sắc màu chợ phiên", loc: "Vùng cao", img: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1000&q=80&auto=format", cls: "up" },
    { n: "— 05", t: "Tĩnh lặng mặt hồ", loc: "Thang Hen", img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000&q=80&auto=format", cls: "down" },
  ];

  return (
    <div className="nw">
      <div className="nw-cur-dot" /><div className="nw-cur-ring"><span className="nw-cur-label">Xem</span></div>

      <div className="nw-intro">
        <div className="nw-intro-eye">Non nước nơi đỉnh trời</div>
        <div className="nw-intro-brand"><span>Cao <em>Bằng</em></span></div>
        <div className="nw-intro-foot">
          <p className="nw-intro-tag">Hành trình khám phá vùng đất công viên địa chất toàn cầu.</p>
          <div className="nw-intro-count">0%</div>
        </div>
        <div className="nw-intro-bar" />
      </div>

      <header className="nw-hd">
        <div className="nw-wrap nw-nav">
          <Link href="/" className="nw-brand"><span className="d" /> CAO BẰNG</Link>
          <ul className="nw-menu">
            <li><Link href="/tour" data-hov>Tour</Link></li>
            <li><Link href="/diem-den" data-hov>Điểm đến</Link></li>
            <li><Link href="/hdv" data-hov>Hướng dẫn viên</Link></li>
            <li><Link href="/cam-nang" data-hov>Cẩm nang</Link></li>
          </ul>
          <Link href="/dat-lich" className="nw-cta" data-magnetic>Đặt tour ↗</Link>
          <button className="nw-burger" aria-label="Menu"><span /><span /><span /></button>
        </div>
      </header>

      <nav className="nw-mm">
        <Link href="/tour">Tour</Link>
        <Link href="/diem-den">Điểm đến</Link>
        <Link href="/hdv">Hướng dẫn viên</Link>
        <Link href="/cam-nang">Cẩm nang</Link>
        <Link href="/dat-lich">Đặt tour ngay ↗</Link>
      </nav>

      <section className="nw-hero">
        <div className="nw-hero-bg" id="nw-heroBg"><img src={heroBg} alt="Cao Bằng" /></div>
        <div className="nw-wrap nw-hero-inner">
          <div className="nw-eye"><span className="ln" /> Đông Bắc Việt Nam · Công viên địa chất toàn cầu</div>
          <h1>Lạc bước giữa<br /><em>non nước</em> Cao Bằng</h1>
          <div className="nw-hero-row">
            <p className="nw-hero-sub">Thác Bản Giốc hùng vĩ, hang Pác Bó huyền thoại, những cung đèo xanh ngút ngàn — hành trình do hướng dẫn viên bản địa dẫn lối.</p>
            <div className="nw-hmeta">
              <div><div className="n">50+</div><div className="l">Tour</div></div>
              <div><div className="n">30+</div><div className="l">HDV bản địa</div></div>
              <div><div className="n">4.9</div><div className="l">Đánh giá</div></div>
            </div>
          </div>
        </div>
        <div className="nw-cue">Cuộn để khám phá<div className="bar" /></div>
      </section>

      <div className="nw-mq"><div className="nw-mq-track">
        {["Thác Bản Giốc", "Hang Pác Bó", "Hồ Thang Hen", "Đèo Mã Phục", "Núi Mắt Thần", "Thác Bản Giốc", "Hang Pác Bó", "Hồ Thang Hen", "Đèo Mã Phục", "Núi Mắt Thần"].map((m, k) => (
          <span key={k}>{m}</span>
        ))}
      </div></div>

      <section className="nw-journey">
        <div className="nw-jsticky">
          <div className="nw-jhead"><div className="k">Hành trình</div><div className="t">Một vòng Cao Bằng — cuộn để khám phá</div></div>
          {journeyStops.map((s) => (
            <div className="nw-jstop" data-j key={s.idx}>
              <img src={s.img} alt={s.name} />
              <div className="nw-jcap"><div className="nw-jidx">{s.idx}</div><h3>{s.name}</h3><p>{s.desc}</p></div>
            </div>
          ))}
          <ul className="nw-jnav">
            {journeyStops.map((s) => (<li data-jn key={s.idx}><span>{s.nav}</span><span className="ln" /></li>))}
          </ul>
          <div className="nw-jbar"><span /></div>
        </div>
      </section>

      <section className="nw-sec">
        <div className="nw-wrap nw-intro2">
          <div className="nw-introimg nw-rv" data-media><img src="https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&q=80&auto=format" alt="" /></div>
          <div className="nw-rv">
            <div className="nw-sh"><span className="nw-snum">01</span><span className="nw-kick">Về chúng tôi</span></div>
            <p className="nw-lead">Chúng tôi không bán tour — chúng tôi mở cánh cửa đến vùng đất của riêng người Cao Bằng.</p>
            <p>Mỗi hành trình được thiết kế cùng hướng dẫn viên là người con bản địa: hiểu từng con đèo, từng phiên chợ vùng cao, từng câu chuyện sau mỗi ngọn thác. Bạn không chỉ ngắm cảnh — bạn sống cùng nó.</p>
            <Link href="/hdv" className="nw-link" data-hov>Gặp các hướng dẫn viên →</Link>
          </div>
        </div>
      </section>

      <section className="nw-sec nw-tours">
        <div className="nw-wrap">
          <div className="nw-sh nw-rv"><span className="nw-snum">02</span><span className="nw-kick">Hành trình nổi bật</span></div>
          <h2 className="nw-stitle nw-rv">Những chuyến đi <em>đáng nhớ</em> nhất</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }}>
            {tours.map((t) => (
              <Link href={`/tour/${t.id}`} key={t.id} className="nw-tcard nw-rv" data-tilt data-media style={{ minHeight: 360 }}>
                {t.image_url ? <img src={t.image_url} alt={t.title} /> : null}
                {t.price_from > 0 && <span className="price">{t.price_from.toLocaleString("vi-VN")}đ</span>}
                <div className="nw-tbody">
                  <span className="tag">{t.duration}</span>
                  <h3>{t.title}</h3>
                  <div className="meta"><span>◷ {t.duration}</span><span>◍ {t.group_size}</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="nw-sec">
        <div className="nw-wrap">
          <div className="nw-sh nw-rv"><span className="nw-snum">03</span><span className="nw-kick">Điểm đến</span></div>
          <h2 className="nw-stitle nw-rv">Vùng đất của <em>mây và đá</em></h2>
          <div className="nw-dgrid">
            {dests.slice(0, 6).map((d) => (
              <Link href={`/diem-den/${d.id}`} key={d.id} className="nw-dcard nw-rv" data-media>
                <img src={d.image_url} alt={d.title} />
                <div className="nw-dbody"><div className="loc">Cao Bằng</div><h3>{d.title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="nw-hx" id="nw-hx">
        <div className="nw-hx-inner">
          <div className="nw-hx-track" id="nw-hxTrack">
            <div className="nw-hx-intro">
              <div className="nw-sh"><span className="nw-snum">04</span><span className="nw-kick">Trải nghiệm</span></div>
              <h2>Cuộn ngang để <em>chạm</em> vào từng khoảnh khắc</h2>
              <p>Không phải điểm dừng chân — đây là những lát cắt cảm xúc của một vùng đất. Kéo sang ngang để tiếp tục.</p>
            </div>
            {exp.map((e) => (
              <article className={`nw-hx-panel ${e.cls}`} key={e.n}>
                <div className="ph"><img data-par src={e.img} alt={e.t} /></div>
                <div className="nw-hx-cap"><span className="num">{e.n}</span><h3>{e.t}</h3><div className="loc">{e.loc}</div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nw-feel">
        <div className="nw-hero-bg"><img src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80&auto=format" alt="" /></div>
        <div className="nw-wrap nw-feel-in">
          <p className="nw-feel-k">Bán cảm giác, không bán vé</p>
          <blockquote>Có những nơi bạn không chỉ <em>đến</em> —<br />bạn <em>thuộc về</em> nó.</blockquote>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="nw-sec">
          <div className="nw-wrap">
            <div className="nw-sh nw-rv"><span className="nw-snum">05</span><span className="nw-kick">Người dẫn lối</span></div>
            <h2 className="nw-stitle nw-rv">Hướng dẫn viên <em>bản địa</em></h2>
            <div className="nw-dgrid">
              {guides.slice(0, 6).map((g) => (
                <Link href={`/hdv/${g.id}`} key={g.id} className="nw-dcard nw-rv" data-media>
                  <img src={g.image_url} alt={g.name} />
                  <div className="nw-dbody"><div className="loc">{g.specialty || "Hướng dẫn viên"}</div><h3>{g.name}</h3></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="nw-stats">
        <div className="nw-sec nw-wrap nw-stat-grid">
          <div className="nw-stat nw-rv"><div className="n" data-count="12">0</div><div className="l">Năm kinh nghiệm</div></div>
          <div className="nw-stat nw-rv"><div className="n" data-count="8500">0</div><div className="l">Du khách hài lòng</div></div>
          <div className="nw-stat nw-rv"><div className="n" data-count="30">0</div><div className="l">Hướng dẫn viên bản địa</div></div>
          <div className="nw-stat nw-rv"><div className="n">4.9/5</div><div className="l">Điểm đánh giá</div></div>
        </div>
      </section>

      <section className="nw-bigcta">
        <div className="nw-hero-bg"><img src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=80&auto=format" alt="" /></div>
        <div className="nw-wrap" style={{ position: "relative", zIndex: 2, width: "100%", textAlign: "center" }}>
          <h2 className="nw-rv">Sẵn sàng cho<br />hành trình của bạn?</h2>
          <Link href="/dat-lich" className="nw-btn nw-rv" data-magnetic>Đặt tour ngay ↗</Link>
        </div>
      </section>

      <footer className="nw-foot">
        <div className="nw-wrap">
          <div className="nw-foot-top">
            <div><div className="nw-foot-brand">Cao Bằng<br /><span>Travel Connect</span></div></div>
            <div><h5>Khám phá</h5><ul><li><Link href="/tour">Tour</Link></li><li><Link href="/diem-den">Điểm đến</Link></li><li><Link href="/hdv">Hướng dẫn viên</Link></li><li><Link href="/cam-nang">Cẩm nang</Link></li></ul></div>
            <div><h5>Hỗ trợ</h5><ul><li><Link href="/dat-lich">Đặt lịch</Link></li><li><Link href="/tai-khoan">Tài khoản</Link></li></ul></div>
            <div><h5>Kết nối</h5><ul><li><a href="https://www.facebook.com/CaoBangTravelNature/" target="_blank" rel="noopener noreferrer">Facebook</a></li><li><a href="https://www.instagram.com/caobang.travel/" target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href="https://www.tiktok.com/@caobang.travel" target="_blank" rel="noopener noreferrer">TikTok</a></li></ul></div>
          </div>
          <div className="nw-foot-bot"><span>© 2026 Cao Bằng Travel Connect</span><span>Khám phá vùng đất nơi đỉnh trời</span></div>
        </div>
      </footer>

      {musicSrc ? <MusicPlayer src={musicSrc} /> : null}
    </div>
  );
}
