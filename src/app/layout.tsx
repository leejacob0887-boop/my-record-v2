import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "@/components/BottomTabBar";
import PinGate from "@/components/PinGate";
import AuthGate from "@/components/AuthGate";
import { AuthProvider } from "@/context/AuthContext";

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased bg-[#FAF8F4]">
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
      </body>
    </html>
  );
}
