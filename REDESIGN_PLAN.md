# 🗺 Kế Hoạch Redesign — caobang-travel-connect

> **Mục tiêu:** Thiết kế lại toàn bộ giao diện sang phong cách hiện đại, tối giản, đậm chất du lịch trải nghiệm.  
> **Nguyên tắc:** Không phá vỡ logic/data hiện có — chỉ thay đổi UI layer.  
> **Thứ tự:** Làm tuần tự theo phase. Mỗi phase là 1 lần chat độc lập.

---

## PHASE 1 — Design Tokens & Foundation
**Mục tiêu:** Tạo "nguồn sự thật" duy nhất cho màu sắc, font, spacing. Tất cả phase sau đều dựa vào đây.  
**Files output:** `tailwind.config.ts`, `app/globals.css`

---

### PROMPT 1.1 — tailwind.config.ts

```
Tôi đang refactor project Next.js 14 "caobang-travel-connect" (du lịch Cao Bằng, eco-tourism).

Hiện tại màu #265C59 bị hardcode ở 20+ chỗ. Tôi cần tạo một tailwind.config.ts chuẩn hóa toàn bộ design tokens.

Yêu cầu:
- Font family: "Be Vietnam Pro" (đã import qua next/font, variable: --font-be), "Lora" (variable: --font-lora), "Caveat" (variable: --font-caveat)
- Màu brand:
  * forest: { 950: #0d1f17, 900: #1A3D2B, 700: #265C59, 500: #2D6A4F, 300: #52B788, 100: #B7E4C7 }
  * teal: { 900: #0B3D38, 700: #265C59, 500: #0D9488, 300: #5EEAD4, 100: #CCFBF1 }
  * earth: { 700: #A0522D, 500: #C97C3A, 300: #F4A261, 100: #FEF3C7 }
  * stone: { 900: #111827, 700: #374151, 500: #6B7280, 300: #D1D5DB, 100: #F9FAFB }
  * beige: { DEFAULT: #FAFAF8, warm: #F4EFE6, mid: #EDE8DF, border: #E5E1D8 }
- borderRadius: xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, card: 16px, pill: 9999px
- boxShadow: card: "0 2px 12px rgba(26,61,43,0.08)", hover: "0 8px 28px rgba(26,61,43,0.14)", modal: "0 24px 64px rgba(0,0,0,0.18)"
- Extend spacing với key: section: 96px, container: 1280px

Trả về file tailwind.config.ts đầy đủ, sử dụng withTV hoặc standard extend config. Chỉ output code, không giải thích.
```

---

### PROMPT 1.2 — globals.css

```
Refactor app/globals.css cho project caobang-travel-connect (Next.js 14 + Tailwind CSS).

Context hiện tại:
- Dùng font Be Vietnam Pro (--font-be), Lora (--font-lora), Caveat (--font-caveat)
- Có custom classes: .fade-up, .hero, .hero-bg, .hero-overlay, .hero-mist, .hero-content, .hero-badge, .hero-stats, .hero-stat, .nav-logo, .nav-links, .btn-cta, .btn-price, .btn-hero-primary, .btn-hero-outline, .hamburger, .mobile-nav, .form-group, .admin-layout, .admin-sidebar, .admin-sidebar-nav, .admin-nav-link, .admin-topbar, .admin-content, .admin-btn, .admin-btn-danger
- CSS vars hiện tại: --teal-dark: #265C59

Yêu cầu globals.css mới:
1. CSS variables đầy đủ:
   --color-forest-900, --color-forest-700, --color-forest-500, --color-forest-300
   --color-teal-700, --color-teal-500, --color-teal-300
   --color-earth-500, --color-earth-300
   --color-beige, --color-beige-warm, --color-beige-border
   --color-text-heading: #111827
   --color-text-body: #374151
   --color-text-muted: #6B7280
   --radius-card: 16px
   --shadow-card: 0 2px 12px rgba(26,61,43,0.08)
   --shadow-hover: 0 8px 28px rgba(26,61,43,0.14)

2. Base resets: box-sizing, smooth scroll, antialiased text

3. Giữ lại tất cả custom classes hiện có nhưng refactor dùng CSS variables thay cho hardcode hex

4. Thêm mới:
   .btn-primary { @apply ... } — teal fill, pill, hover lift
   .btn-outline { @apply ... } — teal border, pill
   .btn-ghost { @apply ... } — transparent, teal text
   .card { @apply ... } — white bg, --radius-card, --shadow-card
   .section-label { ... } — uppercase tag nhỏ màu teal
   .fade-up { opacity: 0; transform: translateY(20px); transition: 0.5s ease; }
   .fade-up.visible { opacity: 1; transform: none; }

5. Admin layout CSS: sidebar fixed 240px, main margin-left 240px, responsive collapse < 768px

Trả về toàn bộ file globals.css. Chỉ output code.
```

---

## PHASE 2 — Tách page.tsx (1848 dòng → Components)
**Mục tiêu:** Refactor file monolith thành kiến trúc component rõ ràng.  
**Files output:** `app/components/sections/` (8 files mới)

---

### PROMPT 2.1 — Tạo cấu trúc component

```
File app/page.tsx của tôi đang có 1848 dòng, là 1 "use client" component duy nhất chứa toàn bộ landing page. Tôi cần tách ra thành các section components.

State và data hiện tại cần giữ nguyên:
- guides, destinations, reviews, galleryImages, tours, camNangTips (từ Supabase)
- Site settings: heroBg, heroVideo, aboutImage, destBg, pricingBg, whyusBg, teamBg, toursBg, galleryBg, testimonialsBg, sosBg, camNangBg, musicSrc
- Auth: userSession, userProfile, unreadReplies
- Booking modal state: isBookingOpen, bookingPackage, bookingName, bookingPhone, bookingEmail, bookingDate, bookingNote, bookingLoading, bookingSuccess, bookingError, bookingGuideId, guideBookingCount, guideBusyDates, bookingPointsInfo
- Contact form state: contactName, contactEmail, contactPhone, contactMessage, contactLoading, contactSuccess, contactError, contactId
- Review state: reviewOpen, reviewStars, reviewText, reviewName, reviewLocation, reviewLoading, reviewSuccess, reviewError
- UI state: isMobileMenuOpen, isScrolled, activeSection, currentPage, cardsPerPage
- Filter: guideSearch, guideFilterLang, guideFilterRating, showAllGuides
- Other: weather, selectedDest

Kiến trúc mong muốn:
app/
  components/
    sections/
      HeroSection.tsx        — hero + weather widget
      WhyUsSection.tsx       — about/giới thiệu
      GuidesSection.tsx      — team HDV + filter
      ToursSection.tsx       — danh sách tour
      DestinationsSection.tsx — điểm đến + modal
      GallerySection.tsx     — thư viện ảnh
      CamNangSection.tsx     — cẩm nang tips
      PricingSection.tsx     — bảng giá
      TestimonialsSection.tsx — reviews + form
      ContactSection.tsx     — footer contact
    modals/
      BookingModal.tsx       — booking modal
      ReviewModal.tsx        — review modal
  page.tsx                   — chỉ còn ~100 dòng: data fetching + render sections

Chỉ tạo file page.tsx mới (shell) và BookingModal.tsx trước. Tôi sẽ làm từng section riêng.

page.tsx mới nên:
- Giữ toàn bộ useEffect, data fetching, state
- Truyền props xuống các section
- Không có JSX section nào inline — chỉ <HeroSection ... />

Trả về: app/page.tsx mới và app/components/modals/BookingModal.tsx. Chỉ output code.
```

---

### PROMPT 2.2 — HeroSection

```
Tạo file app/components/sections/HeroSection.tsx cho project caobang-travel-connect.

Props nhận vào:
- heroBg: string
- heroVideo: string
- weather: { temp: number; code: number; wind: number } | null
- isScrolled: boolean
- isMobileMenuOpen: boolean
- setIsMobileMenuOpen: (v: boolean) => void
- activeSection: string
- scrollToSection: (e, id: string) => void
- userSession: Session | null
- userProfile: UserProfile | null
- unreadReplies: number
- heroMistRef: RefObject<HTMLDivElement>
- onBookingOpen: () => void

Yêu cầu thiết kế MỚI (theo design system đã có trong tailwind.config.ts và globals.css):
1. Header:
   - Logo text "Cao Bằng Travel Connect" với brand color
   - Nav links dùng class .nav-link chuẩn
   - CTA button dùng .btn-primary
   - Khi scroll: background trắng với shadow; khi ở top: transparent
   - Mobile: hamburger → slide-down menu

2. Hero section:
   - Full-bleed image/video background
   - Overlay gradient: from forest-900/70 to transparent
   - Glass card chứa headline: backdrop-blur, border white/20
   - Headline: font Lora (serif), "Khám Phá Cao Bằng" — lớn, bold
   - Tagline: "Cùng Hướng Dẫn Viên Bản Địa" — italic, muted
   - 2 buttons: .btn-primary và .btn-outline
   - Stats bar ở bottom: số liệu 50+ HDV, 2000+ du khách, v.v.
   - Weather widget: góc trên phải, glass effect

3. Mist parallax giữ nguyên (heroMistRef)

4. Dùng Tailwind classes HOÀN TOÀN. Không có inline styles ngoại trừ dynamic values (backgroundImage URL).

Trả về file tsx đầy đủ, functional, TypeScript strict. Chỉ output code.
```

---

### PROMPT 2.3 — GuidesSection

```
Tạo app/components/sections/GuidesSection.tsx cho caobang-travel-connect.

Props:
- guides: Guide[]
- guideSearch: string, setGuideSearch
- guideFilterLang: string, setGuideFilterLang
- guideFilterRating: string, setGuideFilterRating
- showAllGuides: boolean, setShowAllGuides
- onBookGuide: (guideId: string, guideName: string) => void

Yêu cầu thiết kế:
1. Section header: .section-label tag "ĐỘI NGŨ HDV", heading serif "Hướng Dẫn Viên Địa Phương", subtext
2. Filter bar: search input + 2 select (ngôn ngữ, rating) — dạng chip/pill, không phải native select xấu
3. Guide cards layout: grid 4 cols (xl) → 3 (lg) → 2 (md) → 1 (sm)
4. Guide card thiết kế MỚI:
   - Ảnh vuông, object-cover, hover: scale 1.05
   - Badge "Featured" nếu is_featured (góc trên trái)
   - Tên: font semibold, màu forest-900
   - Specialty: text-sm, text-muted, italic
   - Rating: stars màu amber + số
   - Languages: pills nhỏ màu teal-100/teal-700
   - 2 nút: "Xem Hồ Sơ" (outline) + "Đặt HDV" (primary)
5. "Xem thêm" button nếu hasMore
6. Empty state nếu filter không có kết quả

Dùng Tailwind hoàn toàn. Guide interface từ @/lib/database.types. Chỉ output code.
```

---

### PROMPT 2.4 — DestinationsSection

```
Tạo app/components/sections/DestinationsSection.tsx.

Props:
- destinations: Destination[]
- destsFromDB: boolean
- destBg: string
- selectedDest: Destination | null
- setSelectedDest: (d: Destination | null) => void

Yêu cầu:
1. Section với parallax background (destBg)
2. Destination cards: masonry-like grid hoặc 3-col grid
3. Card thiết kế:
   - Image full-width, height 220px, overlay gradient bottom
   - Title overlay trên image (góc dưới)
   - Body: description ngắn (120 ký tự), nút "Xem thêm" + "Đặt Tour"
   - Hover: lift + shadow
4. Click mở modal chi tiết (không navigate sang trang khác):
   - Backdrop blur
   - Image lớn bên trái, info bên phải
   - Nút "Đặt Tour ngay" + "Xem trang đầy đủ → /diem-den/[id]"
5. Animated số thứ tự (sort_order) hiển thị nhỏ

Chỉ output code.
```

---

## PHASE 3 — Redesign Standalone Pages

### PROMPT 3.1 — /diem-den page

```
Redesign toàn bộ app/diem-den/page.tsx.

File hiện tại đang dùng 100% inline styles. Tôi cần refactor sang Tailwind + design tokens.

Giữ nguyên: logic fetch Supabase, search filter, navigate sang /diem-den/[id], navigate sang /dat-lich

Thiết kế mới:
1. Page hero (300px):
   - Background image từ site_settings.destinations_bg
   - Gradient overlay
   - H1 "Điểm Đến Cao Bằng" — Lora font, white
   - Search bar nổi: pill shape, white background, icon tìm kiếm, width 400px centered
   - Back link góc trên trái: glass pill button

2. Content area (bg: beige):
   - Counter text: "X điểm đến" — muted, small
   - Grid 3-col → 2-col → 1-col
   - Card component mới:
     * Image 200px height, hover scale
     * Gradient overlay nhẹ bottom
     * Title: UPPERCASE, forest-700, font-semibold
     * Description: 2 dòng, clamp
     * Footer: 2 buttons — "Đọc Thêm" (outline-sm) + "Đặt Tour" (primary-sm)
   - Loading skeleton (3 card placeholders animation)
   - Empty state: illustration text + reset search button

3. Dùng Tailwind hoàn toàn. Import design tokens từ globals. Chỉ output code.
```

---

### PROMPT 3.2 — /hdv page

```
Redesign app/hdv/page.tsx (xem code hiện tại của file này trước).

Yêu cầu thiết kế:
1. Hero header giống /diem-den nhưng với ảnh HDV và text "Hướng Dẫn Viên Chuyên Nghiệp"
2. Filter section sticky dưới hero:
   - Search by name/specialty
   - Filter by language (dropdown elegant, không native)
   - Filter by rating (radio pills: 4+, 4.5+, 5★)
   - Sort: Đánh giá cao nhất / Kinh nghiệm nhiều nhất / Mới nhất
3. Guide grid 4→3→2→1 col
4. Guide card thiết kế:
   - Avatar tròn 80px, border-2 teal
   - Verified badge nếu is_featured
   - Name, specialty
   - Rating + review count
   - Languages (pills)
   - Experience badge: "X năm"
   - Bio preview (60 ký tự)
   - 2 CTA buttons
5. Pagination hoặc infinite scroll (load more button)

Chỉ output code.
```

---

### PROMPT 3.3 — /dat-lich (Booking Page)

```
Redesign app/dat-lich/page.tsx thành trang booking full với multi-step flow.

Đọc file hiện tại trước để biết state/logic đang có.

Thiết kế: stepper 3 bước
Step 1 — Chọn Tour/HDV:
  - Grid chọn package_type (tour cards)
  - Optional: chọn HDV (searchable list với avatar)
  - Chọn ngày: calendar input với busy dates highlight đỏ

Step 2 — Thông tin cá nhân:
  - Form: họ tên, SĐT, email, ghi chú
  - Loyalty banner: hiện discount nếu có (tier + guide loyalty)
  - Price summary sidebar (sticky on desktop)

Step 3 — Xác nhận:
  - Review lại tất cả thông tin
  - Submit button
  - Success state: confetti-like animation, booking code, hướng dẫn tiếp theo

Progress indicator: stepper component ở top với 3 bước có icon.
Layout: 2-col (form trái, summary phải) trên desktop; 1-col trên mobile.
Giữ toàn bộ logic handleBookingSubmit, guide_schedules check, loyalty calculation.

Chỉ output code.
```

---

### PROMPT 3.4 — /tai-khoan (Dashboard)

```
Redesign app/tai-khoan/page.tsx thành dashboard người dùng hiện đại.

Fetch data từ Supabase: user_profiles, bookings của user, contacts có admin_reply.

Layout: Sidebar profile bên trái (240px) + content bên phải
Tabs: Tổng Quan | Lịch Sử Đặt Tour | Tin Nhắn | Cài Đặt

Tab Tổng Quan:
  - Profile card: avatar (initials nếu không có ảnh), tên, tier badge
  - Points progress bar: hiện tier hiện tại, điểm đến tier tiếp theo
  - Stats: số booking completed, số review, điểm tích lũy
  - Booking sắp tới (next booking card)

Tab Lịch Sử:
  - Table/list bookings với status badge màu (pending/confirmed/cancelled)
  - Filter by status

Tab Tin Nhắn:
  - Danh sách contacts có admin_reply
  - Hiển thị conversation dạng bubble chat

Tab Cài Đặt:
  - Form cập nhật: full_name, phone
  - Đổi mật khẩu
  - Nút đăng xuất

Tier system: bronze(#CD7F32) / silver(#94A3B8) / gold(#E5A919) / diamond(#60D8FA)
Dùng Tailwind hoàn toàn. Chỉ output code.
```

---

## PHASE 4 — Admin Panel Redesign

### PROMPT 4.1 — Admin Layout

```
Redesign app/admin/layout.tsx — Admin sidebar + topbar.

Giữ nguyên: auth check, logout, NAV array hiện tại.

Thiết kế mới:
1. Sidebar (240px fixed, dark theme):
   - Background: #0F1A14 (forest-950)
   - Logo area: icon + "CaoBang Admin"
   - Nav links: icon + label, active state với left border teal + teal text
   - Hover: bg-white/5
   - Footer: user email nhỏ + logout button

2. Topbar (64px, white):
   - Breadcrumb: "Admin / [Current Page]"
   - Right: "Xem Website" link + user avatar circle

3. Content area: bg-beige, padding 32px

4. Mobile (<768px): sidebar slide-in với overlay, hamburger button ở topbar

5. Smooth transitions cho sidebar collapse

CSS class names: giữ .admin-layout, .admin-sidebar, .admin-nav-link, .admin-topbar, .admin-content để không break các trang con.

Chỉ output code.
```

---

### PROMPT 4.2 — Admin Dashboard (trang /admin)

```
Redesign app/admin/page.tsx — Admin dashboard tổng quan.

Giữ nguyên: fetch từ Supabase (bookings, guides, contacts, reviews).

Thiết kế mới:
1. Stats row (4 cards):
   - Đặt lịch hôm nay / tuần này
   - Đặt lịch đang pending
   - Liên hệ chưa đọc
   - Đánh giá chờ duyệt
   - Mỗi card: icon teal, số lớn, trend arrow

2. Recent Bookings table:
   - Cột: Khách hàng, Package, Ngày, HDV, Trạng thái
   - Status badge màu
   - Quick actions: Confirm / Cancel

3. Recent Contacts list:
   - Name, email, preview message, thời gian, nút Reply

4. Quick Stats charts (optional, dùng CSS bars không cần thư viện):
   - Booking by status (horizontal bars)

Layout: 12-col grid, responsive.
Giữ admin-content class wrapper. Chỉ output code.
```

---

## PHASE 5 — Polish & SEO

### PROMPT 5.1 — MobileBottomNav

```
Redesign app/components/layout/MobileBottomNav.tsx.

Chỉ hiện trên mobile (< 768px), ẩn trên desktop.
Fixed bottom, safe-area-inset-bottom.

5 tabs: Trang Chủ, Điểm Đến, Tour, HDV, Tài Khoản
Icons: Font Awesome (fa-house, fa-map-location-dot, fa-compass, fa-person-hiking, fa-user)

Thiết kế:
- Background: white, border-top: 1px solid beige-border
- Active tab: teal icon + teal label + pill indicator ở trên
- Inactive: gray-400
- Tap animation: scale 0.9 → 1
- Badge đỏ trên Tài Khoản nếu có unread (prop: unreadCount)

Chỉ output code.
```

---

### PROMPT 5.2 — SEO & Metadata

```
Cập nhật SEO metadata cho caobang-travel-connect. Áp dụng cho các file sau:
- app/layout.tsx (root)
- app/diem-den/page.tsx
- app/hdv/page.tsx
- app/tour/page.tsx
- app/cam-nang/page.tsx

Yêu cầu cho mỗi page:
1. export const metadata: Metadata với:
   - title (template: "Tên Trang | Cao Bằng Travel Connect")
   - description (160 ký tự, có keywords tự nhiên)
   - keywords array
   - openGraph: title, description, image (dùng ảnh Thác Bản Giốc), type
   - twitter: card, title, description
   - alternates: canonical URL

2. Semantic HTML:
   - <main>, <article>, <section> đúng chỗ
   - <h1> duy nhất trên mỗi trang
   - alt text đầy đủ cho tất cả img

3. Structured data (JSON-LD) cho /hdv/[id]:
   - Person schema cho từng HDV
   - AggregateRating nếu có reviews

Trả về từng file một, đầy đủ. Chỉ output code.
```

---

## Thứ Tự Thực Hiện

```
Phase 1 → Phase 2 (PROMPT 2.1 trước) → Phase 2 (2.2 → 2.3 → 2.4) → Phase 3 → Phase 4 → Phase 5
```

Mỗi prompt nên chạy trong 1 conversation riêng (hoặc sau khi commit code từ prompt trước).  
Sau mỗi phase: chạy `npm run build` để kiểm tra TypeScript errors trước khi tiếp tục.

---

## Lưu Ý Quan Trọng

- **Không đổi** tên biến Supabase, tên bảng, API routes
- **Giữ nguyên** logic loyalty (getTier, GUIDE_LOYALTY_THRESHOLD)
- **Giữ nguyên** Zalo integration (zalo_number field)
- **Giữ nguyên** MusicPlayer component (chỉ reskin nếu cần)
- Font **Be Vietnam Pro** đang rất tốt cho tiếng Việt — giữ nguyên
- Sau Phase 1, tất cả màu sắc phải dùng Tailwind class (ví dụ `bg-forest-900`) hoặc CSS var — **cấm hardcode hex**
