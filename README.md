# Cao Bằng Travel Connect

Dự án website kết nối Hướng dẫn viên và Tour du lịch tại Cao Bằng.
Được xây dựng trên nền tảng **Next.js 16 + React 19 + Tailwind CSS 4 + Supabase**.

## 📱 Mobile-First UX (Optimization Notes)

Dự án đã được tối ưu hóa toàn diện cho trải nghiệm trên thiết bị di động (mobile-first), tập trung vào các dòng màn hình từ 320px đến 430px (như iPhone SE, iPhone 14 Pro) và tablet.

- **Bottom Navigation**: Sử dụng `StickyBottomBar` cho các trang chi tiết, với các nút CTA lớn (`>=44px`) thuận tiện cho thao tác một tay.
- **Tailwind CSS v4 Utilities**: Chuyển đổi từ `inline-styles` và raw CSS (`<style>`) sang Tailwind classes giúp render nhanh hơn và quản lý responsive dễ dàng hơn.
- **Safe Area Support**: Tích hợp các class `pb-safe`, `pt-safe` để tương thích hoàn hảo với màn hình có tai thỏ (notch) trên iOS/Android.
- **Touch Targets**: Mọi button, input, và thẻ (card) đều đảm bảo kích thước tối thiểu giúp thao tác chạm chính xác.
- **Layouts**: Layout của trang `dang-nhap`, `tai-khoan`, và bảng điều khiển `admin` được chuyển đổi thành sidebar trượt dạng drawer thay vì cố định, tiết kiệm không gian trên di động.

## 🚀 Getting Started

Cài đặt các gói phụ thuộc và chạy môi trường phát triển:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 🗄️ Supabase

Dự án sử dụng Supabase cho Authentication và Database:
- Bảng `user_profiles` để quản lý người dùng và hạng thành viên (loyalty points).
- Bảng `bookings` ghi nhận thông tin đặt tour.
- Các Trigger (như `on_auth_user_created`) được thiết lập trên Supabase để tự động hoá việc tạo hồ sơ.

## 🖼️ UI/UX Design Token

- **Màu sắc chính:** Teal (`#265C59`), Beige (`#F9F9EC`).
- **Typography:** Be Vietnam Pro (chủ đạo), Lora (serif), Caveat (handwriting font).
