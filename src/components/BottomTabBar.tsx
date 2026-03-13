'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Zap, Lightbulb } from 'lucide-react';

const tabs = [
  {
    href: '/',
    label: '홈',
    activeBorder: 'border border-blue-400',
    activeLabel: 'text-blue-500',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#2563EB' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: '/diary',
    label: '일기',
    activeBorder: 'border border-violet-400',
    activeLabel: 'text-violet-600',
    icon: () => <BookOpen size={20} color="#7C3AED" strokeWidth={2} />,
  },
  {
    href: '/moments',
    label: '메모',
    activeBorder: 'border border-orange-400',
    activeLabel: 'text-orange-500',
    icon: () => <Zap size={20} color="#EA580C" strokeWidth={2} />,
  },
  {
    href: '/ideas',
    label: '아이디어',
    activeBorder: 'border border-green-400',
    activeLabel: 'text-green-600',
    icon: () => <Lightbulb size={20} color="#16A34A" strokeWidth={2} />,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-[430px] mx-auto flex">
        {tabs.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? tab.activeBorder : 'border border-transparent'}`}>
                {tab.icon(active)}
              </div>
              <span className={`text-[10px] ${active ? `font-semibold ${tab.activeLabel}` : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
