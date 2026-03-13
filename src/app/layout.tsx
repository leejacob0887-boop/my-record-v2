import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import BottomTabBar from "@/components/BottomTabBar";
import PinGate from "@/components/PinGate";
import AuthGate from "@/components/AuthGate";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "나의 기록 | my-record-v2",
  description: "나만의 기록 앱 - 일기, 아이디어, 순간을 기록하세요",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나의 기록",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"
        />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased bg-[#FAF8F4] dark:bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AuthGate>
              <PinGate>
                <div className="pb-16">
                  {children}
                </div>
                <BottomTabBar />
              </PinGate>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
