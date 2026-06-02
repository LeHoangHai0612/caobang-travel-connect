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
import Header from "./components/layout/Header";
import MobileNav from "./components/layout/MobileNav";
import Footer from "./components/layout/Footer";
import HeroSection from "./components/sections/HeroSection";
import AboutSection from "./components/sections/AboutSection";
import WhyUsSection from "./components/sections/WhyUsSection";
import GuideGrid from "./components/sections/GuideGrid";
import DestinationGrid from "./components/sections/DestinationGrid";
import TourCategory from "./components/sections/TourCategory";
import TourCard from "./components/ui-custom/TourCard";
import FAQAccordion from "./components/sections/FAQAccordion";
import ContactForm from "./components/sections/ContactForm";
import GalleryScrapbook from "./components/sections/GalleryScrapbook";
import Testimonials from "./components/sections/Testimonials";
import PricingBooking from "./components/sections/PricingBooking";
import CamNangSection from "./components/sections/CamNangSection";


// ── Fallback data (hiển thị ngay khi chờ Supabase) ──────────────────────────
const FALLBACK_GUIDES: Guide[] = [
  { id: "f1", name: "A Tùng",   specialty: "HDV · Văn Hóa Nùng",        role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 5, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
  { id: "f2", name: "Chị Hoa",  specialty: "HDV · Văn Hóa Tày",          role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 4, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
  { id: "f3", name: "Anh Minh", specialty: "HDV · Trekking & Sinh Thái", role: "Chuyên gia HDV Sinh Thái", rating: 4.9, image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 6, languages: "Tiếng Việt, English", is_active: true, is_featured: false, created_at: "" },
  { id: "f4", name: "Chị Lan",  specialty: "HDV · Lịch Sử & Di Tích",   role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 7, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
  { id: "f5", name: "Anh Hùng", specialty: "HDV · Xe Máy Trekking",      role: "Chuyên gia HDV Xe Máy",   rating: 4.8, image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 5, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
  { id: "f6", name: "Chị Mai",  specialty: "HDV · Ẩm Thực & Văn Hóa",   role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 3, languages: "Tiếng Việt, English", is_active: true, is_featured: false, created_at: "" },
  { id: "f7", name: "Anh Việt", specialty: "HDV · Cắm Trại Rừng",        role: "Chuyên gia HDV Sinh Thái", rating: 4.9, image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 4, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
  { id: "f8", name: "Chị Thu",  specialty: "HDV · Homestay & Bản Làng",  role: "Chuyên gia HDV Sinh Thái", rating: 5,   image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face", zalo_number: "", bio: "", years_experience: 6, languages: "Tiếng Việt", is_active: true, is_featured: false, created_at: "" },
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

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMobileMenuOpen);
    return () => { document.body.classList.remove("menu-open"); };
  }, [isMobileMenuOpen]);

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
        supabase.from("guides").select("*").order("is_featured", { ascending: false }).order("rating", { ascending: false }).limit(20),
        supabase.from("destinations").select("*").order("sort_order").limit(6),
        supabase.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(6),
        supabase.from("gallery_images").select("*").order("sort_order").limit(8),
        supabase.from("site_settings").select("key,value"),
        supabase.from("tours").select("id,title,description,image_url,price_from,duration,group_size,zalo_number").eq("is_active", true).order("sort_order").limit(6),
        supabase.from("cam_nang_tips").select("*").eq("is_active", true).order("sort_order").limit(6),
      ]);
      if (g && g.length > 0) {
        const sorted = [...g].sort((a, b) => ((b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)));
        setGuides(sorted);
      }
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

  // Observer fade-up chạy lại mỗi khi data hoặc filter thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
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
        { threshold: 0.05, rootMargin: "0px 0px 0px 0px" }
      );
      fadeEls.forEach((el) => fadeObserver.observe(el));
      return () => fadeObserver.disconnect();
    }, 50);
    return () => clearTimeout(timer);
  }, [guides, destinations, reviews, guideSearch, guideFilterLang, guideFilterRating]);


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



  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Header
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        userSession={userSession}
        userProfile={userProfile}
        unreadReplies={unreadReplies}
      />
      <MobileNav
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        scrollToSection={scrollToSection}
        userSession={userSession}
        unreadReplies={unreadReplies}
      />

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
                    <input id="b-date" type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
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
                      <button type="button" onClick={() => setBookingGuideSearch("")}
                        style={{ marginTop: 4, background: "none", border: "none", color: "#94a3b8", fontSize: ".72rem", cursor: "pointer", padding: 0 }}>
                        <i className="fa-solid fa-xmark" style={{ marginRight: 4 }} />Xóa tìm kiếm
                      </button>
                    )}
                  </div>

                  {/* Loyalty discount banner */}
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
                    <p style={{ textAlign: "center", fontSize: ".78rem", color: "#94a3b8", margin: "6px 0 0 0" }}>
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

      {/* ==================== DESTINATION MODAL ==================== */}
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

      <main>
        <HeroSection
          backgroundImageUrl={heroBg}
          onSearch={(q) => console.log("Search:", q)}
        />

        <AboutSection
          aboutImage={aboutImage}
          scrollToSection={scrollToSection}
        />

        <WhyUsSection whyusBg={whyusBg} />

        <GuideGrid
          teamBg={teamBg}
          guides={guides}
        />

        <DestinationGrid
          destBg={destBg}
          destinations={destinations}
          setSelectedDest={setSelectedDest}
        />

        <TourCategory id="tours" title="Các Gói Tour Nổi Bật" subtitle="Lựa chọn hành trình phù hợp — từ tour 1 ngày đến khám phá dài ngày trọn vẹn" bgClass="bg-slate-50">
          {tours.map((t) => (
            <TourCard
              key={t.id}
              id={t.id}
              title={t.title}
              imageUrl={t.image_url}
              locationTag={t.group_size || "Tour Cao Bằng"}
              duration={t.duration}
              price={`${t.price_from.toLocaleString("vi-VN")}đ`}
              onBookNow={() => {
                setBookingPackage(t.title);
                setIsBookingOpen(true);
              }}
            />
          ))}
        </TourCategory>

        <GalleryScrapbook galleryImages={galleryImages} />

        <PricingBooking
          pricingBg={pricingBg}
          destinations={destinations}
          openBooking={openBooking}
        />

        <CamNangSection
          camNangBg={camNangBg}
          camNangFromDB={camNangFromDB}
          camNangTips={camNangTips}
        />

        <Testimonials
          testimonialsBg={testimonialsBg}
          reviews={reviews}
          openReview={openReview}
        />

        <FAQAccordion
          faqs={[
            { id: "faq-1", question: "Thời điểm lý tưởng nhất để du lịch Cao Bằng?", answer: "Từ tháng 8 đến tháng 10 là thời điểm Thác Bản Giốc nhiều nước và trong xanh nhất. Tháng 11-12 có hoa dã quỳ và tam giác mạch." },
            { id: "faq-2", question: "Đường đi từ Hà Nội lên Cao Bằng có khó không?", answer: "Đường quốc lộ đã được nâng cấp rất đẹp, đi xe khách giường nằm mất khoảng 6-7 tiếng. Nếu tự lái xe, bạn cần chú ý đèo dốc." },
            { id: "faq-3", question: "Tôi nên thuê xe máy hay ô tô?", answer: "Nếu thích trải nghiệm, bạn nên thuê xe máy để tận hưởng cảnh quan. Nếu đi gia đình, ô tô kèm tài xế bản địa là lựa chọn an toàn." },
            { id: "faq-4", question: "Cao Bằng có đặc sản gì?", answer: "Phở chua, vịt quay 7 vị, hạt dẻ Trùng Khánh, lạp xưởng hun khói, bánh cuốn nước xương." }
          ]}
        />

        <ContactForm />

        {/* ==================== SOS / KHẨN CẤP ==================== */}
        <section id="sos" className="py-10 bg-slate-900 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(15,23,42,.92),rgba(15,23,42,.92)),url('${sosBg}')` }}>
          <div className="container px-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-triangle-exclamation text-white text-lg" />
              </div>
              <div>
                <h2 className="text-white font-black text-base m-0 font-geist">Hotline Khẩn Cấp tại Cao Bằng</h2>
                <p className="text-white/60 text-xs mt-1">Lưu lại các số điện thoại này trước khi lên đường</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: "fa-shield-halved",    label: "Công An Cao Bằng",   num: "069.259.3068",  color: "#3B82F6" },
                { icon: "fa-truck-medical",    label: "Cấp Cứu 115",         num: "115",           color: "#EF4444" },
                { icon: "fa-fire-extinguisher",label: "Phòng Cháy 114",      num: "114",           color: "#F97316" },
                { icon: "fa-hospital",         label: "BV Đa Khoa Cao Bằng", num: "0206.3852.021", color: "#10B981" },
                { icon: "fa-person-hiking",    label: "Ban Quản Lý Du Lịch", num: "0206.3853.726", color: "#8B5CF6" },
                { icon: "fa-headset",          label: "Hỗ Trợ Tour 24/7",    num: "1800.CAOBANG",  color: "#265C59" },
              ].map((c) => (
                <a key={c.label} href={`tel:${c.num.replace(/\./g, "")}`}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.color + "22" }}>
                    <i className={`fa-solid ${c.icon}`} style={{ color: c.color, fontSize: 15 }} />
                  </div>
                  <div>
                    <p className="text-white/60 text-[11px] uppercase tracking-wider mb-0.5 font-bold">{c.label}</p>
                    <p className="text-white font-black text-sm font-mono">{c.num}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer userSession={userSession} scrollToSection={scrollToSection} />

      <MusicPlayer src={musicSrc} />
    </>
  );
}
