export type Lang = "vi" | "en";

const T = {
  vi: {
    // Nav
    nav_home:         "Trang Chủ",
    nav_about:        "Giới Thiệu",
    nav_hdv:          "HDV & Tour",
    nav_destinations: "Điểm Đến",
    nav_gallery:      "Hình Ảnh",
    nav_guide:        "Cẩm Nang",
    nav_contact:      "Liên Hệ",
    nav_book:         "ĐẶT HDV NGAY",
    nav_login:        "Đăng Nhập",
    nav_account:      "Tài Khoản",

    // Hero
    hero_badge:   "Hướng Dẫn Viên Địa Phương · Cao Bằng, Việt Nam",
    hero_h1_1:    "Khám Phá",
    hero_h1_2:    "Cao Bằng",
    hero_tagline: "Cùng Hướng Dẫn Viên Địa Phương",
    hero_sub:     "Chuyên Nghiệp · Am Hiểu · Tận Tâm · Hành trình trọn vẹn",
    hero_btn1:    "XEM CÁC HDV & TOUR",
    hero_btn2:    "KHÁM PHÁ ĐIỂM ĐẾN",
    stat_guides:  "Hướng Dẫn Viên",
    stat_guests:  "Du Khách Hài Lòng",
    stat_spots:   "Điểm Tham Quan",
    stat_rating:  "Đánh Giá TB",

    // Why us
    why_tag:      "Vì Sao Chọn Chúng Tôi",
    why_title:    "Tại Sao Chọn Chúng Tôi?",
    why_sub:      "Chúng tôi cung cấp những trải nghiệm du lịch sinh thái độc đáo và chân thực nhất tại Cao Bằng",
    why_f1_title: "Kiến Thức Bản Địa Điểm",
    why_f1_desc:  "Hướng dẫn viên sinh ra và lớn lên tại Cao Bằng, am hiểu sâu về văn hóa, lịch sử và địa hình từng điểm đến bản địa.",
    why_f2_title: "Lộ Trình Thiết Kế Riêng",
    why_f2_desc:  "Mỗi chuyến đi được cá nhân hóa theo sở thích và nhu cầu của từng đoàn khách, đảm bảo trải nghiệm tốt nhất.",
    why_f3_title: "Hỗ Trợ 24/7",
    why_f3_desc:  "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc và đảm bảo an toàn cho du khách trên toàn bộ hành trình.",

    // Team
    team_tag:   "Đội Ngũ Chuyên Nghiệp",
    team_title: "Đội Ngũ Hướng Dẫn Viên Biểu Tượng",
    team_sub:   "Những hướng dẫn viên giàu kinh nghiệm, tận tâm và am hiểu sâu về vùng đất Cao Bằng",
    team_view:  "Xem hồ sơ",
    team_all:   "Xem tất cả HDV",
    team_book:  "Đặt lịch",

    // Destinations
    dest_tag:   "Khám Phá Ngay",
    dest_title: "Điểm Đến Không Thể Bỏ Lỡ",
    dest_sub:   "Những địa danh hùng vĩ và đặc sắc nhất tại vùng đất Cao Bằng đang chờ bạn khám phá",
    dest_book:  "Đặt Tour Tham Quan",
    dest_close: "Đóng",
    dest_all:   "Xem Tất Cả Điểm Đến",

    // Tours
    tours_tag:   "Khám Phá Ngay",
    tours_title: "Các Gói Tour Nổi Bật",
    tours_sub:   "Lựa chọn hành trình phù hợp — từ tour 1 ngày đến khám phá dài ngày trọn vẹn",
    tours_all:   "Xem Tất Cả Gói Tour",
    tours_detail:"Xem chi tiết",

    // Gallery
    gallery_tag:   "Góc Nhìn Chân Thực",
    gallery_title: "Thư Viện Hình Ảnh",
    gallery_sub:   "Những khoảnh khắc tuyệt đẹp được ghi lại trong các chuyến đi của chúng tôi",

    // Cam nang
    cn_tag:   "Cẩm Nang Du Lịch",
    cn_title: "Bí Quyết Khám Phá Cao Bằng",
    cn_sub:   "Những điều bạn cần biết để có chuyến đi trọn vẹn và an toàn",
    cn_all:   "Xem Tất Cả Cẩm Nang",
    cn_read:  "Đọc thêm",

    // Pricing
    pricing_tag:   "Bảng Giá Minh Bạch",
    pricing_title: "Bảng Giá Dịch Vụ HDV",
    pricing_sub:   "Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn",

    // Reviews
    reviews_tag:   "Từ Du Khách",
    reviews_title: "Khách Hàng Nói Gì?",
    reviews_sub:   "Những đánh giá chân thực từ hàng nghìn du khách đã trải nghiệm dịch vụ của chúng tôi",

    // Footer
    footer_signup:  "Liên Hệ Chúng Tôi",
    footer_name:    "Họ và tên",
    footer_email:   "Địa chỉ Email",
    footer_phone:   "Số điện thoại",
    footer_message: "Nội dung tin nhắn...",
    footer_send:    "Gửi Tin Nhắn",
    footer_sent:    "Gửi thành công!",
    footer_follow:  "THEO DÕI CHÚNG TÔI",
    footer_book:    "Đặt Lịch Ngay",
    footer_tour:    "TOUR",
    footer_explore: "KHÁM PHÁ",
    footer_contact: "LIÊN HỆ",
    footer_hotline: "HOTLINE",
    footer_copy:    "© 2025 Cao Bằng Travel Connect. Bảo lưu mọi quyền.",
    footer_cookies: "Chính sách Cookies",
    footer_privacy: "Quyền Riêng Tư",
    footer_terms:   "Điều Khoản Sử Dụng",

    // Trust badges
    trust_1: "Xác nhận trong 24 giờ",
    trust_2: "Đặt cọc linh hoạt",
    trust_3: "Hủy miễn phí trước 24h",
    trust_4: "Hỗ trợ 24/7 qua Zalo",
  },

  en: {
    // Nav
    nav_home:         "Home",
    nav_about:        "About",
    nav_hdv:          "Guides & Tours",
    nav_destinations: "Destinations",
    nav_gallery:      "Gallery",
    nav_guide:        "Travel Guide",
    nav_contact:      "Contact",
    nav_book:         "BOOK A GUIDE",
    nav_login:        "Sign In",
    nav_account:      "My Account",

    // Hero
    hero_badge:   "Local Tour Guides · Cao Bang, Vietnam",
    hero_h1_1:    "Discover",
    hero_h1_2:    "Cao Bang",
    hero_tagline: "With Local Tour Guides",
    hero_sub:     "Professional · Knowledgeable · Dedicated · Unforgettable Journeys",
    hero_btn1:    "VIEW GUIDES & TOURS",
    hero_btn2:    "EXPLORE DESTINATIONS",
    stat_guides:  "Local Guides",
    stat_guests:  "Happy Travelers",
    stat_spots:   "Attractions",
    stat_rating:  "Avg Rating",

    // Why us
    why_tag:      "Why Choose Us",
    why_title:    "Why Choose Us?",
    why_sub:      "We offer the most authentic and unique eco-tourism experiences in Cao Bang",
    why_f1_title: "Local Insider Knowledge",
    why_f1_desc:  "Our guides were born and raised in Cao Bang, with deep knowledge of local culture, history and terrain.",
    why_f2_title: "Custom Itineraries",
    why_f2_desc:  "Every trip is personalized to your preferences and needs, ensuring the best possible experience.",
    why_f3_title: "24/7 Support",
    why_f3_desc:  "Our support team is always ready to answer questions and ensure your safety throughout the journey.",

    // Team
    team_tag:   "Professional Team",
    team_title: "Our Iconic Tour Guides",
    team_sub:   "Experienced, dedicated guides with deep knowledge of Cao Bang",
    team_view:  "View profile",
    team_all:   "View all guides",
    team_book:  "Book now",

    // Destinations
    dest_tag:   "Explore Now",
    dest_title: "Must-See Destinations",
    dest_sub:   "The most spectacular and unique landmarks in Cao Bang await your discovery",
    dest_book:  "Book Sightseeing Tour",
    dest_close: "Close",
    dest_all:   "View All Destinations",

    // Tours
    tours_tag:   "Explore Now",
    tours_title: "Featured Tour Packages",
    tours_sub:   "Choose your journey — from 1-day tours to multi-day full explorations",
    tours_all:   "View All Tours",
    tours_detail:"View details",

    // Gallery
    gallery_tag:   "Authentic Perspectives",
    gallery_title: "Photo Gallery",
    gallery_sub:   "Beautiful moments captured on our tours and expeditions",

    // Cam nang
    cn_tag:   "Travel Guide",
    cn_title: "Tips for Exploring Cao Bang",
    cn_sub:   "Everything you need to know for a complete and safe journey",
    cn_all:   "View All Travel Tips",
    cn_read:  "Read more",

    // Pricing
    pricing_tag:   "Transparent Pricing",
    pricing_title: "Guide Service Pricing",
    pricing_sub:   "Choose the service package that fits your needs and budget",

    // Reviews
    reviews_tag:   "From Travelers",
    reviews_title: "What Our Guests Say",
    reviews_sub:   "Authentic reviews from thousands of travelers who have experienced our services",

    // Footer
    footer_signup:  "Contact Us",
    footer_name:    "Full name",
    footer_email:   "Email address",
    footer_phone:   "Phone number",
    footer_message: "Your message...",
    footer_send:    "Send Message",
    footer_sent:    "Sent successfully!",
    footer_follow:  "FOLLOW US",
    footer_book:    "Book Now",
    footer_tour:    "TOURS",
    footer_explore: "EXPLORE",
    footer_contact: "CONTACT",
    footer_hotline: "HOTLINE",
    footer_copy:    "© 2025 Cao Bang Travel Connect. All rights reserved.",
    footer_cookies: "Cookie Policy",
    footer_privacy: "Privacy Policy",
    footer_terms:   "Terms of Service",

    // Trust badges
    trust_1: "Confirmed within 24 hours",
    trust_2: "Flexible deposit",
    trust_3: "Free cancellation before 24h",
    trust_4: "24/7 support via Zalo",
  },
} as const;

export type TKey = keyof typeof T.vi;
export function t(key: TKey, lang: Lang): string { return T[lang][key] as string; }
export default T;
