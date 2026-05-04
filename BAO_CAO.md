# BÁO CÁO DỰ ÁN: CAO BẰNG ECO TOUR

**Ngày lập:** 04/05/2026  
**Người thực hiện:** Le Hoang Hai  
**Trạng thái:** Đã triển khai (Vercel)

---

## 1. TỔNG QUAN DỰ ÁN

Website giới thiệu và đặt lịch hướng dẫn viên du lịch sinh thái tỉnh Cao Bằng. Mục tiêu cung cấp nền tảng kết nối khách du lịch với hướng dẫn viên địa phương, đồng thời quảng bá các địa danh nổi tiếng của tỉnh.

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Triển khai | Vercel |
| Font chữ | Be Vietnam Pro (Google Fonts) |
| Icon | Font Awesome 6 |

---

## 3. TÍNH NĂNG ĐÃ HOÀN THÀNH

### Trang chính (/)
- Hero section với ảnh nền có thể thay từ Admin
- Danh sách hướng dẫn viên (HDV) với đánh giá sao
- Trang CV HDV riêng tại `/hdv/[id]`
- Bản đồ địa danh nổi bật (Bản Giốc, Pác Bó, Ngườm Ngao…)
- Bảng giá tour với modal đặt lịch
- Phần đánh giá khách hàng (có phân trang)
- Form liên hệ cuối trang
- Nút chat Zalo cho từng HDV
- Trình phát nhạc nền (có thể bật/tắt)
- Hiệu ứng fade-up khi cuộn trang
- Responsive đầy đủ (desktop / tablet / mobile / 360px)

### Hệ thống đặt lịch
- Form đặt lịch với xác thực dữ liệu
- Chọn HDV khi đặt, hiển thị ưu đãi tích lũy
- Ghi nhận đặt lịch vào bảng `bookings` (Supabase)
- Ngăn submit trùng lặp (guard double-click)

### Hệ thống tài khoản người dùng
- Đăng ký / Đăng nhập tại `/dang-nhap`
- Xác nhận email sau đăng ký
- Trang tài khoản `/tai-khoan`: xem hạng thành viên, điểm, lịch sử đặt

### Hệ thống điểm thưởng (Loyalty)
| Hạng | Điểm tối thiểu | Ưu đãi |
|---|---|---|
| Đồng | 0 | 0% |
| Bạc | 100 | 3% |
| Vàng | 300 | 7% |
| Kim Cương | 700 | 10% |

- Mỗi lần đặt lịch thành công: +50 điểm
- Đặt cùng 1 HDV ≥ 3 lần: thêm 5% ưu đãi lòng trung thành

### Trang quản trị Admin (/admin)
- Đăng nhập riêng tại `/login` (chỉ tài khoản có `is_admin = true`)
- Quản lý HDV: thêm / sửa / xóa
- Quản lý địa danh
- Quản lý thư viện ảnh
- Duyệt đánh giá của khách
- Xem danh sách đặt lịch và liên hệ
- Cài đặt ảnh nền các section
- Cài đặt URL nhạc nền

---

## 4. CẤU TRÚC CƠ SỞ DỮ LIỆU (Supabase)

| Bảng | Mô tả |
|---|---|
| `guides` | Thông tin HDV (tên, chuyên môn, ảnh, Zalo, bio…) |
| `destinations` | Địa danh du lịch |
| `gallery_images` | Ảnh thư viện |
| `reviews` | Đánh giá của khách (cần duyệt) |
| `bookings` | Đơn đặt lịch |
| `contacts` | Tin nhắn liên hệ |
| `user_profiles` | Hồ sơ người dùng (điểm, hạng, is_admin) |
| `site_settings` | Cài đặt ảnh nền và nhạc nền |

---

## 5. CÁC FILE SQL CẦN CHẠY TRONG SUPABASE

> Chạy lần lượt trong **Supabase SQL Editor** nếu chưa chạy:

| File | Nội dung |
|---|---|
| `supabase/update_v3.sql` | Tạo `user_profiles`, cột mở rộng cho `bookings`, `is_admin` |
| `supabase/update_v4.sql` | Bảng `site_settings` (hero_bg, login_bg) |
| `supabase/update_v5.sql` | Cột bio, years_experience, languages cho `guides` |
| `supabase/update_v6.sql` | Cài đặt ảnh nền destinations, pricing, nhạc nền |
| `supabase/update_v7.sql` | Cột `user_id` cho `reviews` |
| `supabase/update_v8.sql` | Sửa trigger `handle_new_user` đọc metadata |
| `supabase/fix_bookings_rls.sql` | Chính sách RLS cho phép đặt lịch công khai |

---

## 6. BIẾN MÔI TRƯỜNG (Environment Variables)

### Vercel — Settings → Environment Variables

| Biến | Ghi chú |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Bắt buộc** — dùng trong API routes để bypass RLS |

---

## 7. HƯỚNG DẪN TẠO TÀI KHOẢN ADMIN

1. Đăng ký tài khoản thường qua `/dang-nhap`
2. Vào **Supabase Dashboard → Table Editor → user_profiles**
3. Tìm dòng có email tương ứng, đặt `is_admin = true`
4. Đăng nhập admin tại `/login`

---

## 8. VẤN ĐỀ CÒN TỒN TẠI

| # | Vấn đề | Mức độ | Giải pháp |
|---|---|---|---|
| 1 | Đặt lịch lỗi 500 nếu thiếu `SUPABASE_SERVICE_ROLE_KEY` trên Vercel | Nghiêm trọng | Thêm biến vào Vercel và redeploy |
| 2 | Đánh giá lỗi nếu chưa chạy `update_v7.sql` | Nghiêm trọng | Chạy SQL trong Supabase |
| 3 | Đăng ký không lưu tên/SĐT nếu chưa chạy `update_v8.sql` | Nghiêm trọng | Chạy SQL trong Supabase |
| 4 | Email xác nhận giới hạn ~3 lần/giờ (Supabase free tier) | Vừa | Tắt xác nhận email hoặc dùng SMTP tùy chỉnh (Resend.com) |

---

## 9. THÔNG TIN TRIỂN KHAI

- **Repository:** GitHub (nhánh `main`)
- **Deploy tự động:** Vercel — tự build khi push lên `main`
- **Môi trường:** Production
