import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cao Bằng Eco Tour | Hướng Dẫn Viên Địa Phương Chuyên Nghiệp",
  description:
    "Khám phá Cao Bằng cùng hướng dẫn viên địa phương am hiểu, tận tâm. Thác Bản Giốc, Pác Bó, Động Ngườm Ngao và hơn 30 điểm đến độc đáo. Đặt HDV ngay hôm nay.",
  keywords: "hướng dẫn viên Cao Bằng, tour Cao Bằng, thác Bản Giốc, Pác Bó, Động Ngườm Ngao, du lịch Cao Bằng",
  openGraph: {
    title: "Cao Bằng Eco Tour | Hướng Dẫn Viên Địa Phương",
    description: "Trải nghiệm Cao Bằng chân thực cùng những hướng dẫn viên bản địa am hiểu nhất.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
