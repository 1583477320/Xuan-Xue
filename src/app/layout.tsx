import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "天机阁 · 八字命理 | 玄学气运预测",
  description: "传承千年玄学智慧，融合八卦命理、五行生克、天干地支，为您揭示命运的奥秘。输入生辰八字，即刻获取专属命盘。",
  keywords: ["玄学", "命理", "八字", "八卦", "五行", "天机阁", "占卜", "运势"],
  authors: [{ name: "天机阁" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>☯</text></svg>",
  },
  openGraph: {
    title: "天机阁 · 八字命理预测",
    description: "传承千年玄学智慧，为您揭示命运的奥秘",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mystical-bg min-h-screen`}
        style={{ fontFamily: "'Noto Serif SC', 'SimSun', 'Songti SC', serif, var(--font-geist-sans)" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
