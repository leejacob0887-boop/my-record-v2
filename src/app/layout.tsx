import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "나의 기록 | my-record-v2",
  description: "나만의 기록 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAF8F4]`}
      >
        <div className="pb-16">
          {children}
        </div>
        <BottomTabBar />
      </body>
    </html>
  );
}
