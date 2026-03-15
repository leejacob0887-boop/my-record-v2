'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, BookOpen, Zap, Lightbulb } from 'lucide-react';

const ACTIVE_COLOR = '#0F6E56';
const INACTIVE_COLOR = '#bbb';

const tabs = [
  {
    href: '/',
    label: '홈',
    activeBorder: 'border border-blue-400',
    activeLabel: 'text-blue-500',
    icon: (active: boolean) => <House size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/diary',
    label: '일기',
    activeBorder: 'border border-violet-400',
    activeLabel: 'text-violet-600',
    icon: (active: boolean) => <BookOpen size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/moments',
    label: '메모',
    activeBorder: 'border border-orange-400',
    activeLabel: 'text-orange-500',
    icon: (active: boolean) => <Zap size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
  },
  {
    href: '/ideas',
    label: '아이디어',
    activeBorder: 'border border-green-400',
    activeLabel: 'text-green-600',
    icon: (active: boolean) => <Lightbulb size={20} color={active ? ACTIVE_COLOR : INACTIVE_COLOR} strokeWidth={2} />,
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
              <div className="w-10 h-10 flex items-center justify-center">
                {tab.icon(active)}
              </div>
              <span className={`text-[10px] ${active ? 'font-semibold' : 'text-gray-400'}`} style={active ? { color: ACTIVE_COLOR } : undefined}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
