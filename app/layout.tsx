import type { Metadata } from "next";
import { Be_Vietnam_Pro, Caveat } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-be",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cao Bằng Travel Connect | Hướng Dẫn Viên Địa Phương Chuyên Nghiệp",
  description:
    "Khám phá Cao Bằng cùng hướng dẫn viên địa phương am hiểu, tận tâm. Thác Bản Giốc, Pác Bó, Động Ngườm Ngao và hơn 30 điểm đến độc đáo. Đặt HDV ngay hôm nay.",
  keywords: "hướng dẫn viên Cao Bằng, tour Cao Bằng, thác Bản Giốc, Pác Bó, Động Ngườm Ngao, du lịch Cao Bằng",
  openGraph: {
    title: "Cao Bằng Travel Connect | Hướng Dẫn Viên Địa Phương",
    description: "Trải nghiệm Cao Bằng chân thực cùng những hướng dẫn viên bản địa am hiểu nhất.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnam.variable} ${caveat.variable}`}>
      <body className={`${beVietnam.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
