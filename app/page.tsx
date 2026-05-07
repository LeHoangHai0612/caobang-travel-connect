"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import MusicPlayer from "@/app/components/MusicPlayer";
import type { Guide, Destination, Review, GalleryImage, UserProfile } from "@/lib/database.types";

interface Tour {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_from: number;
  duration: string;
  group_size: string;
  zalo_number: string;
}
import { getTier, GUIDE_LOYALTY_THRESHOLD, GUIDE_LOYALTY_BONUS_PCT } from "@/lib/loyalty";

// ── Fallback data (hiển thị ngay khi chờ Supabase) ──────────────────────────
const FALLBACK_GUIDES: Guide[] = [
  { id: "f1", name: "A Tùng",   specialty: "HDV · Văn Hóa Nùng",        role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 5, languages: "Tiếng Việt", is_active: true, created_at: "" },
  { id: "f2", name: "Chị Hoa",  specialty: "HDV · Văn Hóa Tày",          role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 4, languages: "Tiếng Việt", is_active: true, created_at: "" },
  { id: "f3", name: "Anh Minh", specialty: "HDV · Trekking & Sinh Thái", role: "Chuyên gia HDV Sinh Thái", rating: 4.9, image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 6, languages: "Tiếng Việt, English", is_active: true, created_at: "" },
  { id: "f4", name: "Chị Lan",  specialty: "HDV · Lịch Sử & Di Tích",   role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 7, languages: "Tiếng Việt", is_active: true, created_at: "" },
  { id: "f5", name: "Anh Hùng", specialty: "HDV · Xe Máy Trekking",      role: "Chuyên gia HDV Xe Máy",   rating: 4.8, image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 5, languages: "Tiếng Việt", is_active: true, created_at: "" },
  { id: "f6", name: "Chị Mai",  specialty: "HDV · Ẩm Thực & Văn Hóa",   role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 3, languages: "Tiếng Việt, English", is_active: true, created_at: "" },
  { id: "f7", name: "Anh Việt", specialty: "HDV · Cắm Trại Rừng",        role: "Chuyên gia HDV Sinh Thái", rating: 4.9, image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 4, languages: "Tiếng Việt", is_active: true, created_at: "" },
  { id: "f8", name: "Chị Thu",  specialty: "HDV · Homestay & Bản Làng",  role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 6, languages: "Tiếng Việt", is_active: true, created_at: "" },
];

const FALLBACK_DESTINATIONS: Destination[] = [
  { id: "f1", title: "Thác Bản Giốc",    description: "Thác Bản Giốc là một trong những thác nước lớn và đẹp nhất Đông Nam Á, nằm trên sông Quây Sơn giáp biên giới.",                               image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/640px-Ban_Gioc%E2%80%93Detian_Falls.jpg", sort_order: 1, created_at: "" },
  { id: "f2", title: "Di Tích Pác Bó",   description: "Di tích lịch sử thiêng liêng, nơi Chủ tịch Hồ Chí Minh ở và làm việc, gắn với suối Lê-nin và núi Các-Mác.",                                    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/640px-Pac_Bo_Cave_Cao_Bang.jpg",                sort_order: 2, created_at: "" },
  { id: "f3", title: "Động Ngườm Ngao",  description: "Hang động nguyên sinh kỳ vĩ với hàng nghìn nhũ đá muôn hình vạn trạng, nằm cách Thác Bản Giốc chỉ 3km.",                                      image_url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=640&h=400&fit=crop",                                                  sort_order: 3, created_at: "" },
  { id: "f4", title: "Núi Mắt Thần",     description: "Kỳ quan địa chất độc đáo với hồ nước trên đỉnh núi, nhìn như con mắt từ trên cao, thu hút du khách toàn cầu.",                                 image_url: "https://images.unsplash.com/photo-1553881651-43e20b703aff?w=640&h=400&fit=crop",                                                  sort_order: 4, created_at: "" },
  { id: "f5", title: "Hồ Thang Hen",     description: "Chuỗi 36 hồ nước tuyệt đẹp nằm trên núi cao, phong cảnh thay đổi theo mùa tạo nên bức tranh thiên nhiên hùng vĩ.",                            image_url: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=640&h=400&fit=crop",                                                  sort_order: 5, created_at: "" },
  { id: "f6", title: "Làng Đá Khuổi Ky", description: "Làng cổ truyền của dân tộc Tày với những ngôi nhà xây hoàn toàn bằng đá, lưu giữ văn hóa bản địa đặc sắc.",                                   image_url: "https://images.unsplash.com/photo-1559563458-527698bf5295?w=640&h=400&fit=crop",                                                  sort_order: 6, created_at: "" },
];

const FALLBACK_REVIEWS: Review[] = [
  { id: "f1", reviewer_name: "Kiên Đỗ",    reviewer_location: "Du khách từ Hà Nội · Tháng 3/2024",    stars: 5,   review_text: '"Chuyến đi Cao Bằng của tôi trở nên hoàn hảo nhờ anh A Tùng. Anh ấy không chỉ là hướng dẫn viên mà còn như người bạn đồng hành, kể những câu chuyện thú vị về văn hóa người Nùng mà không sách nào có được."', avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",  is_approved: true, created_at: "" },
  { id: "f2", reviewer_name: "Kim Vang",   reviewer_location: "Du khách từ TP.HCM · Tháng 2/2024",    stars: 5,   review_text: '"Tôi đã đặt tour cùng Chị Hoa và hoàn toàn bị chinh phục. Từ Thác Bản Giốc đến Động Ngườm Ngao, mọi trải nghiệm đều được sắp xếp chu đáo. Chắc chắn sẽ quay lại lần sau!"',                                          avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face", is_approved: true, created_at: "" },
  { id: "f3", reviewer_name: "Alex Khánh", reviewer_location: "Du khách quốc tế · Tháng 1/2024",      stars: 5,   review_text: '"Hành trình phượt xe máy 3 ngày cùng Anh Hùng thật sự là trải nghiệm đáng nhớ trong đời. Cung đường đẹp mê hồn, đồ ăn địa phương ngon tuyệt và sự nhiệt tình của HDV làm tôi vô cùng ấn tượng."',              avatar_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face", is_approved: true, created_at: "" },
  { id: "f4", reviewer_name: "Hương Trần", reviewer_location: "Du khách từ Đà Nẵng · Tháng 4/2024",   stars: 5,   review_text: '"Gia đình tôi 5 người đặt tour đoàn, mọi thứ từ lịch trình, ăn uống đến chỗ nghỉ đều được sắp xếp hoàn hảo. HDV rất kiên nhẫn với các bé. Cảm ơn Cao Bằng Eco Tour!"',                                             avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face", is_approved: true, created_at: "" },
  { id: "f5", reviewer_name: "Minh Tuấn",  reviewer_location: "Du khách từ Hải Phòng · Tháng 5/2024", stars: 4.5, review_text: '"Tour Hồ Thang Hen và Làng Khuổi Ky thật ấn tượng. Chị Thu giải thích mọi thứ rất tỉ mỉ, giúp tôi hiểu sâu hơn về văn hóa dân tộc Tày. Phong cảnh đẹp không kém gì Hà Giang!"',                                    avatar_url: "https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=100&h=100&fit=crop&crop=face",  is_approved: true, created_at: "" },
  { id: "f6", reviewer_name: "Ngọc Ánh",   reviewer_location: "Du khách từ Cần Thơ · Tháng 6/2024",   stars: 5,   review_text: '"Chuyến đi Pác Bó cùng Chị Lan thực sự cảm động. Được nghe kể về lịch sử qua lời HDV địa phương khiến tôi hiểu và trân trọng hơn giá trị lịch sử của nơi đây. Rất đáng để ghé thăm!"',                             avatar_url: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&h=100&fit=crop&crop=face",  is_approved: true, created_at: "" },
];

const FALLBACK_GALLERY: GalleryImage[] = [
  { id: "g1", image_url: "https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=600&h=600&fit=crop", sort_order: 1, created_at: "" },
  { id: "g2", image_url: "https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=600&h=600&fit=crop",    sort_order: 2, created_at: "" },
  { id: "g3", image_url: "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=600&fit=crop",    sort_order: 3, created_at: "" },
  { id: "g4", image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop",    sort_order: 4, created_at: "" },
  { id: "g5", image_url: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&h=600&fit=crop", sort_order: 5, created_at: "" },
  { id: "g6", image_url: "https://images.unsplash.com/photo-1533240332313-0cb496226c4f?w=600&h=600&fit=crop", sort_order: 6, created_at: "" },
  { id: "g7", image_url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=600&fit=crop", sort_order: 7, created_at: "" },
  { id: "g8", image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop", sort_order: 8, created_at: "" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function StarIcons({ rating }: { rating: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => {
        const full = star <= Math.floor(rating);
        const half = !full && rating >= star - 0.5;
        return (
          <i
            key={star}
            className={`fa-${full || half ? "solid" : "regular"} ${full ? "fa-star" : half ? "fa-star-half-stroke" : "fa-star"}`}
          />
        );
      })}
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CaoBangEcoTour() {
  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Data state – khởi tạo bằng fallback, cập nhật từ Supabase
  const [guides, setGuides] = useState<Guide[]>(FALLBACK_GUIDES);
  const [destinations, setDestinations] = useState<Destination[]>(FALLBACK_DESTINATIONS);
  const [destsFromDB, setDestsFromDB]   = useState(false);
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(FALLBACK_GALLERY);
  const [tours, setTours] = useState<Tour[]>([]);

  interface CamNangTip { id: string; icon: string; tag: string; color: string; title: string; description: string; sort_order: number; }
  const [camNangTips, setCamNangTips] = useState<CamNangTip[]>([]);
  const [camNangFromDB, setCamNangFromDB] = useState(false);

  // Site settings
  const [heroBg, setHeroBg]             = useState("");
  const [heroVideo, setHeroVideo]       = useState("");
  const [aboutImage, setAboutImage]     = useState("");
  const [destBg, setDestBg]             = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");
  const [pricingBg, setPricingBg]       = useState("https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75");
  const [whyusBg, setWhyusBg]           = useState("https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=75");
  const [teamBg, setTeamBg]             = useState("https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=1600&q=75");
  const [toursBg, setToursBg]           = useState("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1600&q=75");
  const [galleryBg, setGalleryBg]       = useState("https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=1600&q=75");
  const [testimonialsBg, setTestimonialsBg] = useState("https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75");
  const [sosBg, setSosBg]               = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=75");
  const [camNangBg, setCamNangBg]       = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");
  const [musicSrc, setMusicSrc]         = useState("");

  // Auth state
  const [userSession, setUserSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Booking extras
  const [bookingGuideId, setBookingGuideId] = useState<string>("");
  const [guideBookingCount, setGuideBookingCount] = useState<number>(0);
  const [bookingPointsInfo, setBookingPointsInfo] = useState<{ earned: number; newTotal: number; newTier: string } | null>(null);
  const [guideBusyDates, setGuideBusyDates] = useState<Set<string>>(new Set());

  // Booking modal state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPackage, setBookingPackage] = useState("");
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactId, setContactId] = useState("");
  const [unreadReplies, setUnreadReplies] = useState(0);

  // HDV filter
  const [guideSearch, setGuideSearch] = useState("");
  const [guideFilterLang, setGuideFilterLang] = useState("");
  const [guideFilterRating, setGuideFilterRating] = useState("");
  const [showAllGuides, setShowAllGuides] = useState(false);
  const [bookingGuideSearch, setBookingGuideSearch] = useState("");

  // Weather
  const [weather, setWeather] = useState<{ temp: number; code: number; wind: number } | null>(null);

  const totalPages = Math.ceil(reviews.length / cardsPerPage);

  // Destination detail modal
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  // Review form state
  const [reviewOpen, setReviewOpen]       = useState(false);
  const [reviewStars, setReviewStars]     = useState(5);
  const [reviewHover, setReviewHover]     = useState(0);
  const [reviewText, setReviewText]       = useState("");
  const [reviewName, setReviewName]       = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError]     = useState("");

  // Parallax refs
  const heroMistRef = useRef<HTMLDivElement>(null);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Tải dữ liệu từ Supabase
    async function loadData() {
      const [{ data: g }, { data: d }, { data: r }, { data: gal }, { data: settings }, { data: t }, { data: cn }] = await Promise.all([
        supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(8),
        supabase.from("destinations").select("*").order("sort_order").limit(6),
        supabase.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(6),
        supabase.from("gallery_images").select("*").order("sort_order").limit(8),
        supabase.from("site_settings").select("key,value"),
        supabase.from("tours").select("id,title,description,image_url,price_from,duration,group_size,zalo_number").eq("is_active", true).order("sort_order").limit(6),
        supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order").limit(6),
      ]);
      if (g && g.length > 0) setGuides(g);
      if (d && d.length > 0) { setDestinations(d); setDestsFromDB(true); }
      if (cn && cn.length > 0) { setCamNangTips(cn); setCamNangFromDB(true); }
      if (r && r.length > 0) setReviews(r);
      if (gal && gal.length > 0) setGalleryImages(gal);
      if (t && t.length > 0) setTours(t);
      if (settings) {
        const find = (k: string) => settings.find((s: { key: string; value: string }) => s.key === k)?.value;
        if (find("hero_bg"))          setHeroBg(find("hero_bg")!);
        if (find("hero_video"))       setHeroVideo(find("hero_video")!);
        if (find("about_image"))      setAboutImage(find("about_image")!);
        if (find("destinations_bg"))  setDestBg(find("destinations_bg")!);
        if (find("pricing_bg"))       setPricingBg(find("pricing_bg")!);
        if (find("whyus_bg"))         setWhyusBg(find("whyus_bg")!);
        if (find("team_bg"))          setTeamBg(find("team_bg")!);
        if (find("tours_bg"))         setToursBg(find("tours_bg")!);
        if (find("gallery_bg"))       setGalleryBg(find("gallery_bg")!);
        if (find("testimonials_bg"))  setTestimonialsBg(find("testimonials_bg")!);
        if (find("sos_bg"))           setSosBg(find("sos_bg")!);
        if (find("cam_nang_bg"))      setCamNangBg(find("cam_nang_bg")!);
        if (find("background_music")) setMusicSrc(find("background_music")!);
      }
    }
    loadData();

    // Thời tiết Cao Bằng (Open-Meteo, không cần API key)
    fetch("https://api.open-meteo.com/v1/forecast?latitude=22.67&longitude=106.27&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia/Ho_Chi_Minh")
      .then((r) => r.json())
      .then((d) => {
        if (d?.current) setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code, wind: Math.round(d.current.wind_speed_10m) });
      }).catch(() => null);

    // Shadow header + parallax mist
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      if (heroMistRef.current && y < window.innerHeight * 1.2) {
        heroMistRef.current.style.transform = `translateY(${y * 0.22}px)`;
        heroMistRef.current.style.opacity = String(Math.max(0, 1 - y / 650));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Số thẻ carousel
    const handleResize = () => setCardsPerPage(window.innerWidth <= 768 ? 1 : 3);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Active menu link khi cuộn
    const sections = document.querySelectorAll("section[id], footer[id]");
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3 }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      sectionObserver.disconnect();
    };
  }, []);

  // Observer fade-up chạy lại mỗi khi data thay đổi (fix card vô hình sau khi Supabase load)
  useEffect(() => {
    const fadeEls = document.querySelectorAll(".fade-up:not(.visible)");
    if (!fadeEls.length) return;

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
    return () => fadeObserver.disconnect();
  }, [guides, destinations, reviews]);


  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) loadUserProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserSession(session);
      if (session) loadUserProfile(session.user.id);
      else { setUserProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUserProfile(uid: string) {
    const { data } = await supabase.from("user_profiles").select("*").eq("id", uid).single();
    if (data) setUserProfile(data);
    // Đếm tin nhắn có reply chưa đọc
    const { count } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", uid)
      .not("admin_reply", "is", null)
      .neq("admin_reply", "");
    setUnreadReplies(count ?? 0);
  }

  // Check guide loyalty count + busy dates when guide changes
  useEffect(() => {
    if (!bookingGuideId) { setGuideBookingCount(0); setGuideBusyDates(new Set()); return; }
    if (userSession) {
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userSession.user.id)
        .eq("guide_id", bookingGuideId)
        .eq("status", "confirmed")
        .then(({ count }) => setGuideBookingCount(count ?? 0));
    }
    // Lấy ngày bận của HDV trong 3 tháng tới
    const from = new Date().toISOString().slice(0, 10);
    const to   = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
    supabase
      .from("guide_schedules")
      .select("date")
      .eq("guide_id", bookingGuideId)
      .gte("date", from)
      .lte("date", to)
      .then(({ data }) => setGuideBusyDates(new Set((data ?? []).map((d: { date: string }) => d.date))));
  }, [userSession, bookingGuideId]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const target = document.getElementById(targetId);
    const header = document.getElementById("site-header");
    if (target && header) {
      window.scrollTo({ top: target.offsetTop - header.offsetHeight - 10, behavior: "smooth" });
    }
  };

  const openReview = () => {
    setReviewText(""); setReviewStars(5); setReviewError(""); setReviewSuccess(false);
    setReviewName(userProfile?.full_name || "");
    setReviewLocation("");
    setReviewOpen(true);
  };

  const handleReviewSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (reviewLoading) return;
    if (!reviewText.trim()) { setReviewError("Vui lòng nhập nội dung đánh giá."); return; }
    if (!reviewName.trim()) { setReviewError("Vui lòng nhập tên của bạn."); return; }
    setReviewLoading(true); setReviewError("");
    const { error } = await supabase.from("reviews").insert({
      reviewer_name:     reviewName.trim(),
      reviewer_location: reviewLocation.trim() || "Việt Nam",
      stars:             reviewStars,
      review_text:       reviewText.trim(),
      avatar_url:        "",
      is_approved:       false,
      user_id:           userSession?.user.id ?? null,
    });
    setReviewLoading(false);
    if (error) { setReviewError("Gửi thất bại. Vui lòng thử lại."); }
    else { setReviewSuccess(true); setTimeout(() => setReviewOpen(false), 3000); }
  };

  const openBooking = (pkg: string) => {
    window.location.href = `/dat-lich?package=${encodeURIComponent(pkg)}`;
  };

  const handleBookingSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (bookingLoading) return;
    setBookingLoading(true);
    setBookingError("");

    const tierDiscount = userProfile ? getTier(userProfile.points).discount : 0;
    const loyaltyBonus = userSession && bookingGuideId && guideBookingCount >= GUIDE_LOYALTY_THRESHOLD
      ? GUIDE_LOYALTY_BONUS_PCT : 0;
    const totalDiscount = tierDiscount + loyaltyBonus;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const session = userSession;
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers,
        body: JSON.stringify({
          package_type: bookingPackage,
          client_name: bookingName,
          phone: bookingPhone,
          email: bookingEmail,
          preferred_date: bookingDate || undefined,
          message: bookingNote,
          user_id: session?.user.id,
          guide_id: bookingGuideId || undefined,
          discount_pct: totalDiscount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.points_earned) {
          setBookingPointsInfo({ earned: data.points_earned, newTotal: data.new_points, newTier: data.new_tier });
          setUserProfile((prev) => prev ? { ...prev, points: data.new_points, tier: data.new_tier } : prev);
        }
        setBookingSuccess(true);
        setTimeout(() => setIsBookingOpen(false), 3500);
      } else {
        const data = await res.json();
        setBookingError(data.error || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setBookingError("Không thể kết nối. Vui lòng thử lại.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (contactLoading) return;
    setContactLoading(true);
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage, user_id: userSession?.user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setContactSuccess(true);
        setContactId(data.contact_id || "");
        setContactName(""); setContactEmail(""); setContactPhone(""); setContactMessage("");
      } else {
        const data = await res.json();
        setContactError(data.error || "Đã có lỗi. Vui lòng thử lại.");
      }
    } catch {
      setContactError("Không thể kết nối.");
    } finally {
      setContactLoading(false);
    }
  };

  const handleFooterSignup = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (contactLoading) return;
    setContactLoading(true);
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName || "Khách hàng", email: contactEmail, phone: "", message: contactMessage || "Đăng ký nhận tin tức", user_id: userSession?.user.id }),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactName(""); setContactEmail("");
      } else {
        const data = await res.json();
        setContactError(data.error || "Đã có lỗi. Vui lòng thử lại.");
      }
    } catch {
      setContactError("Không thể kết nối.");
    } finally {
      setContactLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  const today = new Date().toISOString().split("T")[0];

  // Filtered guides
  const allFiltered = guides.filter((g) => {
    const q = guideSearch.toLowerCase();
    const matchSearch = !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
    const matchLang   = !guideFilterLang   || g.languages?.toLowerCase().includes(guideFilterLang.toLowerCase());
    const matchRating = !guideFilterRating || g.rating >= parseFloat(guideFilterRating);
    return matchSearch && matchLang && matchRating;
  });
  const GUIDE_LIMIT = 8;
  const hasMore = allFiltered.length > GUIDE_LIMIT && !showAllGuides && !guideSearch && !guideFilterLang && !guideFilterRating;
  const filteredGuides = hasMore ? allFiltered.slice(0, GUIDE_LIMIT) : allFiltered;

  // Weather icon from WMO code
  const weatherIcon = (code: number) => {
    if (code === 0) return { icon: "fa-sun", label: "Nắng đẹp", color: "#F59E0B" };
    if (code <= 3)  return { icon: "fa-cloud-sun", label: "Có mây", color: "#6B7280" };
    if (code <= 49) return { icon: "fa-cloud", label: "Nhiều mây", color: "#9CA3AF" };
    if (code <= 69) return { icon: "fa-cloud-rain", label: "Mưa", color: "#3B82F6" };
    if (code <= 79) return { icon: "fa-snowflake", label: "Tuyết", color: "#93C5FD" };
    if (code <= 99) return { icon: "fa-cloud-bolt", label: "Giông bão", color: "#7C3AED" };
    return { icon: "fa-cloud", label: "Nhiều mây", color: "#9CA3AF" };
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ==================== BOOKING MODAL ==================== */}
      {isBookingOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsBookingOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ maxHeight: "92vh", overflowY: "auto" }}>
            {/* Modal header */}
            <div style={{ background: "var(--teal-dark)", padding: "22px 28px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ color: "white", fontWeight: 800, fontSize: "1rem", letterSpacing: ".06em", textTransform: "uppercase", margin: 0 }}>
                  ĐẶT HDV NGAY
                </h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: ".78rem", margin: "4px 0 0" }}>{bookingPackage}</p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: ".9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px 28px" }}>
              {bookingSuccess ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 64, height: 64, background: "rgba(42,148,144,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--teal-dark)", fontSize: "1.8rem" }}>
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <h4 style={{ fontWeight: 800, color: "var(--teal-dark)", marginBottom: 8, fontSize: "1.05rem" }}>Đặt lịch thành công!</h4>
                  <p style={{ color: "var(--text-mid)", fontSize: ".87rem", lineHeight: 1.6 }}>
                    Chúng tôi sẽ liên hệ xác nhận với bạn trong vòng <strong>24 giờ</strong>.
                  </p>
                  {bookingPointsInfo && (
                    <div style={{ marginTop: 16, background: "rgba(38,92,89,.08)", borderRadius: 10, padding: "12px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 800, color: "var(--teal-dark)", fontSize: ".9rem" }}>
                        <i className="fa-solid fa-star" style={{ color: "#E5A919", marginRight: 6 }} />
                        +{bookingPointsInfo.earned} điểm tích lũy!
                      </p>
                      <p style={{ margin: "4px 0 0", color: "#6b8888", fontSize: ".8rem" }}>
                        Tổng: {bookingPointsInfo.newTotal} điểm · Hạng: {getTier(bookingPointsInfo.newTotal).label}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-name">Họ và tên *</label>
                    <input id="b-name" type="text" value={bookingName} onChange={(e) => setBookingName(e.target.value)} placeholder="Nguyễn Văn A" required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-phone">Số điện thoại *</label>
                    <input id="b-phone" type="tel" value={bookingPhone} onChange={(e) => setBookingPhone(e.target.value)} placeholder="0912 345 678" required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-email">Email</label>
                    <input id="b-email" type="email" value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)} placeholder="email@example.com" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-date">Ngày dự kiến</label>
                    <input id="b-date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={today} />
                    {bookingDate && guideBusyDates.has(bookingDate) && (
                      <p style={{ margin: "6px 0 0", fontSize: ".78rem", color: "#b45309", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 7, padding: "6px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <i className="fa-solid fa-triangle-exclamation" />
                        HDV đã có lịch vào ngày này. Vui lòng chọn ngày khác hoặc chúng tôi sẽ liên hệ xác nhận lại.
                      </p>
                    )}
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-note">Ghi chú</label>
                    <input id="b-note" type="text" value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} placeholder="Số người, yêu cầu đặc biệt..." />
                  </div>

                  {/* Chọn HDV */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="b-guide">Chọn Hướng Dẫn Viên</label>
                    {/* Search HDV */}
                    <div style={{ position: "relative", marginBottom: 6 }}>
                      <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }} />
                      <input
                        type="text"
                        placeholder="Tìm HDV theo tên hoặc chuyên môn..."
                        value={bookingGuideSearch}
                        onChange={(e) => setBookingGuideSearch(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px 8px 30px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: ".82rem", outline: "none", boxSizing: "border-box" }}
                      />
                    </div>
                    <select
                      id="b-guide"
                      value={bookingGuideId}
                      onChange={(e) => { setBookingGuideId(e.target.value); setBookingGuideSearch(""); }}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: ".88rem", background: "white" }}
                      size={guides.filter((g) => {
                        const q = bookingGuideSearch.toLowerCase();
                        return !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
                      }).length > 4 ? 5 : undefined}
                    >
                      <option value="">-- Chưa chọn HDV --</option>
                      {guides
                        .filter((g) => {
                          const q = bookingGuideSearch.toLowerCase();
                          return !q || g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q);
                        })
                        .map((g) => (
                          <option key={g.id} value={g.id}>{g.name} · {g.specialty}</option>
                        ))}
                    </select>
                    {bookingGuideSearch && (
                      <button onClick={() => setBookingGuideSearch("")}
                        style={{ marginTop: 4, background: "none", border: "none", color: "#94a3b8", fontSize: ".72rem", cursor: "pointer", padding: 0 }}>
                        <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Xóa tìm kiếm
                      </button>
                    )}
                  </div>

                  {/* Loyalty discount banner (chỉ hiện khi đăng nhập) */}
                  {userSession && userProfile && (() => {
                    const tierDiscount = getTier(userProfile.points).discount;
                    const tierInfo = getTier(userProfile.points);
                    const hasLoyalty = bookingGuideId && guideBookingCount >= GUIDE_LOYALTY_THRESHOLD;
                    const total = tierDiscount + (hasLoyalty ? GUIDE_LOYALTY_BONUS_PCT : 0);
                    if (total === 0 && !bookingGuideId) return null;
                    return (
                      <div style={{ background: "rgba(38,92,89,.07)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                        {tierDiscount > 0 && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem" }}>
                            <i className={`fa-solid ${tierInfo.icon}`} style={{ color: tierInfo.color }} />
                            <span style={{ color: "#265C59", fontWeight: 700 }}>Hạng {tierInfo.label}: giảm {tierDiscount}%</span>
                          </div>
                        )}
                        {hasLoyalty && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem" }}>
                            <i className="fa-solid fa-heart" style={{ color: "#E5A919" }} />
                            <span style={{ color: "#c48d10", fontWeight: 700 }}>Khách thân thiết HDV: giảm thêm {GUIDE_LOYALTY_BONUS_PCT}%</span>
                          </div>
                        )}
                        {bookingGuideId && guideBookingCount > 0 && guideBookingCount < GUIDE_LOYALTY_THRESHOLD && (
                          <div style={{ fontSize: ".78rem", color: "#6b8888" }}>
                            Đã book HDV này {guideBookingCount} lần · Cần {GUIDE_LOYALTY_THRESHOLD - guideBookingCount} lần nữa để nhận -5%
                          </div>
                        )}
                        {total > 0 && (
                          <div style={{ borderTop: "1px solid rgba(38,92,89,.15)", paddingTop: 6, fontWeight: 800, color: "#265C59", fontSize: ".88rem" }}>
                            Tổng giảm: {total}%
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {bookingError && (
                    <p style={{ color: "#dc2626", fontSize: ".82rem", textAlign: "center", margin: 0 }}>{bookingError}</p>
                  )}
                  <button type="submit" className="btn-price" disabled={bookingLoading} style={{ opacity: bookingLoading ? 0.7 : 1, marginTop: 4 }}>
                    {bookingLoading ? "Đang gửi..." : "XÁC NHẬN ĐẶT HDV"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== REVIEW MODAL ==================== */}
      {reviewOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setReviewOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ maxHeight: "92vh", overflowY: "auto" }}>
            {/* Header */}
            <div style={{ background: "var(--teal-dark)", padding: "20px 28px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ color: "white", fontWeight: 800, fontSize: "1rem", letterSpacing: ".05em", textTransform: "uppercase", margin: 0 }}>
                  Viết Đánh Giá
                </h3>
                <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".78rem", margin: "4px 0 0" }}>Chia sẻ trải nghiệm của bạn</p>
              </div>
              <button onClick={() => setReviewOpen(false)}
                style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", width: 44, height: 44, borderRadius: "50%", cursor: "pointer", fontSize: ".9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "24px 28px" }}>
              {reviewSuccess ? (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <div style={{ width: 64, height: 64, background: "rgba(42,148,144,.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--teal-dark)", fontSize: "1.8rem" }}>
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <h4 style={{ fontWeight: 800, color: "var(--teal-dark)", marginBottom: 8, fontSize: "1.05rem" }}>Cảm ơn bạn!</h4>
                  <p style={{ color: "var(--text-mid)", fontSize: ".87rem", lineHeight: 1.6 }}>
                    Đánh giá của bạn đang chờ <strong>Admin duyệt</strong> và sẽ xuất hiện trên trang sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Stars */}
                  <div>
                    <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: "var(--text-mid)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
                      Đánh giá của bạn *
                    </label>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      {[1,2,3,4,5].map((s) => (
                        <button
                          key={s} type="button"
                          onMouseEnter={() => setReviewHover(s)}
                          onMouseLeave={() => setReviewHover(0)}
                          onClick={() => setReviewStars(s)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "2rem", padding: "0 2px", color: s <= (reviewHover || reviewStars) ? "#E5A919" : "#e2e8f0", transition: "color .15s, transform .1s", transform: s <= (reviewHover || reviewStars) ? "scale(1.15)" : "scale(1)" }}
                        >
                          <i className="fa-solid fa-star" />
                        </button>
                      ))}
                    </div>
                    <p style={{ textAlign: "center", fontSize: ".78rem", color: "#94a3b8", marginTop: 6 }}>
                      {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][reviewHover || reviewStars]}
                    </p>
                  </div>

                  {/* Review text */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="rv-text">Nội dung đánh giá *</label>
                    <textarea
                      id="rv-text" rows={4}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về tour, hướng dẫn viên, phong cảnh..."
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontFamily: "inherit", fontSize: ".88rem", resize: "vertical", outline: "none" }}
                    />
                  </div>

                  {/* Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="rv-name">Họ và tên *</label>
                    <input id="rv-name" type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      readOnly={!!userProfile?.full_name}
                      style={{ opacity: userProfile?.full_name ? 0.7 : 1 }}
                    />
                  </div>

                  {/* Location */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="rv-loc">Địa điểm</label>
                    <input id="rv-loc" type="text"
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      placeholder="Du khách từ Hà Nội · Tháng 5/2025"
                    />
                  </div>

                  {reviewError && (
                    <p style={{ color: "#dc2626", fontSize: ".82rem", textAlign: "center", margin: 0 }}>{reviewError}</p>
                  )}

                  <button type="submit" className="btn-price" disabled={reviewLoading} style={{ opacity: reviewLoading ? 0.7 : 1, marginTop: 4 }}>
                    {reviewLoading
                      ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Đang gửi...</>
                      : <><i className="fa-solid fa-paper-plane" style={{ marginRight: 8 }} />Gửi Đánh Giá</>}
                  </button>

                  {!userSession && (
                    <p style={{ textAlign: "center", fontSize: ".78rem", color: "#94a3b8" }}>
                      <a href="/dang-nhap" style={{ color: "var(--teal-dark)", fontWeight: 700 }}>Đăng nhập</a> để đánh giá được liên kết với tài khoản của bạn
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <header id="site-header" className={isScrolled ? "scrolled" : ""}>
        <div className="container">
          <nav role="navigation" aria-label="Điều hướng chính">
            <a href="#hero" className="nav-logo" onClick={(e) => scrollToSection(e, "hero")}>
              <img src="/logo.png" alt="Cao Bằng Travel Connect" style={{ height: 38, width: 38, objectFit: "contain", filter: isScrolled ? "none" : "brightness(0) invert(1)", mixBlendMode: isScrolled ? "multiply" : "normal", transition: "filter .35s" }} />
              <div className="nav-logo-text">
                <strong>Cao Bằng</strong>
                <span>Travel Connect</span>
              </div>
            </a>

            <ul className="nav-links" role="list">
              {[
                { id: "hero",         label: "Trang Chủ" },
                { id: "why-us",       label: "Giới Thiệu" },
                { id: "team",         label: "HDV & Tour" },
                { id: "destinations", label: "Điểm Đến" },
                { id: "gallery",      label: "Hình Ảnh" },
                { id: "cam-nang",     label: "Cẩm Nang" },
                { id: "footer",       label: "Liên Hệ" },
              ].map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className={activeSection === id ? "active" : ""} onClick={(e) => scrollToSection(e, id)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
              <i className="fa-solid fa-calendar-check" aria-hidden="true" /> ĐẶT HDV NGAY
            </a>

            {userSession ? (
              <a href="/tai-khoan" className="nav-user-btn" style={{ position: "relative" }}>
                <i className={`fa-solid ${userProfile ? getTier(userProfile.points).icon : "fa-award"}`}
                   style={{ color: userProfile ? getTier(userProfile.points).color : "#cd7f32" }} />
                <span>Tài Khoản</span>
                {unreadReplies > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "#dc2626", color: "white",
                    borderRadius: "50%", width: 17, height: 17,
                    fontSize: ".6rem", fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid white",
                  }}>{unreadReplies}</span>
                )}
              </a>
            ) : (
              <a href="/dang-nhap" className="nav-user-btn">
                <i className="fa-solid fa-user" />
                <span>Đăng Nhập</span>
              </a>
            )}

            <button
              className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}
              aria-label="Mở menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span /><span /><span />
            </button>
          </nav>
        </div>

        <nav className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`} aria-label="Menu điều hướng di động">
          {[
            { id: "hero",         label: "Trang Chủ" },
            { id: "why-us",       label: "Giới Thiệu" },
            { id: "team",         label: "HDV & Tour" },
            { id: "destinations", label: "Điểm Đến" },
            { id: "gallery",      label: "Hình Ảnh" },
            { id: "cam-nang",     label: "Cẩm Nang" },
            { id: "pricing",      label: "Bảng Giá" },
            { id: "footer",       label: "Liên Hệ" },
          ].map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={(e) => scrollToSection(e, id)}>{label}</a>
          ))}
          <a href="#pricing" className="btn-cta" onClick={(e) => scrollToSection(e, "pricing")}>
            <i className="fa-solid fa-calendar-check" /> ĐẶT HDV NGAY
          </a>
        </nav>
      </header>

      <main>
        {/* ==================== HERO ==================== */}
        <section className="hero" id="hero" aria-label="Ảnh bìa - Khám phá Cao Bằng">
          {heroVideo ? (
            <video
              className="hero-bg"
              autoPlay muted loop playsInline
              poster={heroBg || undefined}
              aria-hidden="true"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          ) : (
            <div
              className="hero-bg"
              role="img"
              aria-label="Thác Bản Giốc Cao Bằng"
              style={heroBg ? { backgroundImage: `url('${heroBg}')` } : undefined}
            />
          )}
          <div className="hero-overlay" aria-hidden="true" />
          <div ref={heroMistRef} className="hero-mist" aria-hidden="true" />
          {/* Body — flex-1, centered */}
          <div className="hero-body">
            <div className="hero-content">
              <div className="hero-badge">
                <i className="fa-solid fa-leaf" /> Hướng Dẫn Viên Địa Phương · Cao Bằng, Việt Nam
              </div>
              <h1>Khám Phá<br />Cao Bằng</h1>
              <p className="hero-tagline">Cùng Hướng Dẫn Viên Địa Phương</p>
              <p className="hero-sub">Chuyên Nghiệp · Am Hiểu · Tận Tâm · Hành trình trọn vẹn</p>
              <div className="hero-actions">
                <a href="#team" className="btn-hero-primary" onClick={(e) => scrollToSection(e, "team")}>
                  <i className="fa-solid fa-compass" aria-hidden="true" /> XEM CÁC HDV &amp; TOUR
                </a>
                <a href="#destinations" className="btn-hero-outline" onClick={(e) => scrollToSection(e, "destinations")}>
                  <i className="fa-solid fa-map-location-dot" aria-hidden="true" /> KHÁM PHÁ ĐIỂM ĐẾN
                </a>
              </div>
            </div>
          </div>

          {/* Bottom — stats */}
          <div className="hero-bottom">
            <div className="hero-stats" aria-label="Thống kê dịch vụ">
              <div className="hero-stat"><strong>50+</strong><span>Hướng Dẫn Viên</span></div>
              <div className="hero-stat"><strong>2000+</strong><span>Du Khách Hài Lòng</span></div>
              <div className="hero-stat"><strong>30+</strong><span>Điểm Tham Quan</span></div>
              <div className="hero-stat"><strong>5★</strong><span>Đánh Giá TB</span></div>
            </div>
          </div>

          {/* Weather widget — ngoài hero-content, không đè lên stats */}
          {weather && (() => {
            const w = weatherIcon(weather.code);
            return (
              <div style={{ position: "absolute", top: 80, right: 20, background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, color: "white", border: "1px solid rgba(255,255,255,.18)", zIndex: 10 }}>
                <i className={`fa-solid ${w.icon}`} style={{ fontSize: 20, color: w.color }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: "1rem", lineHeight: 1 }}>{weather.temp}°C</p>
                  <p style={{ margin: "2px 0 0", fontSize: ".65rem", opacity: .75 }}>{w.label} · {weather.wind} km/h</p>
                  <p style={{ margin: "1px 0 0", fontSize: ".6rem", opacity: .5 }}>Cao Bằng, Việt Nam</p>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ==================== ABOUT / GIỚI THIỆU ==================== */}
        <section style={{ background: "#f0ede4", position: "relative", zIndex: 1, overflow: "hidden" }}>
          {/* Linen texture */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(180,160,120,.04) 28px,rgba(180,160,120,.04) 29px),repeating-linear-gradient(90deg,transparent,transparent 28px,rgba(180,160,120,.03) 28px,rgba(180,160,120,.03) 29px)", pointerEvents: "none" }} />

          <div className="container about-grid">
            {/* LEFT — Text */}
            <div>
              <p style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#6b8f5e", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 32, height: 2, background: "#6b8f5e", borderRadius: 2 }} />
                Khám Phá Cao Bằng
              </p>

              <h2 style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, fontStyle: "italic", lineHeight: 1.38, marginBottom: 28, color: "#1a3a18" }}>
                Cao Bằng — vùng đất biên cương hùng vĩ phương Bắc,{" "}
                <span style={{ opacity: .38, fontWeight: 400 }}>nơi thiên nhiên hoang sơ và văn hóa dân tộc hòa quyện thành những hành trình không thể quên.</span>
              </h2>

              <p style={{ fontSize: ".95rem", color: "#3d3d2d", lineHeight: 1.88, marginBottom: 18 }}>
                Nằm ở cực Đông Bắc Việt Nam, Cao Bằng là vùng đất của những thác nước hùng vĩ, hang động kỳ bí và bản làng dân tộc còn nguyên vẹn nét đẹp ngàn đời.{" "}
                <strong style={{ color: "#2d5a27" }}>Thác Bản Giốc</strong> — một trong những thác nước đẹp nhất Đông Nam Á,{" "}
                <strong style={{ color: "#2d5a27" }}>Động Ngườm Ngao</strong>,{" "}
                <strong style={{ color: "#2d5a27" }}>hồ Thang Hen</strong>... mỗi địa danh là một trang thơ của tạo hóa.
              </p>

              <p style={{ fontSize: ".95rem", color: "#3d3d2d", lineHeight: 1.88, marginBottom: 44 }}>
                Không chỉ là thiên nhiên, Cao Bằng còn là cái nôi lịch sử với{" "}
                <strong style={{ color: "#2d5a27" }}>di tích Pác Bó</strong> thiêng liêng. Văn hóa Tày, Nùng đặc sắc cùng ẩm thực độc đáo — phở chua, bánh coóng phù, hạt dẻ Trùng Khánh — tạo nên hành trình đa chiều, sâu sắc và đầy cảm xúc.
              </p>

              <a href="#destinations" onClick={e => scrollToSection(e, "destinations")}
                style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#2d5a27", color: "white", padding: "14px 32px", borderRadius: 4, fontWeight: 700, fontSize: ".86rem", letterSpacing: ".08em", textTransform: "uppercase", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#1e3e1a"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#2d5a27"}>
                Khám Phá Ngay <i className="fa-solid fa-arrow-right" />
              </a>
            </div>

            {/* RIGHT — Polaroid */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative", transform: "rotate(3deg)", transition: "transform .4s ease" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.02)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "rotate(3deg)"}>
                {/* Paper clip */}
                <div style={{ position: "absolute", top: -28, right: 36, fontSize: "2.2rem", transform: "rotate(-12deg)", userSelect: "none", zIndex: 2, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.2))" }}>📎</div>
                {/* Polaroid */}
                <div style={{ background: "white", padding: "12px 12px 56px", boxShadow: "0 10px 40px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.08)", maxWidth: 400 }}>
                  <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", background: "#d4c9aa" }}>
                    {aboutImage
                      ? <img src={aboutImage} alt="Cao Bằng Travel Team" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#9a8a6a" }}>
                          <i className="fa-solid fa-camera" style={{ fontSize: 36 }} />
                          <span style={{ fontSize: ".82rem", fontWeight: 600 }}>Thêm ảnh từ Admin → Cài Đặt</span>
                        </div>
                    }
                  </div>
                  {/* IG actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 8, paddingTop: 4, borderTop: "1px solid #f0f0f0" }}>
                    <i className="fa-solid fa-heart" style={{ color: "#e33", fontSize: "1.15rem" }} />
                    <i className="fa-regular fa-comment" style={{ color: "#444", fontSize: "1rem" }} />
                    <i className="fa-regular fa-paper-plane" style={{ color: "#444", fontSize: "1rem" }} />
                    <span style={{ marginLeft: "auto", fontSize: ".7rem", color: "#999", fontWeight: 600 }}>#caobangtravel</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-caveat), cursive", fontSize: "1.5rem", fontWeight: 700, color: "#2d5a27", margin: 0, lineHeight: 1.15 }}>
                    Cao Bằng Travel Team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Marquee */}
          <div style={{ overflow: "hidden", borderTop: "1px solid rgba(45,90,39,.12)", marginTop: 0 }}>
            <div className="about-marquee-track">
              {[0, 1].map(i => (
                <span key={i} className="about-marquee-text">
                  Chuyên Nghiệp · Am Hiểu · Tận Tâm · Hành Trình Trọn Vẹn ·&nbsp;&nbsp;
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== WHY CHOOSE US ==================== */}
        <section className="why-us" id="why-us" aria-labelledby="why-heading"
          style={{ background: `linear-gradient(rgba(237,231,218,.90),rgba(237,231,218,.90)),url('${whyusBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Vì Sao Chọn Chúng Tôi</span>
              <h2 className="section-title" id="why-heading">Tại Sao Chọn Chúng Tôi?</h2>
              <p className="section-subtitle">Chúng tôi cung cấp những trải nghiệm du lịch sinh thái độc đáo và chân thực nhất tại Cao Bằng</p>
            </div>
            <div className="features-grid">
              {[
                { icon: "fa-map-pin",  title: "Kiến Thức Bản Địa Điểm", desc: "Hướng dẫn viên sinh ra và lớn lên tại Cao Bằng, am hiểu sâu về văn hóa, lịch sử và địa hình từng điểm đến bản địa." },
                { icon: "fa-route",    title: "Lộ Trình Thiết Kế Riêng", desc: "Mỗi chuyến đi được cá nhân hóa theo sở thích và nhu cầu của từng đoàn khách, đảm bảo trải nghiệm tốt nhất." },
                { icon: "fa-headset",  title: "Hỗ Trợ 24/7",             desc: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc và đảm bảo an toàn cho du khách trên toàn bộ hành trình." },
              ].map(({ icon, title, desc }) => (
                <article key={title} className="feature-card fade-up">
                  <div className="feature-icon" aria-hidden="true"><i className={`fa-solid ${icon}`} /></div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== TEAM ==================== */}
        <section className="team" id="team" aria-labelledby="team-heading"
          style={{ background: `linear-gradient(rgba(255,255,255,.91),rgba(255,255,255,.91)),url('${teamBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Đội Ngũ Chuyên Nghiệp</span>
              <h2 className="section-title" id="team-heading">Đội Ngũ Hướng Dẫn Viên Biểu Tượng</h2>
              <p className="section-subtitle">Những hướng dẫn viên giàu kinh nghiệm, tận tâm và am hiểu sâu về vùng đất Cao Bằng</p>
            </div>
            {/* Search & filter — nền trắng nên dùng màu tối */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28, justifyContent: "center" }}>
              <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 13 }} />
                <input
                  type="text" value={guideSearch} onChange={(e) => { setGuideSearch(e.target.value); setCurrentPage(0); }}
                  placeholder="Tìm theo tên, chuyên môn..."
                  style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
                />
              </div>
              <select value={guideFilterLang} onChange={(e) => { setGuideFilterLang(e.target.value); setCurrentPage(0); }}
                style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                <option value="">🌐 Ngôn ngữ</option>
                <option value="English">English</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
              </select>
              <select value={guideFilterRating} onChange={(e) => { setGuideFilterRating(e.target.value); setCurrentPage(0); }}
                style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#1a2e2e", fontSize: ".84rem", outline: "none", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                <option value="">⭐ Đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4.5">4.5+ sao</option>
                <option value="4">4+ sao</option>
              </select>
              {(guideSearch || guideFilterLang || guideFilterRating) && (
                <button onClick={() => { setGuideSearch(""); setGuideFilterLang(""); setGuideFilterRating(""); }}
                  style={{ padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, background: "white", color: "#64748b", fontSize: ".82rem", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
                  <i className="fa-solid fa-xmark" style={{ marginRight: 5 }} />Xóa lọc
                </button>
              )}
            </div>

            <div className="team-grid">
              {filteredGuides.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                  <i className="fa-solid fa-person-hiking" style={{ fontSize: 36, marginBottom: 12, display: "block" }} />
                  <p style={{ fontWeight: 700, color: "#475569" }}>Không tìm thấy HDV phù hợp</p>
                  <p style={{ fontSize: ".82rem", marginTop: 4 }}>Thử điều chỉnh bộ lọc của bạn</p>
                </div>
              ) : filteredGuides.map((member) => (
                <article key={member.id} className="team-card fade-up">
                  <a href={`/hdv/${member.id}`} className="team-card-img-wrap" aria-label={`Xem hồ sơ ${member.name}`} style={{ display: "block", textDecoration: "none", cursor: "pointer" }}>
                    <img className="team-card-img" src={member.image_url} alt={`HDV ${member.name}`} loading="lazy" />
                    <span className="team-card-badge">{member.rating}★</span>
                    <span style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .25s", borderRadius: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }} className="team-card-hover-overlay">
                      <span style={{ background: "rgba(38,92,89,.85)", color: "white", padding: "7px 16px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, opacity: 0, transition: "opacity .25s" }} className="team-card-view-label">
                        <i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Xem hồ sơ
                      </span>
                    </span>
                  </a>
                  <h3>{member.name}</h3>
                  <p>{member.specialty}</p>
                  <p className="hdv-role">{member.role}</p>
                  <div className="team-stars" aria-label={`${member.rating} sao`}>
                    <StarIcons rating={member.rating} />
                  </div>
                  {member.zalo_number && (
                    <a
                      href={`https://zalo.me/${member.zalo_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="team-zalo-btn"
                      aria-label={`Chat Zalo với ${member.name}`}
                    >
                      <i className="fa-brands fa-comment-dots" /> Chat Zalo
                    </a>
                  )}
                </article>
              ))}
            </div>

            {/* Nút xem tất cả / thu gọn */}
            {/* Xem tất cả → trang /hdv riêng */}
            <div style={{ textAlign: "center", marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/hdv"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 12, border: "2px solid #265C59", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".9rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(38,92,89,.25)" }}>
                <i className="fa-solid fa-users" />Xem tất cả hướng dẫn viên
              </a>
            </div>
          </div>
        </section>

        {/* ==================== DESTINATIONS ==================== */}
        <section className="destinations" id="destinations" aria-labelledby="dest-heading"
          style={{ background: `linear-gradient(to bottom,rgba(20,52,52,.55),rgba(20,52,52,.62)),url('${destBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
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
              />
              <div className="dest-map-overlay" aria-hidden="true" />
            </div>

            <div className="dest-grid">
              {destinations.map((dest) => (
                <article key={dest.id} className="dest-card fade-up" onClick={() => setSelectedDest(dest)}
                  style={{ cursor: "pointer" }}>
                  <div className="dest-card-img-wrap" style={{ position: "relative" }}>
                    <img className="dest-card-img" src={dest.image_url} alt={dest.title} loading="lazy" />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,.3)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"}>
                      <span style={{ background: "rgba(38,92,89,.9)", color: "white", padding: "7px 16px", borderRadius: 20, fontSize: ".75rem", fontWeight: 700, opacity: 0, transition: "opacity .2s" }}
                        className="dest-hover-label">
                        <i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} />Xem chi tiết
                      </span>
                    </div>
                  </div>
                  <div className="dest-card-body">
                    <h3>{dest.title}</h3>
                    <p>{dest.description}</p>
                    {destsFromDB && (
                      <a href={`/diem-den/${dest.id}`} onClick={e => e.stopPropagation()}
                        style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 5, color: "#265C59", fontSize: ".78rem", fontWeight: 700, textDecoration: "none" }}>
                        Đọc thêm <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Destination detail modal */}
            {selectedDest && (
              <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
                onClick={() => setSelectedDest(null)}>
                <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.3)" }}
                  onClick={(e) => e.stopPropagation()}>
                  <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                    <img src={selectedDest.image_url} alt={selectedDest.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 50%)" }} />
                    <button onClick={() => setSelectedDest(null)}
                      style={{ position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.45)", color: "white", cursor: "pointer", fontSize: ".9rem" }}>
                      <i className="fa-solid fa-xmark" />
                    </button>
                    <h2 style={{ position: "absolute", bottom: 16, left: 20, color: "white", fontWeight: 900, fontSize: "1.3rem", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,.4)" }}>{selectedDest.title}</h2>
                  </div>
                  <div style={{ padding: "24px 28px" }}>
                    <p style={{ color: "#334155", fontSize: ".92rem", lineHeight: 1.8, marginBottom: 24 }}>{selectedDest.description}</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button onClick={() => { setSelectedDest(null); openBooking(`Tham quan ${selectedDest.title}`); }}
                        style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#265C59", color: "white", fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}>
                        <i className="fa-solid fa-calendar-check" style={{ marginRight: 7 }} />Đặt tour tham quan
                      </button>
                      {destsFromDB && (
                        <a href={`/diem-den/${selectedDest.id}`}
                          style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #265C59", background: "white", color: "#265C59", fontWeight: 700, fontSize: ".88rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <i className="fa-solid fa-arrow-up-right-from-square" />Xem chi tiết
                        </a>
                      )}
                      <button onClick={() => setSelectedDest(null)}
                        style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#475569", fontWeight: 700, fontSize: ".88rem", cursor: "pointer" }}>
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <a href="/diem-den" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 50, border: "2px solid rgba(255,255,255,.5)", color: "white", fontWeight: 700, fontSize: ".84rem", textDecoration: "none", backdropFilter: "blur(6px)", background: "rgba(255,255,255,.1)", letterSpacing: ".04em" }}>
                <i className="fa-solid fa-map-location-dot" /> Xem Tất Cả Điểm Đến <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
        </section>

        {/* ==================== TOURS ==================== */}
        <section id="tours" style={{ padding: "72px 0", background: `linear-gradient(rgba(248,249,248,.91),rgba(248,249,248,.91)),url('${toursBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Khám Phá Ngay</span>
              <h2 className="section-title">Các Gói Tour Nổi Bật</h2>
              <p className="section-subtitle">Lựa chọn hành trình phù hợp — từ tour 1 ngày đến khám phá dài ngày trọn vẹn</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20, marginBottom: 28 }}>
              {tours.map((t) => (
                <a key={t.id} href={`/tour/${t.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,.07)", transition: "transform .2s,box-shadow .2s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 10px 30px rgba(0,0,0,.13)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ""; el.style.boxShadow = "0 2px 14px rgba(0,0,0,.07)"; }}>
                    {/* Image */}
                    <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                      {t.image_url
                        ? <img src={t.image_url} alt={t.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .3s" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fa-solid fa-map" style={{ fontSize: 40, color: "#94a3b8" }} /></div>}
                      {t.price_from > 0 && (
                        <div style={{ position: "absolute", top: 10, right: 10, background: "#265C59", color: "white", borderRadius: 8, padding: "4px 10px", fontSize: ".72rem", fontWeight: 800 }}>
                          Từ {t.price_from.toLocaleString("vi-VN")}đ
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div style={{ padding: "18px 20px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                          <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{t.duration}
                        </span>
                        <span style={{ background: "#f0faf9", color: "#265C59", borderRadius: 6, padding: "3px 9px", fontSize: ".7rem", fontWeight: 700 }}>
                          <i className="fa-solid fa-users" style={{ marginRight: 4 }} />{t.group_size}
                        </span>
                      </div>
                      <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: ".95rem", margin: "0 0 8px", lineHeight: 1.4 }}>{t.title}</h3>
                      <p style={{ color: "#64748b", fontSize: ".82rem", lineHeight: 1.7, margin: "0 0 14px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {t.description}
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {t.zalo_number && (
                          <a href={`https://zalo.me/${t.zalo_number}`} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "#265C59", color: "white", fontWeight: 700, fontSize: ".75rem", textDecoration: "none" }}>
                            <i className="fa-brands fa-comment-dots" />Zalo: {t.zalo_number}
                          </a>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", color: "#475569", fontSize: ".75rem", fontWeight: 600 }}>
                          Xem chi tiết <i className="fa-solid fa-arrow-right" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <a href="/tour" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 50, border: "2px solid #265C59", color: "#265C59", fontWeight: 700, fontSize: ".84rem", textDecoration: "none", background: "white", letterSpacing: ".04em" }}>
                <i className="fa-solid fa-map" /> Xem Tất Cả Gói Tour <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
        </section>

        {/* ==================== GALLERY SCRAPBOOK ==================== */}
        <section className="gallery" id="gallery" aria-labelledby="gallery-heading"
          style={{ background: "#f5f2ec", padding: "72px 0 64px", overflow: "hidden" }}>

          {/* Title — centered above scatter */}
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

          {/* Full-width scatter area */}
          <div style={{ position: "relative", width: "100%", height: 480, overflow: "hidden" }}>

            {/* Photo 0 — far left, clipped */}
            {galleryImages[0] && (
              <a href="/thu-vien" style={{ position: "absolute", left: "-1%", top: 80, width: "13%", minWidth: 110, zIndex: 2, textDecoration: "none", background: "white", padding: "8px 8px 30px", boxShadow: "0 6px 20px rgba(0,0,0,.14)", transform: "rotate(-8deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(-8deg)"; el.style.zIndex="2"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.14)"; }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[0].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
              </a>
            )}

            {/* Photo 1 */}
            {galleryImages[1] && (
              <a href="/thu-vien" style={{ position: "absolute", left: "8%", top: 110, width: "16%", minWidth: 130, zIndex: 3, textDecoration: "none", background: "white", padding: "9px 9px 32px", boxShadow: "0 6px 20px rgba(0,0,0,.13)", transform: "rotate(5deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(5deg)"; el.style.zIndex="3"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.13)"; }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[1].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
                <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".85rem", color:"#7a6a50", textAlign:"center", marginTop:7, fontWeight:600 }}>#caobangtravel</p>
              </a>
            )}

            {/* Photo 2 */}
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
                {/* IG header */}
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderBottom:"1px solid #f0f0f0" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"#ddd" }}>
                    <img src={galleryImages[3].image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <span style={{ fontSize:".72rem", fontWeight:700, color:"#1a1a1a" }}>caobangtravel</span>
                </div>
                {/* Image */}
                <div style={{ aspectRatio:"1", overflow:"hidden", position:"relative" }}>
                  <img src={galleryImages[3].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(255,220,50,.9)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,.2)" }}>
                      <i className="fa-solid fa-play" style={{ color:"#1a1a1a", fontSize:"1rem", marginLeft:3 }} />
                    </div>
                  </div>
                </div>
                {/* IG actions */}
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
              <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".95rem", color:"#7a6a50", lineHeight:1.5, fontWeight:600, fontStyle:"italic" }}>
                The pearl amidst the misty place
              </p>
              <p style={{ fontSize:"1.2rem", marginTop:6 }}>🌸🌼</p>
            </div>

            {/* Photo 4 */}
            {galleryImages[4] && (
              <a href="/thu-vien" style={{ position: "absolute", left: "63%", top: 105, width: "16%", minWidth: 130, zIndex: 4, textDecoration: "none", background: "white", padding: "9px 9px 32px", boxShadow: "0 6px 20px rgba(0,0,0,.13)", transform: "rotate(6deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(6deg)"; el.style.zIndex="4"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.13)"; }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[4].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
                <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".85rem", color:"#7a6a50", textAlign:"center", marginTop:7, fontWeight:600 }}>#caobangtravel</p>
              </a>
            )}

            {/* Photo 5 */}
            {galleryImages[5] && (
              <a href="/thu-vien" style={{ position: "absolute", left: "77%", top: 35, width: "16%", minWidth: 130, zIndex: 3, textDecoration: "none", background: "white", padding: "9px 9px 32px", boxShadow: "0 6px 20px rgba(0,0,0,.13)", transform: "rotate(-5deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(-5deg)"; el.style.zIndex="3"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.13)"; }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[5].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
                <p style={{ fontFamily:"var(--font-caveat),cursive", fontSize:".85rem", color:"#7a6a50", textAlign:"center", marginTop:7, fontWeight:600 }}>#caobangtravel</p>
              </a>
            )}

            {/* Photo 6 — far right, clipped */}
            {galleryImages[6] && (
              <a href="/thu-vien" style={{ position: "absolute", right: "-1%", top: 90, width: "13%", minWidth: 110, zIndex: 2, textDecoration: "none", background: "white", padding: "8px 8px 30px", boxShadow: "0 6px 20px rgba(0,0,0,.14)", transform: "rotate(5deg)", transition: "transform .3s, box-shadow .3s", display: "block" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(0deg) scale(1.06)"; el.style.zIndex="20"; el.style.boxShadow="0 16px 36px rgba(0,0,0,.2)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform="rotate(5deg)"; el.style.zIndex="2"; el.style.boxShadow="0 6px 20px rgba(0,0,0,.14)"; }}>
                <div style={{ aspectRatio:"1", overflow:"hidden", background:"#ddd" }}><img src={galleryImages[6].image_url} alt="" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} /></div>
              </a>
            )}

            {/* Cherry blossom */}
            <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", fontSize:"1.6rem", pointerEvents:"none", userSelect:"none", opacity:.7 }}>🌸🌺🌸</div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <a href="/thu-vien" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 50, background: "#3a6b3a", color: "white", fontWeight: 700, fontSize: ".86rem", textDecoration: "none", letterSpacing: ".04em", boxShadow: "0 4px 16px rgba(58,107,58,.3)" }}>
              <i className="fa-solid fa-images" /> Xem Tất Cả Hình Ảnh <i className="fa-solid fa-arrow-right" />
            </a>
          </div>
        </section>

        {/* ==================== CẨM NANG ==================== */}
        <section className="cam-nang" id="cam-nang" aria-labelledby="cam-nang-heading"
          style={{ background: `linear-gradient(rgba(14,42,40,.82),rgba(14,42,40,.78)),url('${camNangBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag" style={{ background: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.9)", border: "1px solid rgba(255,255,255,.22)" }}>Cẩm Nang Du Lịch</span>
              <h2 className="section-title" id="cam-nang-heading" style={{ color: "white" }}>Bí Quyết Khám Phá Cao Bằng</h2>
              <p className="section-subtitle" style={{ color: "rgba(255,255,255,.72)" }}>Những điều bạn cần biết để có chuyến đi trọn vẹn và an toàn</p>
            </div>
            <div className="cam-nang-grid">
              {(camNangFromDB ? camNangTips : [
                { id:"1", icon:"fa-calendar-sun",       tag:"Thời Điểm", color:"#f59e0b", title:"Mùa Đẹp Nhất",            description:"Tháng 9–11: lúa chín vàng, thác đầy nước, thời tiết mát mẻ. Tháng 3–4: hoa tam giác mạch nở rộ trên các sườn núi.", sort_order:1 },
                { id:"2", icon:"fa-bowl-food",          tag:"Ẩm Thực",   color:"#ef4444", title:"Đặc Sản Không Thể Bỏ Qua",description:"Bánh coóng phù, phở chua, lợn quay lá mắc mật, hạt dẻ Trùng Khánh — hương vị đặc trưng chỉ có ở Cao Bằng.",        sort_order:2 },
                { id:"3", icon:"fa-motorcycle",         tag:"Di Chuyển", color:"#8b5cf6", title:"Phương Tiện Phù Hợp",      description:"Xe máy là lựa chọn tốt nhất. Đường đèo quanh co nhưng cảnh đẹp hùng vĩ — thuê xe tại thị xã hoặc đi cùng HDV.",   sort_order:3 },
                { id:"4", icon:"fa-camera-retro",       tag:"Nhiếp Ảnh", color:"#06b6d4", title:"Góc Chụp Ảnh Đẹp Nhất",   description:"Cầu treo Bản Giốc, thuyền trên sông Quây Sơn, ruộng bậc thang Phia Oắc — ánh sáng buổi sáng sớm là lý tưởng nhất.", sort_order:4 },
                { id:"5", icon:"fa-hand-holding-heart", tag:"Văn Hóa",   color:"#10b981", title:"Tôn Trọng Phong Tục",      description:"Dân tộc Tày, Nùng chiếm đa số. Hỏi phép trước khi chụp ảnh, tìm hiểu phong tục trước khi đến thăm bản làng.",      sort_order:5 },
                { id:"6", icon:"fa-shield-halved",      tag:"An Toàn",   color:"#f97316", title:"Lưu Ý Quan Trọng",         description:"Mang theo thuốc chống muỗi, kem chống nắng và giày trekking chắc chắn. Đặt HDV địa phương để đảm bảo an toàn tối đa.", sort_order:6 },
              ]).map(({ id, icon, tag, color, title, description }) => {
                const cardInner = (
                  <>
                    <div className="cam-nang-card-top">
                      <span className="cam-nang-tag" style={{ background: color + "22", color }}>{tag}</span>
                      <div className="cam-nang-icon" style={{ background: color + "18" }}>
                        <i className={`fa-solid ${icon}`} style={{ color }} />
                      </div>
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    {camNangFromDB && (
                      <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, color, fontSize: ".78rem", fontWeight: 700 }}>
                        Đọc thêm <i className="fa-solid fa-arrow-right" style={{ fontSize: ".7rem" }} />
                      </div>
                    )}
                  </>
                );
                return camNangFromDB
                  ? <a key={id} href={`/cam-nang/${id}`} className="cam-nang-card fade-up" style={{ textDecoration: "none", display: "block" }}>{cardInner}</a>
                  : <article key={id} className="cam-nang-card fade-up">{cardInner}</article>;
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <a href="/cam-nang" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 28px", borderRadius: 50, border: "2px solid rgba(255,255,255,.5)", color: "white", fontWeight: 700, fontSize: ".84rem", textDecoration: "none", backdropFilter: "blur(6px)", background: "rgba(255,255,255,.1)", letterSpacing: ".04em" }}>
                <i className="fa-solid fa-book-open" /> Xem Tất Cả Cẩm Nang <i className="fa-solid fa-arrow-right" />
              </a>
            </div>
          </div>
        </section>

        {/* ==================== PRICING ==================== */}
        <section className="pricing" id="pricing" aria-labelledby="pricing-heading"
          style={{ background: `linear-gradient(135deg,rgba(10,35,35,.90),rgba(26,60,55,.86),rgba(15,45,40,.90)),url('${pricingBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Bảng Giá Minh Bạch</span>
              <h2 className="section-title" id="pricing-heading">Bảng Giá Dịch Vụ HDV</h2>
              <p className="section-subtitle">Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn</p>
            </div>

            <div className="pricing-grid">
              {/* HDV Cá Nhân */}
              <article className="price-card fade-up">
                <h3>HDV Cá Nhân</h3>
                <p className="price-subtitle">Dành cho 1–2 người</p>
                <ul>
                  {["HDV 1 cả ngày", "Lộ trình riêng", "Phiên dịch", "Cá nhân hóa", "Hỗ trợ 24/7"].map((item) => (
                    <li key={item}><i className="fa-solid fa-check" /> {item}</li>
                  ))}
                </ul>
                <button className="btn-price" onClick={() => openBooking("HDV Cá Nhân · 500.000đ / Ngày")} aria-label="Đặt gói HDV Cá Nhân">
                  500.000đ / Ngày
                </button>
              </article>

              {/* HDV Đoàn */}
              <article className="price-card featured fade-up">
                <h3>HDV Đoàn</h3>
                <p className="price-subtitle">Dành cho 5–20 người</p>
                <ul>
                  {["HDV 1 cả ngày", "HDV trưởng nhóm", "Lộ trình đoàn", "Xe riêng", "Hỗ trợ 24/7"].map((item) => (
                    <li key={item}><i className="fa-solid fa-check" /> {item}</li>
                  ))}
                </ul>
                <button className="btn-price" onClick={() => openBooking("HDV Đoàn · 650.000đ / Ngày")} aria-label="Đặt gói HDV Đoàn">
                  650.000đ / Ngày
                </button>
              </article>

              {/* HDV Xe Máy */}
              <article className="price-card fade-up">
                <h3>HDV Xe Máy</h3>
                <p className="price-subtitle">Phượt cung đường đẹp</p>
                <ul>
                  {["HDV 1 cả ngày", "Cho thuê xe máy", "HDV địa hình núi", "Bảo hiểm chuyến đi", "Hỗ trợ 24/7"].map((item) => (
                    <li key={item}><i className="fa-solid fa-check" /> {item}</li>
                  ))}
                </ul>
                <button className="btn-price" onClick={() => openBooking("HDV Xe Máy · 550.000đ / Ngày")} aria-label="Đặt gói HDV Xe Máy">
                  550.000đ / Ngày
                </button>
              </article>

              {/* Tìm kiếm HDV */}
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
                  <label htmlFor="destination-filter">Điểm Đến</label>
                  <select id="destination-filter" name="destination">
                    <option value="">Tất cả địa điểm</option>
                    {destinations.map((d) => (
                      <option key={d.id}>{d.title}</option>
                    ))}
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
                <button className="btn-search" type="button" onClick={() => openBooking("Tư vấn chọn HDV")}>
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Tìm Kiếm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== TESTIMONIALS ==================== */}
        <section className="testimonials" id="testimonials" aria-labelledby="testi-heading"
          style={{ background: `linear-gradient(150deg,rgba(13,40,38,.88),rgba(26,60,58,.85),rgba(17,46,44,.88)),url('${testimonialsBg}') center/cover no-repeat` }}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Khách Hàng Nói Gì</span>
              <h2 className="section-title" id="testi-heading">Ý Kiến Khách Hàng</h2>
              <p className="section-subtitle">Những chia sẻ chân thực từ du khách đã trải nghiệm dịch vụ của chúng tôi</p>
              <button
                onClick={openReview}
                style={{
                  marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 22px", borderRadius: 30,
                  background: "var(--teal-dark)", color: "white",
                  border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: ".84rem", fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(38,92,89,.3)", transition: "all .2s",
                }}
              >
                <i className="fa-solid fa-star" /> Viết Đánh Giá
              </button>
            </div>

            <div className="carousel-wrapper">
              <div className="carousel-track">
                {reviews.map((review, i) => {
                  const isVisible = i >= currentPage * cardsPerPage && i < (currentPage + 1) * cardsPerPage;
                  const initials = review.reviewer_name
                    .split(" ").map((w: string) => w[0]).slice(-2).join("").toUpperCase();
                  return (
                    <article key={review.id} className="review-card" style={{ display: isVisible ? "flex" : "none" }}>
                      <div className="review-stars" aria-label={`${review.stars} sao`}>
                        <StarIcons rating={review.stars} />
                        <span style={{ fontSize: ".74rem", fontWeight: 700, color: "#94a3b8", marginLeft: 6 }}>
                          {review.stars}.0
                        </span>
                      </div>
                      <blockquote className="review-text">{review.review_text}</blockquote>
                      <footer className="reviewer">
                        {review.avatar_url
                          ? <img className="reviewer-avatar" src={review.avatar_url} alt={review.reviewer_name} loading="lazy" />
                          : <div className="reviewer-initial">{initials}</div>}
                        <div className="reviewer-info">
                          <h4>{review.reviewer_name}</h4>
                          <span>{review.reviewer_location}</span>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="carousel-nav">
              <button className="carousel-btn prev" onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0} aria-label="Trang trước">
                <i className="fa-solid fa-chevron-left" />
              </button>
              <div className="carousel-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i}
                    className={`carousel-dot${i === currentPage ? " active" : ""}`}
                    onClick={() => handlePageChange(i)} aria-label={`Trang ${i + 1}`} />
                ))}
              </div>
              <button className="carousel-btn next" onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1} aria-label="Trang tiếp theo">
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== SOS / KHẨN CẤP ==================== */}
        <section id="sos" style={{ padding: "40px 0", background: `linear-gradient(rgba(20,40,40,.92),rgba(20,40,40,.92)),url('${sosBg}') center/cover no-repeat` }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: "white", fontSize: 18 }} />
              </div>
              <div>
                <h2 style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>Hotline Khẩn Cấp tại Cao Bằng</h2>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", margin: "3px 0 0" }}>Lưu lại các số điện thoại này trước khi lên đường</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { icon: "fa-shield-halved",    label: "Công An Cao Bằng",   num: "069.259.3068",  color: "#3B82F6" },
                { icon: "fa-truck-medical",    label: "Cấp Cứu 115",         num: "115",           color: "#EF4444" },
                { icon: "fa-fire-extinguisher",label: "Phòng Cháy 114",      num: "114",           color: "#F97316" },
                { icon: "fa-hospital",         label: "BV Đa Khoa Cao Bằng", num: "0206.3852.021", color: "#10B981" },
                { icon: "fa-person-hiking",    label: "Ban Quản Lý Du Lịch", num: "0206.3853.726", color: "#8B5CF6" },
                { icon: "fa-headset",          label: "Hỗ Trợ Tour 24/7",    num: "1800.CAOBANG",  color: "#265C59" },
              ].map((c) => (
                <a key={c.label} href={`tel:${c.num.replace(/\./g, "")}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`fa-solid ${c.icon}`} style={{ color: c.color, fontSize: 15 }} />
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,.65)", fontSize: ".68rem", margin: 0 }}>{c.label}</p>
                    <p style={{ color: "white", fontWeight: 800, fontSize: ".88rem", margin: "2px 0 0", fontFamily: "monospace" }}>{c.num}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer id="footer" aria-label="Chân trang" style={{ position: "relative", overflow: "hidden", color: "#1a2e2e", padding: 0 }}>
        {/* Background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(238,234,222,.88)" }} />

        {/* Watermark chữ CAO BẰNG */}
        <div className="ftv2-watermark">CAO BẰNG</div>

        {/* Hiệu ứng đám mây */}
        <div className="ftv2-cloud ftv2-cloud-1" />
        <div className="ftv2-cloud ftv2-cloud-2" />
        <div className="ftv2-cloud ftv2-cloud-3" />
        <div className="ftv2-cloud ftv2-cloud-4" />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* TOP GRID */}
          <div className="ftv2-grid">

            {/* Brand */}
            <div className="ftv2-brand">
              <img src="/logo.png" alt="Cao Bằng Travel" style={{ width: 64, height: 64, objectFit: "contain" }} />
              <div className="ftv2-brand-text">
                <strong>CAO BẰNG</strong>
                <span>TRAVEL CONNECT</span>
              </div>
            </div>

            {/* TOUR */}
            <div className="ftv2-col">
              <h5 className="ftv2-heading">TOUR</h5>
              <a href="/hdv" className="ftv2-link">Tour Xe Máy</a>
              <a href="/hdv" className="ftv2-link">Tour Jeep</a>
              <a href="/hdv" className="ftv2-link">Tour Gói</a>
              <a href="/dat-lich" className="ftv2-link">Đặt Lịch Tùy Chỉnh</a>
            </div>

            {/* KHÁM PHÁ */}
            <div className="ftv2-col">
              <h5 className="ftv2-heading">KHÁM PHÁ</h5>
              <a href="#destinations" className="ftv2-link" onClick={(e) => scrollToSection(e, "destinations")}>Điểm Đến</a>
              <a href="#gallery" className="ftv2-link" onClick={(e) => scrollToSection(e, "gallery")}>Thư Viện Ảnh</a>
              <a href="#reviews" className="ftv2-link" onClick={(e) => scrollToSection(e, "reviews")}>Đánh Giá</a>
              <a href="/tai-khoan" className="ftv2-link">Tài Khoản</a>
            </div>

            {/* LIÊN HỆ + HOTLINE */}
            <div className="ftv2-col">
              <h5 className="ftv2-heading">LIÊN HỆ</h5>
              <div className="ftv2-info"><i className="fa-solid fa-location-dot" /> Tp. Cao Bằng, Việt Nam</div>
              <div className="ftv2-info"><i className="fa-solid fa-envelope" /> info@caobangtravel.com</div>
              <h5 className="ftv2-heading" style={{ marginTop: 20 }}>HOTLINE</h5>
              <div className="ftv2-info"><i className="fa-solid fa-phone" /> +84 365 128 823</div>
              <div className="ftv2-info"><i className="fa-solid fa-phone" /> +84 916 361 128</div>
            </div>

            {/* ĐĂNG KÝ + SOCIAL */}
            <div className="ftv2-col">
              <h5 className="ftv2-heading">Liên Hệ Chúng Tôi</h5>
              <form onSubmit={handleContactSubmit}>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                  placeholder="Họ và tên" className="ftv2-input" autoComplete="name" required />
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Địa chỉ Email" className="ftv2-input" autoComplete="email" required />
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Số điện thoại" className="ftv2-input" autoComplete="tel" />
                <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Nội dung tin nhắn..." className="ftv2-input ftv2-textarea"
                  rows={3} required />
                {!userSession && (
                  <p style={{ fontSize: ".72rem", color: "#4a6260", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>
                    <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }} />
                    Đăng nhập để xem phản hồi từ chúng tôi trong tài khoản, Hoặc chúng tôi sẽ liên hệ đến bạn sớm nhất có thể. Chân thành cảm ơn !
                  </p>
                )}
                <button type="submit" className="ftv2-send-btn ftv2-send-full" disabled={contactLoading}>
                  {contactLoading
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Đang gửi...</>
                    : <><i className="fa-solid fa-paper-plane" /> Gửi Tin Nhắn</>}
                </button>
                {contactSuccess && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: ".74rem", color: "#265C59", fontWeight: 700 }}>
                      <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} /> Gửi thành công!
                    </p>
                    {userSession && (
                      <a href="/tai-khoan" style={{ fontSize: ".72rem", color: "#265C59", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                        <i className="fa-solid fa-envelope-open-text" style={{ fontSize: ".7rem" }} /> Xem phản hồi tại đây
                      </a>
                    )}
                  </div>
                )}
                {contactError && (
                  <p style={{ fontSize: ".74rem", color: "#dc2626", marginTop: 6 }}>{contactError}</p>
                )}
              </form>

              <h5 className="ftv2-heading" style={{ marginTop: 20 }}>THEO DÕI CHÚNG TÔI</h5>
              <div className="ftv2-socials">
                {[
                  { icon: "fa-brands fa-facebook-f", href: "#" },
                  { icon: "fa-brands fa-instagram",  href: "#" },
                  { icon: "fa-brands fa-tiktok",     href: "#" },
                ].map(({ icon, href }) => (
                  <a key={icon} href={href} className="ftv2-social" aria-label={icon}>
                    <i className={icon} />
                  </a>
                ))}
              </div>

              <a href="/dat-lich" className="ftv2-book-btn">Đặt Lịch Ngay</a>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="ftv2-bottom">
            <span>Chính sách Cookies</span>
            <span className="ftv2-bottom-copy">© 2025 Cao Bằng Travel Connect. Bảo lưu mọi quyền.</span>
            <span>Quyền Riêng Tư</span>
            <span>Điều Khoản Sử Dụng</span>
          </div>
        </div>
      </footer>

      <MusicPlayer src={musicSrc} />
    </>
  );
}
