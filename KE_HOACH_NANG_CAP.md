# Kế hoạch nâng cấp — Cao Bằng Travel Connect

_Ngày lập: 23/06/2026_

## A. Kết quả kiểm tra tính toàn vẹn

| Hạng mục | Kết quả | Ghi chú |
|---|---|---|
| TypeScript (`tsc --noEmit`) | ✅ Sạch | Không có lỗi kiểu |
| ESLint | ⚠️ 58 lỗi, 75 cảnh báo | Chủ yếu `<a>`→`<Link>`, `<img>`→`<Image>`, biến không dùng, `setState` trong `useEffect` |
| `next build` | ⚠️ Không chạy trong sandbox | `node_modules` chỉ có SWC bản Windows; trên máy bạn vẫn build được |
| Bảo mật cấu hình | ✅ Tốt | `.env*` đã ignore, không commit secrets |

Mã nguồn lành mạnh về mặt kiểu dữ liệu. Vấn đề chính là chất lượng lint (ảnh hưởng SEO/hiệu năng) và `app/page.tsx` quá lớn (994 dòng).

## B. Hiện trạng tính năng

Đã có: trang chủ, tour, điểm đến, HDV, cẩm nang, thư viện, đặt lịch, đăng nhập, tài khoản, tin nhắn, và **admin CMS đầy đủ**. Backend Supabase với 12 bảng, hệ thống điểm thưởng (loyalty), lịch bận của HDV, đánh giá.

Còn thiếu: thanh toán/đặt cọc online, thông báo email/SMS, SEO nâng cao, tìm kiếm & lọc, bản đồ, đa ngôn ngữ.

## C. Sửa lỗi & nợ kỹ thuật (ưu tiên trước)

1. **Dọn lint** — thay `<a href="/">` bằng `<Link>`; thay `<img>` bằng `next/image` (tăng tốc tải ảnh, điểm LCP). Xóa biến/hàm không dùng.
2. **Sửa `setState` trong `useEffect`** ở `app/page.tsx:332` để tránh re-render dây chuyền.
3. **Tách `app/page.tsx`** (994 dòng) thành các section component nhỏ, dễ bảo trì.

## D. Đề xuất nâng cấp tính năng (theo độ ưu tiên)

### Ưu tiên cao — tác động kinh doanh trực tiếp

- **Thanh toán / đặt cọc online**: tích hợp VNPay, MoMo hoặc Stripe. Hiện đặt tour chỉ ghi nhận `pending`, chưa thu tiền.
- **Thông báo tự động**: email xác nhận đặt tour cho khách + thông báo cho admin/HDV (Resend hoặc Supabase Edge Function); tùy chọn SMS/Zalo.
- **Tìm kiếm & bộ lọc**: lọc tour theo giá, thời lượng, điểm đến; lọc HDV theo chuyên môn, đánh giá. Tăng tỷ lệ chuyển đổi.
- **SEO**: thêm `metadata` từng trang, `sitemap.ts`, `robots.ts`, Open Graph, và structured data (schema `TouristTrip` / `LocalBusiness`) để Google hiển thị tốt hơn.

### Ưu tiên trung bình — trải nghiệm người dùng

- **Đánh giá có kiểm chứng**: cho khách đã hoàn thành tour gửi review, kèm duyệt (moderation) ở admin.
- **Lịch trống trực quan**: lịch (calendar) hiển thị ngày HDV còn nhận, thay vì chỉ chặn ngày bận.
- **Đa ngôn ngữ (i18n)**: thêm tiếng Anh cho khách quốc tế — thị trường du lịch Cao Bằng.
- **Bản đồ điểm đến**: nhúng Google Maps/Mapbox cho mỗi điểm đến và điểm đón.
- **Yêu thích / lưu tour**: cho người dùng đăng nhập lưu tour quan tâm.

### Ưu tiên thấp — hoàn thiện & vận hành

- **PWA**: cài được như app, hỗ trợ offline cơ bản.
- **Analytics**: Vercel Analytics hoặc GA4 để theo dõi hành vi và nguồn khách.
- **Dashboard admin nâng cao**: biểu đồ doanh thu, số booking theo thời gian, tour bán chạy.
- **Chat thời gian thực** giữa khách và HDV (mở rộng từ trang tin nhắn hiện có, dùng Supabase Realtime).
- **Kiểm thử & CI**: thêm test cho API booking/contact và GitHub Actions chạy lint + build mỗi PR.

## E. Lộ trình gợi ý

- **Giai đoạn 1 (1–2 tuần)**: dọn lint, sửa hiệu năng, tách `page.tsx`, thêm SEO cơ bản.
- **Giai đoạn 2 (2–4 tuần)**: thanh toán online + thông báo email + tìm kiếm/lọc.
- **Giai đoạn 3 (sau đó)**: i18n, bản đồ, đánh giá có kiểm chứng, analytics, PWA.
