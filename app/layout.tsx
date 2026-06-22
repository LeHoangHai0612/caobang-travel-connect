import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Caveat, Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-be",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#265C59",
};

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
    <html lang="vi" suppressHydrationWarning className={`${beVietnam.variable} ${geist.variable} ${caveat.variable} ${playfair.variable}`}>
      <body className={`${beVietnam.variable} ${geist.variable} ${caveat.variable} ${playfair.variable} min-h-full flex flex-col font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
