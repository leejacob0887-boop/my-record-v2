'use client';

import { useEffect, useState } from 'react';
import PinLock from './PinLock';

function getInitialLocked(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(localStorage.getItem('app_pin') && !sessionStorage.getItem('pin_authed'));
}

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(getInitialLocked);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Prevent hydration mismatch — show blank bg while mounting
  if (!mounted) return <div className="min-h-screen bg-[#FAF8F4]" />;

  if (locked) {
    return <PinLock mode="enter" onSuccess={() => setLocked(false)} />;
  }

  return <>{children}</>;
}
