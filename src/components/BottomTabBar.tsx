'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { House, BookOpen, Zap, Lightbulb, CheckSquare, CalendarDays } from 'lucide-react';

const ACTIVE_COLOR = '#0F6E56';
const INACTIVE_COLOR = '#bbb';

const BADGE_KEYS: Record<string, string> = {
  '/diary': 'new_badge_diary',
  '/moments': 'new_badge_moment',
  '/ideas': 'new_badge_idea',
};

const tabs = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => <House size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/diary',
    label: '일기',
    icon: (active: boolean) => <BookOpen size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/moments',
    label: '메모',
    icon: (active: boolean) => <Zap size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/ideas',
    label: '아이디어',
    icon: (active: boolean) => <Lightbulb size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/todos',
    label: '할 일',
    icon: (active: boolean) => <CheckSquare size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/calendar',
    label: '캘린더',
    icon: (active: boolean) => <CalendarDays size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
];

function readBadges() {
  const result: Record<string, boolean> = {};
  Object.entries(BADGE_KEYS).forEach(([href, key]) => {
    result[href] = localStorage.getItem(key) === '1';
  });
  return result;
}

export default function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [badges, setBadges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setBadges(readBadges());
    const handler = () => setBadges(readBadges());
    window.addEventListener('badge-update', handler);
    return () => window.removeEventListener('badge-update', handler);
  }, []);

  const handleTabClick = (href: string) => {
    const key = BADGE_KEYS[href];
    if (key) {
      localStorage.removeItem(key);
      setBadges(prev => ({ ...prev, [href]: false }));
    }
    router.push(href);
  };

  // 홈 화면에서는 탭바 숨김 (카테고리 가로 스크롤로 대체)
  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-[430px] mx-auto flex">
        {tabs.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const hasBadge = badges[tab.href] ?? false;
          return (
            <button
              key={tab.href}
              onClick={() => handleTabClick(tab.href)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                {tab.icon(active)}
                {hasBadge && (
                  <span className="absolute -top-1 -right-1 bg-[#0F6E56] text-white text-[8px] font-bold px-1 rounded-full leading-tight">
                    NEW
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${active ? 'font-semibold' : 'text-gray-400'}`} style={active ? { color: ACTIVE_COLOR } : undefined}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
