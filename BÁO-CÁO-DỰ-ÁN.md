# BÁO CÁO CHI TIẾT DỰ ÁN  
# CAO BẰNG TRAVEL CONNECT

**Ngày lập báo cáo:** 04/06/2026  
**Phiên bản dự án:** 0.1.0  
**Người phát triển:** Bố (hai2005b6@gmail.com)

---

## 1. TỔNG QUAN DỰ ÁN

Cao Bằng Travel Connect là một nền tảng du lịch trực tuyến được xây dựng cho tỉnh Cao Bằng, Việt Nam. Mục tiêu của dự án là kết nối du khách trong nước và quốc tế với các hướng dẫn viên (HDV) địa phương am hiểu văn hóa, địa lý và phong tục bản địa, đồng thời cung cấp thông tin toàn diện về các điểm đến, tour du lịch, cẩm nang lữ hành và dịch vụ đặt lịch trực tuyến.

Hệ thống bao gồm một trang web công khai dành cho du khách và một bảng quản trị nội bộ dành cho quản trị viên, tất cả được vận hành trên nền tảng công nghệ hiện đại, đảm bảo hiệu suất cao và trải nghiệm người dùng mượt mà trên cả thiết bị máy tính lẫn điện thoại di động.

---

## 2. CÔNG NGHỆ SỬ DỤNG

### Framework & Ngôn ngữ

Dự án sử dụng **Next.js 16.2.4** với kiến trúc App Router — phiên bản framework React được phát triển bởi Vercel, cung cấp Server-Side Rendering (SSR), Static Site Generation (SSG) và API Routes tích hợp trong một dự án duy nhất. Ngôn ngữ lập trình chính là **TypeScript 5** giúp kiểm soát kiểu dữ liệu chặt chẽ, giảm thiểu lỗi trong quá trình phát triển. React được dùng ở phiên bản mới nhất **19.2.4** với các tính năng React Server Components và concurrent rendering.

### Giao diện người dùng

Hệ thống styling dùng **Tailwind CSS v4** — thế hệ mới nhất của framework CSS utility-first. Các component UI được xây dựng trên nền **Radix UI** (headless components đảm bảo accessibility) kết hợp với **shadcn/ui** (thư viện component được thiết kế sẵn). Font chữ sử dụng ba kiểu chữ từ Google Fonts: **Be Vietnam Pro** (font chính, hỗ trợ tiếng Việt hoàn hảo), **Caveat** (font chữ viết tay cho các điểm nhấn thẩm mỹ) và **Geist** (font monospace/sans cho tiêu đề và số liệu).

### Backend & Cơ sở dữ liệu

**Supabase** được chọn làm Backend-as-a-Service (BaaS), cung cấp: PostgreSQL database với Row Level Security (RLS), hệ thống xác thực (Auth) đầy đủ, REST API tự động sinh từ schema, và realtime subscriptions. API phía server được xây dựng qua Next.js Route Handlers, sử dụng Supabase Service Role Key để bypass RLS khi cần thiết.

### Form & Validation

Quản lý form sử dụng **React Hook Form 7.77** kết hợp với **Zod 4.4.3** cho validation schema — đây là cặp đôi phổ biến nhất trong hệ sinh thái React hiện đại. **@hookform/resolvers** đóng vai trò bridge kết nối hai thư viện này.

### Icons & Tài nguyên

Biểu tượng được tải từ **Font Awesome** (CDN, không phụ thuộc package) giúp giảm bundle size. Hình ảnh placeholder được lấy từ **Unsplash** và **Wikimedia Commons**. Thời tiết thực tế được lấy từ **Open-Meteo API** (miễn phí, không cần API key).

---

## 3. KIẾN TRÚC HỆ THỐNG

### Cấu trúc thư mục

```
caobang-travel-connect/
├── app/
│   ├── page.tsx                  ← Trang chủ (Homepage)
│   ├── layout.tsx                ← Root layout (fonts, metadata, viewport)
│   ├── globals.css               ← CSS toàn cục, biến màu, animations
│   ├── admin/                    ← Khu vực quản trị (protected)
│   │   ├── page.tsx              ← Dashboard tổng quan
│   │   ├── layout.tsx            ← Admin layout
│   │   ├── bookings/             ← Quản lý đặt lịch
│   │   ├── guides/               ← Quản lý HDV
│   │   ├── tours/                ← Quản lý tour
│   │   ├── destinations/         ← Quản lý điểm đến
│   │   ├── reviews/              ← Duyệt đánh giá
│   │   ├── contacts/             ← Xem liên hệ
│   │   ├── users/                ← Quản lý người dùng
│   │   ├── gallery/              ← Quản lý ảnh
│   │   ├── cam-nang/             ← Quản lý cẩm nang
│   │   ├── pricing/              ← Cấu hình giá
│   │   └── settings/             ← Cài đặt hệ thống
│   ├── api/                      ← API Routes (server-side)
│   │   ├── booking/route.ts      ← Xử lý đặt lịch & tích điểm
│   │   ├── contact/route.ts      ← Xử lý liên hệ
│   │   └── admin/users/route.ts  ← API quản lý người dùng
│   ├── components/
│   │   ├── layout/               ← Header, Footer, MobileNav
│   │   ├── sections/             ← Các section của trang chủ
│   │   └── ui/                   ← Radix UI / shadcn components
│   ├── diem-den/                 ← Trang điểm đến
│   ├── tour/                     ← Trang tour
│   ├── cam-nang/                 ← Cẩm nang du lịch
│   ├── hdv/                      ← Danh sách & hồ sơ HDV
│   ├── dat-lich/                 ← Trang đặt lịch standalone
│   ├── tai-khoan/                ← Trang tài khoản người dùng
│   ├── dang-nhap/                ← Trang đăng nhập
│   ├── thu-vien/                 ← Thư viện ảnh
│   └── tin-nhan/[id]/            ← Xem tin nhắn/phản hồi
└── lib/                          ← Thư viện dùng chung
    ├── supabase.ts               ← Supabase client instance
    ├── database.types.ts         ← TypeScript types từ DB schema
    └── loyalty.ts                ← Logic điểm tích lũy & tier
```

### Luồng dữ liệu

Trang chủ (`page.tsx`) khởi động với dữ liệu fallback cứng (mock data) để hiển thị ngay lập tức, sau đó tự động cập nhật từ Supabase thông qua 7 query song song: guides, destinations, reviews, gallery_images, site_settings, tours và cam_nang_tips. Pattern này đảm bảo trang luôn có nội dung hiển thị ngay cả khi Supabase chậm phản hồi.

---

## 4. CÁC TRANG & TÍNH NĂNG CHÍNH

### 4.1 Trang Chủ (Homepage)

Trang chủ là trung tâm của toàn bộ hệ thống, tập hợp 12 section theo thứ tự từ trên xuống:

**HeroSection** — Banner chào mừng với ảnh nền (hoặc video) có thể cấu hình từ Admin. Hiệu ứng parallax sương mù (mist parallax) khi cuộn trang tạo chiều sâu thị giác. Tích hợp widget thời tiết thời gian thực hiển thị nhiệt độ, mã thời tiết và tốc độ gió tại Cao Bằng từ Open-Meteo API (tọa độ: 22.67°N, 106.27°E).

**AboutSection** — Giới thiệu dịch vụ với ảnh đại diện có thể cấu hình.

**WhyUsSection** — Lý do chọn Cao Bằng Travel Connect với ảnh nền parallax.

**GuideGrid** — Lưới hiển thị các hướng dẫn viên. Hỗ trợ tìm kiếm theo tên, lọc theo ngôn ngữ và đánh giá sao. HDV được đánh dấu "featured" hiển thị trước. Nút "Đặt HDV ngay" mở booking modal ngay trên trang.

**DestinationGrid** — Lưới 6 điểm đến nổi bật với modal chi tiết khi click. Modal cung cấp nút đặt tour tham quan và link xem trang chi tiết.

**TourCategory** — Danh mục tour nổi bật dạng card, được tải từ bảng `tours`. Mỗi TourCard hiển thị tiêu đề, ảnh, thời gian, số lượng người, giá khởi điểm và nút đặt ngay.

**GalleryScrapbook** — Bộ sưu tập ảnh theo phong cách scrapbook, hiển thị tối đa 8 hình từ bảng `gallery_images`.

**PricingBooking** — Bảng giá dịch vụ HDV với nút đặt lịch nhanh, ảnh nền có thể cấu hình.

**CamNangSection** — Cẩm nang du lịch với các tip ngắn gọn, biểu tượng màu sắc và tag phân loại.

**Testimonials** — Carousel đánh giá của du khách, hỗ trợ phân trang. Có nút "Viết đánh giá" mở review modal.

**FAQAccordion** — 4 câu hỏi thường gặp về du lịch Cao Bằng sử dụng Radix UI Accordion.

**ContactForm** — Form liên hệ kết nối với `/api/contact`.

**SOS Section** — Phần hotline khẩn cấp với 6 số điện thoại (Công An, Cấp Cứu 115, PCCC 114, Bệnh Viện, Ban Quản Lý Du Lịch, Hỗ Trợ Tour 24/7). Mỗi mục là link `tel:` có thể gọi trực tiếp từ điện thoại.

### 4.2 Booking Modal (Đặt HDV)

Modal đặt HDV xuất hiện ngay trên trang chủ, không chuyển hướng. Form thu thập: họ tên, điện thoại, email, ngày dự kiến, ghi chú và chọn HDV. Tính năng nổi bật:

- **Tìm kiếm HDV trong modal** — Ô tìm kiếm theo tên/chuyên môn lọc dropdown theo thời gian thực.
- **Cảnh báo ngày bận** — Khi chọn ngày, hệ thống kiểm tra bảng `guide_schedules` và hiển thị cảnh báo nếu HDV đã có lịch.
- **Loyalty discount banner** — Hiển thị tổng ưu đãi (tier discount + guide loyalty bonus) nếu người dùng đã đăng nhập.
- **Sau đặt thành công** — Hiển thị thông báo thành công kèm số điểm tích lũy được và hạng mới nếu có tăng tier.

### 4.3 Trang Đặt Lịch Standalone (`/dat-lich`)

Trang riêng biệt với giao diện toàn màn hình, phù hợp cho việc đặt từ bên ngoài homepage. Bố cục hai cột (trên desktop): cột trái là form đặt lịch chi tiết, cột phải là card HDV đã chọn kèm bảng tính tiền cọc.

Bảng tính tiền tự động: đơn giá × số ngày − giảm giá = tổng tiền → tiền cọc (% cấu hình) → còn lại. Hỗ trợ đặt theo tour cụ thể (qua query param `?tour=ID`) hoặc theo gói dịch vụ (HDV cá nhân / đoàn / xe máy / tùy chỉnh). Trang đọc `deposit_pct` và các mức giá từ bảng `site_settings`, cho phép Admin thay đổi mà không cần deploy lại code.

### 4.4 Hệ Thống Xác Thực & Tài Khoản

Sử dụng Supabase Auth với email/password. Sau đăng nhập, `user_profiles` được tải về để hiển thị tên, điểm tích lũy và hạng thành viên trên header. Thông tin này tự động điền vào các form đặt lịch và review. Hệ thống cũng đếm số tin nhắn có phản hồi chưa đọc (`unread_replies`) và hiển thị badge đỏ trên header.

### 4.5 Trang HDV, Điểm Đến, Tour, Cẩm Nang

Mỗi danh mục có trang danh sách và trang chi tiết động (dynamic route `[id]`). Điểm đến có trang `/diem-den/[id]`, tour có `/tour/[id]`, HDV có `/hdv/[id]`, cẩm nang có `/cam-nang/[id]`. Tất cả đều tải dữ liệu từ Supabase theo ID tương ứng.

---

## 5. HỆ THỐNG CƠ SỞ DỮ LIỆU

Cơ sở dữ liệu PostgreSQL trên Supabase gồm các bảng chính sau:

### Bảng `guides` — Hướng Dẫn Viên
Lưu thông tin hồ sơ HDV: id, name, specialty (chuyên môn), role, bio, rating, years_experience, languages, image_url, zalo_number, is_active, is_featured, created_at.

### Bảng `destinations` — Điểm Đến
id, title, description, image_url, sort_order, created_at.

### Bảng `tours` — Gói Tour
id, title, description, image_url, price_from, duration, group_size, zalo_number, is_active, sort_order.

### Bảng `bookings` — Đặt Lịch
id, client_name, email, phone, package_type, preferred_date, message, status (pending/confirmed/cancelled), user_id (FK → auth.users), guide_id (FK → guides), discount_pct, points_earned, created_at.

### Bảng `contacts` — Liên Hệ
id, name, email, phone, message, is_read, admin_reply, user_id (FK), created_at.

### Bảng `reviews` — Đánh Giá
id, reviewer_name, reviewer_location, stars, review_text, avatar_url, is_approved, user_id, created_at.

### Bảng `gallery_images` — Thư Viện Ảnh
id, image_url, sort_order, created_at.

### Bảng `site_settings` — Cài Đặt Hệ Thống
Bảng key-value linh hoạt, lưu tất cả cấu hình có thể thay đổi: hero_bg, hero_video, about_image, destinations_bg, pricing_bg, whyus_bg, team_bg, tours_bg, gallery_bg, testimonials_bg, sos_bg, cam_nang_bg, background_music, booking_bg, deposit_pct, price_hdv_ca_nhan, price_hdv_doan, price_hdv_xe_may.

### Bảng `cam_nang_tips` — Cẩm Nang
id, icon, tag, color, title, description, sort_order, is_active.

### Bảng `user_profiles` — Hồ Sơ Người Dùng
id (FK → auth.users), full_name, phone, points, tier, is_admin, created_at.

### Bảng `guide_schedules` — Lịch Bận HDV
id, guide_id (FK → guides), date, created_at.

---

## 6. API ROUTES

### `POST /api/booking`

Endpoint xử lý đặt lịch, chạy phía server với quyền Service Role (bypass RLS). Quy trình xử lý: validate dữ liệu đầu vào → insert bản ghi vào bảng `bookings` → nếu có `user_id`, cộng `POINTS_PER_BOOKING` vào `user_profiles.points` → tính tier mới → trả về `points_earned`, `new_points`, `new_tier` cho client.

Có cơ chế fallback: nếu insert thất bại do lỗi cột không tồn tại (error code `42703`), hệ thống thử lại với payload tối giản (chỉ các trường cốt lõi), đảm bảo không mất đặt lịch của khách ngay cả khi schema chưa đồng bộ.

### `POST /api/contact`

Nhận thông tin liên hệ (name, email, phone, message, user_id), insert vào bảng `contacts`. Dùng cho cả form liên hệ chính và form đăng ký nhận tin ở footer.

### `GET/POST /api/admin/users`

API quản lý người dùng dành cho admin, bảo vệ bằng xác thực phiên Supabase phía server.

---

## 7. HỆ THỐNG ĐIỂM TÍCH LŨY & ƯU ĐÃI (LOYALTY SYSTEM)

Đây là tính năng khác biệt của nền tảng, khuyến khích du khách quay lại nhiều lần.

### Cơ chế tích điểm

Mỗi lần đặt lịch thành công (status = confirmed), người dùng đã đăng nhập nhận được `POINTS_PER_BOOKING` điểm. Điểm được cộng trực tiếp vào `user_profiles.points` thông qua `/api/booking`.

### Phân cấp hạng thành viên (Tier System)

Được định nghĩa trong `lib/loyalty.ts`, gồm nhiều hạng dựa trên tổng điểm tích lũy. Mỗi hạng có: tên hiển thị (label), icon Font Awesome, màu sắc đặc trưng và mức giảm giá (discount %). Hạng cao hơn → giảm giá nhiều hơn khi đặt lịch.

### Ưu đãi khách thân thiết HDV

Ngoài tier discount, hệ thống còn tính thêm `GUIDE_LOYALTY_BONUS_PCT` cho những khách đã đặt cùng một HDV từ `GUIDE_LOYALTY_THRESHOLD` lần trở lên. Ưu đãi này hiển thị rõ ràng trong form đặt lịch, khuyến khích khách gắn kết lâu dài với HDV yêu thích.

### Hiển thị tiến độ

Trong form đặt lịch, hệ thống hiển thị: số lần đã đặt HDV này, còn cần bao nhiêu lần nữa để đạt loyalty bonus, và tổng ưu đãi đang được áp dụng.

---

## 8. BẢNG QUẢN TRỊ (ADMIN DASHBOARD)

Truy cập tại `/admin/*`, bảo vệ bằng kiểm tra `user_profiles.is_admin = true`. Nếu không phải admin, tự động chuyển về trang chủ.

### Dashboard Tổng Quan (`/admin`)

Hiển thị 4 thẻ số liệu: tổng HDV, tổng đặt tour (kèm số chờ xử lý), tổng liên hệ (kèm số chưa đọc), tổng đánh giá (kèm số chờ duyệt). Biểu đồ cột thủ công (không dùng thư viện chart) hiển thị số lượt đặt lịch theo 6 tháng gần nhất, phân biệt tổng vs. đã xác nhận. Bảng "Đặt lịch gần đây" với nút duyệt/hủy nhanh ngay trên dashboard.

### Quản lý con

- `/admin/bookings` — Xem và cập nhật trạng thái tất cả đặt lịch.
- `/admin/guides` — Thêm/sửa/xóa HDV, đánh dấu featured, cập nhật lịch bận.
- `/admin/tours` — Quản lý gói tour, bật/tắt hiển thị, sắp xếp thứ tự.
- `/admin/destinations` — Quản lý điểm đến, sắp xếp sort_order.
- `/admin/reviews` — Duyệt hoặc từ chối đánh giá trước khi hiển thị công khai.
- `/admin/contacts` — Xem tin nhắn từ khách, trả lời (admin_reply).
- `/admin/users` — Xem danh sách người dùng, cấp/thu hồi quyền admin.
- `/admin/gallery` — Upload và sắp xếp ảnh thư viện.
- `/admin/cam-nang` — Quản lý nội dung cẩm nang du lịch.
- `/admin/pricing` — Cập nhật giá HDV và phần trăm tiền cọc.
- `/admin/settings` — Cập nhật ảnh nền các section, link video hero, nhạc nền.

---

## 9. TÍNH NĂNG PHỤ

### Music Player

Component `MusicPlayer.tsx` phát nhạc nền (URL được cấu hình từ `site_settings.background_music`). Có nút bật/tắt, âm lượng, và tự động tắt âm khi ẩn trang (Page Visibility API).

### Sticky Bottom Bar

`StickyBottomBar.tsx` là thanh điều hướng nhanh dành cho mobile, giữ cố định ở cuối màn hình.

### Fade-up Animation

Các phần tử có class `fade-up` được quan sát bằng IntersectionObserver. Khi phần tử vào viewport, class `visible` được thêm vào kích hoạt CSS transition. Observer chạy lại mỗi khi dữ liệu thay đổi (guides, destinations, reviews, filter state).

### SEO & Metadata

Root layout định nghĩa đầy đủ metadata: title, description, keywords, Open Graph tags, viewport, theme color (#265C59 — màu xanh rêu đặc trưng của thương hiệu). Lang được đặt `vi` cho hỗ trợ tiếng Việt.

---

## 10. BẢO MẬT

Hệ thống sử dụng nhiều lớp bảo mật:

Supabase Row Level Security (RLS) kiểm soát quyền truy cập cơ sở dữ liệu ở cấp độ hàng. API Routes sử dụng Service Role Key (chỉ trên server, không expose ra client) để thực hiện các thao tác cần quyền cao. Admin pages kiểm tra session + `is_admin` flag trước khi render. Biến môi trường nhạy cảm (SUPABASE_SERVICE_ROLE_KEY) không bao giờ xuất hiện trong client bundle.

---

## 11. HƯỚNG PHÁT TRIỂN

Dựa trên kiến trúc hiện tại, các tính năng tiếp theo có thể triển khai:

**Tích hợp thanh toán** — Kết nối VNPay hoặc Momo để thu tiền cọc trực tuyến, thay vì chỉ thông báo và liên hệ xác nhận.

**Hệ thống tin nhắn thời gian thực** — Nâng cấp `/tin-nhan/[id]` thành chat realtime sử dụng Supabase Realtime subscriptions, thay vì chỉ xem phản hồi đơn chiều từ Admin.

**Review gắn với booking** — Sau khi chuyến đi hoàn thành, gửi email mời đánh giá tự động, liên kết review với booking ID để tăng độ tin cậy.

**Trang HDV có trang cá nhân đầy đủ** — Mỗi HDV có trang cá nhân riêng với lịch rảnh/bận tương tác, danh sách tour đã dẫn, đánh giá chuyên biệt.

**Tìm kiếm toàn văn** — Thanh search ở HeroSection hiện chỉ log ra console. Cần triển khai full-text search qua Supabase `to_tsvector`/`plainto_tsquery` để tìm kiếm xuyên suốt tours, destinations, guides.

**Đa ngôn ngữ (i18n)** — Bổ sung tiếng Anh và tiếng Trung để phục vụ du khách quốc tế, đặc biệt quan trọng với vị trí địa lý sát biên giới Trung Quốc của Cao Bằng.

**PWA & Offline Mode** — Chuyển đổi thành Progressive Web App với Service Worker, cho phép du khách xem thông tin điểm đến và số hotline khi không có mạng.

---

## 12. KẾT LUẬN

Cao Bằng Travel Connect là một nền tảng du lịch được xây dựng bài bản với công nghệ hiện đại, kiến trúc rõ ràng và khả năng mở rộng cao. Điểm mạnh nổi bật của dự án là: hệ thống cấu hình linh hoạt qua `site_settings` (thay đổi ảnh, nhạc, giá mà không cần code), hệ thống loyalty độc đáo tạo sự gắn kết với khách hàng, và trải nghiệm đặt lịch mượt mà với tính toán tiền cọc minh bạch ngay trên giao diện.

Dự án sẵn sàng để deploy lên Vercel (tương thích hoàn toàn với Next.js App Router) với Supabase làm backend, tạo ra một sản phẩm thương mại đầy đủ chức năng cho ngành du lịch tỉnh Cao Bằng.

---

*Báo cáo được tạo tự động ngày 04/06/2026.*
