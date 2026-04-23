"use client";

import React, { useState, useEffect } from "react";

export default function CaoBangEcoTour() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Hiệu ứng cuộn trang mượt
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.getElementById(targetId);
    const header = document.getElementById("site-header");
    if (target && header) {
      const offset = header.offsetHeight + 10;
      window.scrollTo({ top: target.offsetTop - offset, behavior: "smooth" });
    }
  };

  // Thiết lập các Event Listener và Intersection Observer
  useEffect(() => {
    // Xử lý shadow cho Header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Xử lý số lượng thẻ hiển thị trên Carousel (Responsive)
    const handleResize = () => {
      setCardsPerPage(window.innerWidth <= 768 ? 1 : 3);
    };
    handleResize(); // Chạy lần đầu
    window.addEventListener("resize", handleResize);

    // Intersection Observer cho hiệu ứng Fade Up
    const fadeEls = document.querySelectorAll(".fade-up");
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    fadeEls.forEach((el) => fadeObserver.observe(el));

    // Intersection Observer cho Active Menu Links
    const sections = document.querySelectorAll("section[id], footer[id]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      fadeObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  // Dữ liệu Đánh giá của khách hàng (Carousel)
  const reviews = [
    {
      stars: 5,
      text: '"Chuyến đi Cao Bằng của tôi trở nên hoàn hảo nhờ anh A Tùng. Anh ấy không chỉ là hướng dẫn viên mà còn như người bạn đồng hành, kể những câu chuyện thú vị về văn hóa người Nùng mà không sách nào có được."',
      name: "Kiên Đỗ",
      desc: "Du khách từ Hà Nội · Tháng 3/2024",
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    },
    {
      stars: 5,
      text: '"Tôi đã đặt tour cùng Chị Hoa và hoàn toàn bị chinh phục. Từ Thác Bản Giốc đến Động Ngườm Ngao, mọi trải nghiệm đều được sắp xếp chu đáo. Chắc chắn sẽ quay lại lần sau!"',
      name: "Kim Vang",
      desc: "Du khách từ TP.HCM · Tháng 2/2024",
      img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
    },
    {
      stars: 5,
      text: '"Hành trình phượt xe máy 3 ngày cùng Anh Hùng thật sự là trải nghiệm đáng nhớ trong đời. Cung đường đẹp mê hồn, đồ ăn địa phương ngon tuyệt và sự nhiệt tình của HDV làm tôi vô cùng ấn tượng."',
      name: "Alex Khánh",
      desc: "Du khách quốc tế · Tháng 1/2024",
      img: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face",
    },
    {
      stars: 5,
      text: '"Gia đình tôi 5 người đặt tour đoàn, mọi thứ từ lịch trình, ăn uống đến chỗ nghỉ đều được sắp xếp hoàn hảo. HDV rất kiên nhẫn với các bé. Cảm ơn Cao Bằng Eco Tour!"',
      name: "Hương Trần",
      desc: "Du khách từ Đà Nẵng · Tháng 4/2024",
      img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face",
    },
    {
      stars: 4.5,
      text: '"Tour Hồ Thang Hen và Làng Khuổi Ky thật ấn tượng. Chị Thu giải thích mọi thứ rất tỉ mỉ, giúp tôi hiểu sâu hơn về văn hóa dân tộc Tày. Phong cảnh đẹp không kém gì Hà Giang!"',
      name: "Minh Tuấn",
      desc: "Du khách từ Hải Phòng · Tháng 5/2024",
      img: "https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=100&h=100&fit=crop&crop=face",
    },
    {
      stars: 5,
      text: '"Chuyến đi Pác Bó cùng Chị Lan thực sự cảm động. Được nghe kể về lịch sử qua lời HDV địa phương khiến tôi hiểu và trân trọng hơn giá trị lịch sử của nơi đây. Rất đáng để ghé thăm!"',
      name: "Ngọc Ánh",
      desc: "Du khách từ Cần Thơ · Tháng 6/2024",
      img: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const totalPages = Math.ceil(reviews.length / cardsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  return (
    <>
      {/* ==================== HEADER ==================== */}
      <header id="site-header" className={isScrolled ? "scrolled" : ""}>
        <div className="container">
          <nav role="navigation" aria-label="Điều hướng chính">
            <a href="#hero" className="nav-logo" onClick={(e) => scrollToSection(e, "hero")}>
              <div className="nav-logo-icon" aria-hidden="true">
                <i className="fa-solid fa-mountain-sun"></i>
              </div>
              <div className="nav-logo-text">
                <strong>Cao Bằng</strong>
                <span>Eco Tour</span>
              </div>
            </a>

            <ul className="nav-links" role="list">
              <li>
                <a href="#hero" className={activeSection === "hero" ? "active" : ""} onClick={(e) => scrollToSection(e, "hero")}>
                  Trang Chủ
                </a>
              </li>
              <li>
                <a href="#why-us" className={activeSection === "why-us" ? "active" : ""} onClick={(e) => scrollToSection(e, "why-us")}>
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="#team" className={activeSection === "team" ? "active" : ""} onClick={(e) => scrollToSection(e, "team")}>
                  Dịch Vụ HDV
                </a>
              </li>
              <li>
                <a href="#destinations" className={activeSection === "destinations" ? "active" : ""} onClick={(e) => scrollToSection(e, "destinations")}>
                  Điểm Đến
                </a>
              </li>
              <li>
                <a href="#gallery" className={activeSection === "gallery" ? "active" : ""} onClick={(e) => scrollToSection(e, "gallery")}>
                  Thư Viện
                </a>
              </li>
              <li>
                <a href="#pricing" className={activeSection === "pricing" ? "active" : ""} onClick={(e) => scrollToSection(e, "pricing")}>
                  Cẩm Nang
                </a>
              </li>
            </ul>

            <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
              <i className="fa-solid fa-calendar-check" aria-hidden="true"></i> ĐẶT HDV NGAY
            </a>

            <button
              className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
              id="hamburger-btn"
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </nav>
        </div>

        {/* Mobile Nav */}
        <nav className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`} id="mobile-nav" aria-label="Menu điều hướng di động">
          <a href="#hero" onClick={(e) => scrollToSection(e, "hero")}>Trang Chủ</a>
          <a href="#why-us" onClick={(e) => scrollToSection(e, "why-us")}>Giới Thiệu</a>
          <a href="#team" onClick={(e) => scrollToSection(e, "team")}>Dịch Vụ HDV</a>
          <a href="#destinations" onClick={(e) => scrollToSection(e, "destinations")}>Điểm Đến</a>
          <a href="#gallery" onClick={(e) => scrollToSection(e, "gallery")}>Thư Viện Ảnh</a>
          <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")}>Cẩm Nang</a>
          <a href="#footer" onClick={(e) => scrollToSection(e, "footer")}>Liên Hệ</a>
          <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
            <i className="fa-solid fa-calendar-check"></i> ĐẶT HDV NGAY
          </a>
        </nav>
      </header>

      <main>
        {/* ==================== HERO ==================== */}
        <section className="hero" id="hero" aria-label="Ảnh bìa - Khám phá Cao Bằng">
          <div className="hero-bg" role="img" aria-label="Thác Bản Giốc Cao Bằng nhìn từ phía Việt Nam"></div>
          <div className="hero-overlay" aria-hidden="true"></div>

          <div className="hero-content">
            <div className="hero-badge" aria-label="Hướng dẫn viên địa phương">
              <i className="fa-solid fa-leaf"></i> Hướng Dẫn Viên Địa Phương · Cao Bằng, Việt Nam
            </div>

            <h1>Khám Phá Cao Bằng<br />Cùng Hướng Dẫn Viên Địa Phương</h1>
            <p className="hero-tagline">Chuyên Nghiệp · Am Hiểu · Tận Tâm</p>
            <p className="hero-sub">Hành trình trọn vẹn, trải nghiệm chân thực</p>

            <div className="hero-actions">
              <a href="#team" className="btn-hero-primary" onClick={(e) => scrollToSection(e, "team")}>
                <i className="fa-solid fa-compass" aria-hidden="true"></i> XEM CÁC HDV & TOUR
              </a>
              <a href="#destinations" className="btn-hero-outline" onClick={(e) => scrollToSection(e, "destinations")}>
                <i className="fa-solid fa-map-location-dot" aria-hidden="true"></i> KHÁM PHÁ ĐIỂM ĐẾN
              </a>
            </div>
          </div>

          <div className="hero-stats" aria-label="Thống kê dịch vụ">
            <div className="hero-stat"><strong>50+</strong><span>Hướng Dẫn Viên</span></div>
            <div className="hero-stat"><strong>2000+</strong><span>Du Khách Hài Lòng</span></div>
            <div className="hero-stat"><strong>30+</strong><span>Điểm Tham Quan</span></div>
            <div className="hero-stat"><strong>5★</strong><span>Đánh Giá TB</span></div>
          </div>
        </section>

        {/* ==================== WHY CHOOSE US ==================== */}
        <section className="why-us" id="why-us" aria-labelledby="why-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag">Vì Sao Chọn Chúng Tôi</span>
              <h2 className="section-title" id="why-heading">Tại Sao Chọn Chúng Tôi?</h2>
              <p className="section-subtitle">Chúng tôi cung cấp những trải nghiệm du lịch sinh thái độc đáo và chân thực nhất tại Cao Bằng</p>
            </div>

            <div className="features-grid">
              <article className="feature-card fade-up">
                <div className="feature-icon" aria-hidden="true"><i className="fa-solid fa-map-pin"></i></div>
                <h3>Kiến Thức Bản Địa Điểm</h3>
                <p>Hướng dẫn viên sinh ra và lớn lên tại Cao Bằng, am hiểu sâu về văn hóa, lịch sử và địa hình từng điểm đến bản địa.</p>
              </article>
              <article className="feature-card fade-up">
                <div className="feature-icon" aria-hidden="true"><i className="fa-solid fa-route"></i></div>
                <h3>Lộ Trình Thiết Kế Riêng</h3>
                <p>Mỗi chuyến đi được cá nhân hóa theo sở thích và nhu cầu của từng đoàn khách, đảm bảo trải nghiệm tốt nhất.</p>
              </article>
              <article className="feature-card fade-up">
                <div className="feature-icon" aria-hidden="true"><i className="fa-solid fa-headset"></i></div>
                <h3>Hỗ Trợ 24/7</h3>
                <p>Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc và đảm bảo an toàn cho du khách trên toàn bộ hành trình.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ==================== TEAM ==================== */}
        <section className="team" id="team" aria-labelledby="team-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag">Đội Ngũ Chuyên Nghiệp</span>
              <h2 className="section-title" id="team-heading">Đội Ngũ Hướng Dẫn Viên Biểu Tượng</h2>
              <p className="section-subtitle">Những hướng dẫn viên giàu kinh nghiệm, tận tâm và am hiểu sâu về vùng đất Cao Bằng</p>
            </div>

            <div className="team-grid">
              {[
                { name: "A Tùng", tags: "HDV · Văn Hóa Nùng", role: "Chuyên gia HDV Sinh Thái", rating: 5, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
                { name: "Chị Hoa", tags: "HDV · Văn Hóa Tày", role: "Chuyên gia HDV Sinh Thái", rating: 5, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
                { name: "Anh Minh", tags: "HDV · Trekking & Sinh Thái", role: "Chuyên gia HDV Sinh Thái", rating: 4.9, img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face" },
                { name: "Chị Lan", tags: "HDV · Lịch Sử & Di Tích", role: "Chuyên gia HDV Sinh Thái", rating: 5, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
                { name: "Anh Hùng", tags: "HDV · Xe Máy Trekking", role: "Chuyên gia HDV Xe Máy", rating: 4.8, img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face" },
                { name: "Chị Mai", tags: "HDV · Ẩm Thực & Văn Hóa", role: "Chuyên gia HDV Sinh Thái", rating: 5, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face" },
                { name: "Anh Việt", tags: "HDV · Cắm Trại Rừng", role: "Chuyên gia HDV Sinh Thái", rating: 4.9, img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face" },
                { name: "Chị Thu", tags: "HDV · Homestay & Bản Làng", role: "Chuyên gia HDV Sinh Thái", rating: 5, img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face" }
              ].map((member, i) => (
                <article key={i} className="team-card fade-up">
                  <div className="team-card-img-wrap">
                    <img className="team-card-img" src={member.img} alt={`HDV ${member.name}`} loading="lazy" />
                    <span className="team-card-badge">{member.rating}★</span>
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.tags}</p>
                  <p className="hdv-role">{member.role}</p>
                  <div className="team-stars" aria-label={`${member.rating} sao`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className={`fa-solid ${star <= member.rating ? "fa-star" : member.rating >= star - 0.5 ? "fa-star-half-stroke" : "fa-star"}`}></i>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== DESTINATIONS ==================== */}
        <section className="destinations" id="destinations" aria-labelledby="dest-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag" style={{ background: "rgba(38,92,89,.12)", color: "var(--teal-dark)" }}>Khám Phá Ngay</span>
              <h2 className="section-title" id="dest-heading">Điểm Đến Không Thể Bỏ Lỡ</h2>
              <p className="section-subtitle">Những địa danh hùng vĩ và đặc sắc nhất tại vùng đất Cao Bằng đang chờ bạn khám phá</p>
            </div>

            <div className="dest-map-wrapper" aria-label="Bản đồ du lịch Cao Bằng">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d239558.34!2d105.75!3d22.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd16a1c9ef9d73%3A0x9c7f8b0ba2a3e4f0!2zQ2FvIELhbaG_bmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                title="Bản đồ du lịch Cao Bằng Việt Nam"
                loading="lazy"
                allowFullScreen
              ></iframe>
              <div className="dest-map-overlay" aria-hidden="true"></div>
            </div>

            <div className="dest-grid">
              {[
                { title: "Thác Bản Giốc", desc: "Thác Bản Giốc là một trong những thác nước lớn và đẹp nhất Đông Nam Á, nằm trên sông Quây Sơn giáp biên giới.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/640px-Ban_Gioc%E2%80%93Detian_Falls.jpg" },
                { title: "Di Tích Pác Bó", desc: "Di tích lịch sử thiêng liêng, nơi Chủ tịch Hồ Chí Minh ở và làm việc, gắn với suối Lê-nin và núi Các-Mác.", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/640px-Pac_Bo_Cave_Cao_Bang.jpg" },
                { title: "Động Ngườm Ngao", desc: "Hang động nguyên sinh kỳ vĩ với hàng nghìn nhũ đá muôn hình vạn trạng, nằm cách Thác Bản Giốc chỉ 3km.", img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=640&h=400&fit=crop" },
                { title: "Núi Mắt Thần", desc: "Kỳ quan địa chất độc đáo với hồ nước trên đỉnh núi, nhìn như con mắt từ trên cao, thu hút du khách toàn cầu.", img: "https://images.unsplash.com/photo-1553881651-43e20b703aff?w=640&h=400&fit=crop" },
                { title: "Hồ Thang Hen", desc: "Chuỗi 36 hồ nước tuyệt đẹp nằm trên núi cao, phong cảnh thay đổi theo mùa tạo nên bức tranh thiên nhiên hùng vĩ.", img: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=640&h=400&fit=crop" },
                { title: "Làng Đá Khuổi Ky", desc: "Làng cổ truyền của dân tộc Tày với những ngôi nhà xây hoàn toàn bằng đá, lưu giữ văn hóa bản địa đặc sắc.", img: "https://images.unsplash.com/photo-1559563458-527698bf5295?w=640&h=400&fit=crop" }
              ].map((dest, i) => (
                <article key={i} className="dest-card fade-up">
                  <div className="dest-card-img-wrap">
                    <img className="dest-card-img" src={dest.img} alt={dest.title} loading="lazy" />
                  </div>
                  <div className="dest-card-body">
                    <h3>{dest.title}</h3>
                    <p>{dest.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== GALLERY ==================== */}
        <section className="gallery" id="gallery" aria-labelledby="gallery-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag" style={{ background: "rgba(229,169,25,.12)", color: "#c48d10" }}>Góc Nhìn Chân Thực</span>
              <h2 className="section-title" id="gallery-heading">Thư Viện Hình Ảnh</h2>
              <p className="section-subtitle">Những khoảnh khắc tuyệt đẹp được ghi lại trong các chuyến đi của chúng tôi</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1533240332313-0cb496226c4f?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=600&fit=crop",
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop"
              ].map((src, i) => (
                <div key={i} className="fade-up relative aspect-square overflow-hidden rounded-md cursor-pointer group">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    src={src} 
                    alt="Thư viện ảnh" 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-[#265C59]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i className="fa-brands fa-instagram text-white text-3xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PRICING ==================== */}
        <section className="pricing" id="pricing" aria-labelledby="pricing-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag">Bảng Giá Minh Bạch</span>
              <h2 className="section-title" id="pricing-heading">Bảng Giá Dịch Vụ HDV</h2>
              <p className="section-subtitle">Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn</p>
            </div>

            <div className="pricing-grid">
              <article className="price-card fade-up">
                <h3>HDV Cá Nhân</h3>
                <p className="price-subtitle">Dành cho 1–2 người</p>
                <ul>
                  <li><i className="fa-solid fa-check"></i> HDV 1 cả chiều</li>
                  <li><i className="fa-solid fa-check"></i> HDV lộ trình riêng</li>
                  <li><i className="fa-solid fa-check"></i> HDV phiên dịch</li>
                  <li><i className="fa-solid fa-check"></i> HDV cá nhân hóa</li>
                  <li><i className="fa-solid fa-check"></i> Hỗ trợ 24/7</li>
                </ul>
                <button className="btn-price" aria-label="Đặt gói HDV Cá Nhân">500.000đ / Ngày</button>
              </article>

              <article className="price-card featured fade-up">
                <h3>HDV Đoàn</h3>
                <p className="price-subtitle">Dành cho 5–20 người</p>
                <ul>
                  <li><i className="fa-solid fa-check"></i> HDV 1 cả chiều</li>
                  <li><i className="fa-solid fa-check"></i> HDV trưởng nhóm</li>
                  <li><i className="fa-solid fa-check"></i> HDV lộ trình đoàn</li>
                  <li><i className="fa-solid fa-check"></i> HDV xe riêng</li>
                  <li><i className="fa-solid fa-check"></i> Hỗ trợ 24/7</li>
                </ul>
                <button className="btn-price" aria-label="Đặt gói HDV Đoàn">650.000đ / Ngày</button>
              </article>

              <article className="price-card fade-up">
                <h3>HDV Xe Máy</h3>
                <p className="price-subtitle">Phượt cung đường đẹp</p>
                <ul>
                  <li><i className="fa-solid fa-check"></i> HDV 1 cả chiều</li>
                  <li><i className="fa-solid fa-check"></i> Cho thuê xe máy</li>
                  <li><i className="fa-solid fa-check"></i> HDV địa hình núi</li>
                  <li><i className="fa-solid fa-check"></i> Bảo hiểm chuyến đi</li>
                  <li><i className="fa-solid fa-check"></i> Hỗ trợ 24/7</li>
                </ul>
                <button className="btn-price" aria-label="Đặt gói HDV Xe Máy">550.000đ / Ngày</button>
              </article>

              <div className="search-card fade-up" role="search">
                <h3>Tìm Kiếm HDV</h3>
                <div className="form-group">
                  <label htmlFor="tour-type">Loại Tour</label>
                  <select id="tour-type" name="tour-type">
                    <option value="">Tất cả loại tour</option>
                    <option>Tour Sinh Thái</option>
                    <option>Tour Văn Hóa</option>
                    <option>Tour Lịch Sử</option>
                    <option>Tour Phượt Xe Máy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="destination">Điểm Đến</label>
                  <select id="destination" name="destination">
                    <option value="">Tất cả địa điểm</option>
                    <option>Thác Bản Giốc</option>
                    <option>Di Tích Pác Bó</option>
                    <option>Động Ngườm Ngao</option>
                    <option>Hồ Thang Hen</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="budget">Ngân Sách</label>
                  <select id="budget" name="budget">
                    <option value="">Tất cả mức giá</option>
                    <option>Dưới 500.000đ</option>
                    <option>500.000 – 700.000đ</option>
                    <option>Trên 700.000đ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ngôn Ngữ HDV</label>
                  <div className="checkbox-group">
                    <label><input type="checkbox" name="lang" value="vi" defaultChecked /> Tiếng Việt</label>
                    <label><input type="checkbox" name="lang" value="en" /> Tiếng Anh</label>
                  </div>
                </div>
                <button className="btn-search" type="button">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Tìm Kiếm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== TESTIMONIALS ==================== */}
        <section className="testimonials" id="testimonials" aria-labelledby="testi-heading">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span className="section-tag">Khách Hàng Nói Gì</span>
              <h2 className="section-title" id="testi-heading">Ý Kiến Khách Hàng</h2>
              <p className="section-subtitle">Những chia sẻ chân thực từ du khách đã trải nghiệm dịch vụ của chúng tôi</p>
            </div>

            <div className="carousel-wrapper">
              <button className="carousel-btn prev" onClick={() => handlePageChange(currentPage - 1)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <div className="carousel-track">
                {reviews.map((review, i) => {
                  const isVisible = i >= currentPage * cardsPerPage && i < (currentPage + 1) * cardsPerPage;
                  return (
                    <article key={i} className="review-card" style={{ display: isVisible ? "block" : "none" }}>
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`fa-solid ${star <= review.stars ? "fa-star" : "fa-star-half-stroke"}`}></i>
                        ))}
                      </div>
                      <blockquote className="review-text">{review.text}</blockquote>
                      <footer className="reviewer">
                        <img className="reviewer-avatar" src={review.img} alt={`Avatar ${review.name}`} loading="lazy" />
                        <div className="reviewer-info">
                          <h4>{review.name}</h4>
                          <span>{review.desc}</span>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>

              <button className="carousel-btn next" onClick={() => handlePageChange(currentPage + 1)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            <div className="carousel-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === currentPage ? "active" : ""}`}
                  onClick={() => handlePageChange(i)}
                  aria-label={`Trang ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer id="footer" aria-label="Chân trang">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <div className="footer-logo-icon" aria-hidden="true"><i className="fa-solid fa-mountain-sun"></i></div>
                <div className="footer-logo-text">
                  <strong>Cao Bằng Eco Tour</strong>
                  <span>Hướng Dẫn Viên Địa Phương</span>
                </div>
              </div>
              <p className="footer-about">
                Kết nối du khách với những hướng dẫn viên địa phương am hiểu và tận tâm nhất tại Cao Bằng. Chúng tôi cam kết mang lại hành trình trọn vẹn và trải nghiệm chân thực nhất.
              </p>
              <address style={{ fontStyle: "normal" }}>
                <div className="footer-contact-item"><i className="fa-solid fa-phone"></i><span>+84 372 518 168</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-envelope"></i><span>info@caobangecotour.com</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-globe"></i><span>www.caobangecotour.com</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-location-dot"></i><span>Tp. Cao Bằng, tỉnh Cao Bằng, Việt Nam</span></div>
              </address>
            </div>

            <div className="footer-col">
              <h4>Liên Hệ</h4>
              <form action="#" method="post" onSubmit={(e) => e.preventDefault()}>
                <div className="footer-form-group"><input type="text" name="fullname" placeholder="Họ và tên" autoComplete="name" /></div>
                <div className="footer-form-group"><input type="email" name="email" placeholder="Địa chỉ Email" autoComplete="email" /></div>
                <div className="footer-form-group"><input type="tel" name="phone" placeholder="Số điện thoại" autoComplete="tel" /></div>
                <div className="footer-form-group"><input type="text" name="message" placeholder="Nội dung tin nhắn..." /></div>
                <button type="submit" className="btn-footer-send">
                  <i className="fa-solid fa-paper-plane" aria-hidden="true"></i> GỬI TIN NHẮN
                </button>
              </form>
            </div>

            <div className="footer-col">
              <h4>Map</h4>
              <div className="footer-map" aria-label="Bản đồ vị trí Cao Bằng">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59886.6!2d106.257!3d22.666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd16a1c9ef9d73%3A0x9c7f8b0ba2a3e4f0!2zVGjDoG5oIHBo4buRIENhbyBC4bqxbmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                  title="Bản đồ thành phố Cao Bằng Việt Nam"
                  loading="lazy"
                  allowFullScreen
                ></iframe>
              </div>

              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "14px" }}>Điều Hướng</h4>
                <nav aria-label="Điều hướng footer">
                  <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    <li><a href="#hero" className="footer-nav-link" onClick={(e) => scrollToSection(e, "hero")}>Trang Chủ</a></li>
                    <li><a href="#why-us" className="footer-nav-link" onClick={(e) => scrollToSection(e, "why-us")}>Giới Thiệu</a></li>
                    <li><a href="#team" className="footer-nav-link" onClick={(e) => scrollToSection(e, "team")}>Dịch Vụ HDV</a></li>
                    <li><a href="#destinations" className="footer-nav-link" onClick={(e) => scrollToSection(e, "destinations")}>Điểm Đến</a></li>
                    <li><a href="#gallery" className="footer-nav-link" onClick={(e) => scrollToSection(e, "gallery")}>Thư Viện Ảnh</a></li>
                    <li><a href="#pricing" className="footer-nav-link" onClick={(e) => scrollToSection(e, "pricing")}>Bảng Giá</a></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">© 2024 Cao Bằng Eco Tour. Bảo lưu mọi quyền. | Thiết kế với <i className="fa-solid fa-heart" style={{ color: "#e87c7c", fontSize: ".7em" }}></i> cho du lịch Cao Bằng</p>
            <nav className="footer-socials">
              <a href="#" className="footer-social-link"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" className="footer-social-link"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="footer-social-link"><i className="fa-brands fa-youtube"></i></a>
              <a href="#" className="footer-social-link"><i className="fa-brands fa-tiktok"></i></a>
              <a href="#" className="footer-social-link"><i className="fa-solid fa-comment-dots"></i></a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}