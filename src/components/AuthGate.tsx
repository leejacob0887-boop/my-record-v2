'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PUBLIC_PATHS = ['/auth/login', '/auth/signup'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/auth/login');
    }
  }, [user, loading, pathname, router]);

  // 인증 확인 중 — 빈 화면 (깜빡임 방지)
  if (loading) return <div className="min-h-screen bg-[#FAF8F4]" />;

  // 로그인 안 됐고 보호된 페이지면 빈 화면 (리다이렉트 진행 중)
  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return <div className="min-h-screen bg-[#FAF8F4]" />;
  }

  return <>{children}</>;
}
