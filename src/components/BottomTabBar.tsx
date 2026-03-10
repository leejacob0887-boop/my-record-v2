'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Lightbulb } from 'lucide-react';

const tabs = [
  {
    href: '/',
    label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4A90D9' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: '/diary',
    label: '일기',
    icon: (active: boolean) => <BookOpen size={22} color={active ? '#4A90D9' : '#9CA3AF'} strokeWidth={2} />,
  },
  {
    href: '/moments',
    label: '메모',
    icon: (active: boolean) => <Zap size={22} color={active ? '#4A90D9' : '#9CA3AF'} strokeWidth={2} />,
  },
  {
    href: '/ideas',
    label: '아이디어',
    icon: (active: boolean) => <Lightbulb size={22} color={active ? '#4A90D9' : '#9CA3AF'} strokeWidth={2} />,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-md mx-auto flex">
        {tabs.map((tab) => {
          const active = tab.href === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
            >
              {tab.icon(active)}
              <span className={`text-[10px] ${active ? 'font-semibold text-[#4A90D9]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
