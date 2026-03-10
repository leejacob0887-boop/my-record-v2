'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // hydration 전에는 빈 자리만 차지 (레이아웃 흔들림 방지)
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark
        ? <Sun size={20} color="#f9fafb" />
        : <Moon size={20} color="#374151" />}
    </button>
  );
}
