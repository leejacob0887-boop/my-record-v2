'use client';

import { useEffect, useState } from 'react';
import PinLock from './PinLock';

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 실행 — SSR 하이드레이션 문제 방지
    const isLocked = !!(localStorage.getItem('app_pin') && !sessionStorage.getItem('pin_authed'));
    setLocked(isLocked);
    setMounted(true);
  }, []);

  // 마운트 전 빈 화면 (hydration mismatch 방지)
  if (!mounted) return <div className="min-h-screen bg-[#FAF8F4]" />;

  if (locked) {
    return <PinLock mode="enter" onSuccess={() => setLocked(false)} />;
  }

  return <>{children}</>;
}
