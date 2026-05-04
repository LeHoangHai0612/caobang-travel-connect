"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import MusicPlayer from "@/app/components/MusicPlayer";
import type { Guide, Destination, Review, GalleryImage, UserProfile } from "@/lib/database.types";
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
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(FALLBACK_GALLERY);

  // Site settings
  const [heroBg, setHeroBg]       = useState("");
  const [destBg, setDestBg]       = useState("https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75");
  const [pricingBg, setPricingBg] = useState("https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75");
  const [musicSrc, setMusicSrc]   = useState("");

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

  const totalPages = Math.ceil(reviews.length / cardsPerPage);

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

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Tải dữ liệu từ Supabase
    async function loadData() {
      const [{ data: g }, { data: d }, { data: r }, { data: gal }, { data: settings }] = await Promise.all([
        supabase.from("guides").select("*").eq("is_active", true).order("rating", { ascending: false }).limit(8),
        supabase.from("destinations").select("*").order("sort_order").limit(6),
        supabase.from("reviews").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(6),
        supabase.from("gallery_images").select("*").order("sort_order").limit(12),
        supabase.from("site_settings").select("key,value"),
      ]);
      if (g && g.length > 0) setGuides(g);
      if (d && d.length > 0) setDestinations(d);
      if (r && r.length > 0) setReviews(r);
      if (gal && gal.length > 0) setGalleryImages(gal);
      if (settings) {
        const find = (k: string) => settings.find((s: { key: string; value: string }) => s.key === k)?.value;
        if (find("hero_bg"))         setHeroBg(find("hero_bg")!);
        if (find("destinations_bg")) setDestBg(find("destinations_bg")!);
        if (find("pricing_bg"))      setPricingBg(find("pricing_bg")!);
        if (find("background_music")) setMusicSrc(find("background_music")!);
      }
    }
    loadData();

    // Shadow header khi cuộn
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

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
    setBookingPackage(pkg);
    setBookingSuccess(false);
    setBookingError("");
    setBookingGuideId("");
    setBookingPointsInfo(null);
    setBookingName(userProfile?.full_name || "");
    setBookingPhone(userProfile?.phone || "");
    setBookingEmail(userSession?.user.email || "");
    setBookingDate("");
    setBookingNote("");
    setIsBookingOpen(true);
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
        body: JSON.stringify({ name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage }),
      });
      if (res.ok) {
        setContactSuccess(true);
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
  };

  const today = new Date().toISOString().split("T")[0];

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
                    <select
                      id="b-guide"
                      value={bookingGuideId}
                      onChange={(e) => setBookingGuideId(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: ".88rem", background: "white" }}
                    >
                      <option value="">-- Chưa chọn --</option>
                      {guides.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} · {g.specialty}</option>
                      ))}
                    </select>
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
              <img src="/logo.png" alt="Cao Bằng Travel Connect" style={{ height: 38, width: 38, objectFit: "contain", mixBlendMode: "multiply" }} />
              <div className="nav-logo-text">
                <strong>Cao Bằng</strong>
                <span>Travel Connect</span>
              </div>
            </a>

            <ul className="nav-links" role="list">
              {[
                { id: "hero",         label: "Trang Chủ" },
                { id: "why-us",       label: "Giới Thiệu" },
                { id: "team",         label: "Dịch Vụ HDV" },
                { id: "destinations", label: "Điểm Đến" },
                { id: "gallery",      label: "Cẩm Nang" },
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
              <a href="/tai-khoan" className="nav-user-btn">
                <i className={`fa-solid ${userProfile ? getTier(userProfile.points).icon : "fa-award"}`}
                   style={{ color: userProfile ? getTier(userProfile.points).color : "#cd7f32" }} />
                <span>Tài Khoản</span>
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
            { id: "hero", label: "Trang Chủ" },
            { id: "why-us", label: "Giới Thiệu" },
            { id: "team", label: "Dịch Vụ HDV" },
            { id: "destinations", label: "Điểm Đến" },
            { id: "gallery", label: "Thư Viện Ảnh" },
            { id: "pricing", label: "Bảng Giá" },
            { id: "footer", label: "Liên Hệ" },
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
          <div
            className="hero-bg"
            role="img"
            aria-label="Thác Bản Giốc Cao Bằng"
            style={heroBg ? { backgroundImage: `url('${heroBg}')` } : undefined}
          />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fa-solid fa-leaf" /> Hướng Dẫn Viên Địa Phương · Cao Bằng, Việt Nam
            </div>
            <h1>Khám Phá Cao Bằng<br />Cùng Hướng Dẫn Viên Địa Phương</h1>
            <p className="hero-tagline">Chuyên Nghiệp · Am Hiểu · Tận Tâm</p>
            <p className="hero-sub">Hành trình trọn vẹn, trải nghiệm chân thực</p>
            <div className="hero-actions">
              <a href="#team" className="btn-hero-primary" onClick={(e) => scrollToSection(e, "team")}>
                <i className="fa-solid fa-compass" aria-hidden="true" /> XEM CÁC HDV &amp; TOUR
              </a>
              <a href="#destinations" className="btn-hero-outline" onClick={(e) => scrollToSection(e, "destinations")}>
                <i className="fa-solid fa-map-location-dot" aria-hidden="true" /> KHÁM PHÁ ĐIỂM ĐẾN
              </a>
              <div className="hero-stats" aria-label="Thống kê dịch vụ">
                <div className="hero-stat"><strong>50+</strong><span>Hướng Dẫn Viên</span></div>
                <div className="hero-stat"><strong>2000+</strong><span>Du Khách Hài Lòng</span></div>
                <div className="hero-stat"><strong>30+</strong><span>Điểm Tham Quan</span></div>
                <div className="hero-stat"><strong>5★</strong><span>Đánh Giá TB</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== WHY CHOOSE US ==================== */}
        <section className="why-us" id="why-us" aria-labelledby="why-heading">
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
        <section className="team" id="team" aria-labelledby="team-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Đội Ngũ Chuyên Nghiệp</span>
              <h2 className="section-title" id="team-heading">Đội Ngũ Hướng Dẫn Viên Biểu Tượng</h2>
              <p className="section-subtitle">Những hướng dẫn viên giàu kinh nghiệm, tận tâm và am hiểu sâu về vùng đất Cao Bằng</p>
            </div>
            <div className="team-grid">
              {guides.map((member) => (
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
          </div>
        </section>

        {/* ==================== DESTINATIONS ==================== */}
        <section className="destinations" id="destinations" aria-labelledby="dest-heading"
          style={{ backgroundImage: `linear-gradient(to bottom,rgba(20,52,52,.55),rgba(20,52,52,.62)),url('${destBg}')` }}>
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
                <article key={dest.id} className="dest-card fade-up">
                  <div className="dest-card-img-wrap">
                    <img className="dest-card-img" src={dest.image_url} alt={dest.title} loading="lazy" />
                  </div>
                  <div className="dest-card-body">
                    <h3>{dest.title}</h3>
                    <p>{dest.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== GALLERY ==================== */}
        <section className="gallery" id="gallery" aria-labelledby="gallery-heading">
          <div className="container">
            <div className="section-header">
              <span className="section-tag" style={{ background: "rgba(229,169,25,.12)", color: "#c48d10" }}>Góc Nhìn Chân Thực</span>
              <h2 className="section-title" id="gallery-heading">Thư Viện Hình Ảnh</h2>
              <p className="section-subtitle">Những khoảnh khắc tuyệt đẹp được ghi lại trong các chuyến đi của chúng tôi</p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((img, i) => (
                <div key={img.id} className="gallery-item fade-up">
                  <img className="gallery-img" src={img.image_url} alt={`Ảnh du lịch Cao Bằng ${i + 1}`} loading="lazy" />
                  <div className="gallery-overlay">
                    <i className="fa-brands fa-instagram" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== PRICING ==================== */}
        <section className="pricing" id="pricing" aria-labelledby="pricing-heading"
          style={{ backgroundImage: `linear-gradient(135deg,rgba(10,35,35,.90),rgba(26,60,55,.86),rgba(15,45,40,.90)),url('${pricingBg}')` }}>
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
        <section className="testimonials" id="testimonials" aria-labelledby="testi-heading">
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
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer id="footer" aria-label="Chân trang">
        <div className="container">
          <div className="footer-grid">
            {/* Thông tin */}
            <div className="footer-col">
              <div className="footer-logo">
                <div className="footer-logo-icon" aria-hidden="true"><i className="fa-solid fa-mountain-sun" /></div>
                <div className="footer-logo-text">
                  <strong>Cao Bằng Eco Tour</strong>
                  <span>Hướng Dẫn Viên Địa Phương</span>
                </div>
              </div>
              <p className="footer-about">
                Kết nối du khách với những hướng dẫn viên địa phương am hiểu và tận tâm nhất tại Cao Bằng. Chúng tôi cam kết mang lại hành trình trọn vẹn và trải nghiệm chân thực nhất.
              </p>
              <address style={{ fontStyle: "normal" }}>
                <div className="footer-contact-item"><i className="fa-solid fa-phone" /><span>+84 365 128 823</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-envelope" /><span>info@caobangecotour.com</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-globe" /><span>www.caobangecotour.com</span></div>
                <div className="footer-contact-item"><i className="fa-solid fa-location-dot" /><span>Tp. Cao Bằng, tỉnh Cao Bằng, Việt Nam</span></div>
              </address>
            </div>

            {/* Form liên hệ */}
            <div className="footer-col">
              <h4>Liên Hệ</h4>
              <form onSubmit={handleContactSubmit}>
                <div className="footer-form-group">
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Họ và tên" autoComplete="name" required />
                </div>
                <div className="footer-form-group">
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Địa chỉ Email" autoComplete="email" required />
                </div>
                <div className="footer-form-group">
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Số điện thoại" autoComplete="tel" />
                </div>
                <div className="footer-form-group">
                  <input type="text" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Nội dung tin nhắn..." required />
                </div>
                {contactSuccess && (
                  <p style={{ color: "#a8e6d0", fontSize: ".82rem", marginBottom: 8 }}>
                    <i className="fa-solid fa-circle-check" /> Gửi thành công! Chúng tôi sẽ liên hệ sớm.
                  </p>
                )}
                {contactError && (
                  <p style={{ color: "#f87171", fontSize: ".82rem", marginBottom: 8 }}>{contactError}</p>
                )}
                <button type="submit" className="btn-footer-send" disabled={contactLoading}>
                  {contactLoading
                    ? "Đang gửi..."
                    : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> GỬI TIN NHẮN</>
                  }
                </button>
              </form>
            </div>

            {/* Bản đồ + điều hướng */}
            <div className="footer-col">
              <h4>Map</h4>
              <div className="footer-map" aria-label="Bản đồ vị trí Cao Bằng">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59886.6!2d106.257!3d22.666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x36cd16a1c9ef9d73%3A0x9c7f8b0ba2a3e4f0!2zVGjDoG5oIHBo4buRIENhbyBC4bqxbmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                  title="Bản đồ thành phố Cao Bằng"
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "14px" }}>Điều Hướng</h4>
                <nav aria-label="Điều hướng footer">
                  <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                    {[
                      { id: "hero",         label: "Trang Chủ" },
                      { id: "why-us",       label: "Giới Thiệu" },
                      { id: "team",         label: "Dịch Vụ HDV" },
                      { id: "destinations", label: "Điểm Đến" },
                      { id: "gallery",      label: "Thư Viện Ảnh" },
                      { id: "pricing",      label: "Bảng Giá" },
                    ].map(({ id, label }) => (
                      <li key={id}>
                        <a href={`#${id}`} className="footer-nav-link" onClick={(e) => scrollToSection(e, id)}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © 2024 Cao Bằng Eco Tour. Bảo lưu mọi quyền. | Thiết kế với{" "}
              <i className="fa-solid fa-heart" style={{ color: "#e87c7c", fontSize: ".7em" }} /> cho du lịch Cao Bằng
            </p>
            <nav className="footer-socials">
              {[
                { icon: "fa-brands fa-facebook-f",  href: "#" },
                { icon: "fa-brands fa-instagram",   href: "#" },
                { icon: "fa-brands fa-youtube",     href: "#" },
                { icon: "fa-brands fa-tiktok",      href: "#" },
                { icon: "fa-solid fa-comment-dots", href: "#" },
              ].map(({ icon, href }) => (
                <a key={icon} href={href} className="footer-social-link" aria-label={icon}>
                  <i className={icon} />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </footer>

      <MusicPlayer src={musicSrc} />
    </>
  );
}
