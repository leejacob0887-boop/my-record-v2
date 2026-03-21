'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function HomeTopBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-4">
      <DarkModeToggle />
      <div className="flex items-center gap-2">
        <svg width="36" height="36" viewBox="0 0 80 80">
          <rect width="80" height="80" rx="18" fill="#0F6E56" />
          <path d="M40 62 Q30 48 32 30 Q36 14 50 10 Q62 7 64 20 Q66 33 54 42 Q46 48 40 62Z" fill="#E1F5EE" opacity="0.95" />
          <path d="M40 62 Q43 48 50 30" fill="none" stroke="#5DCAA5" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 62 L37 69 L40 67 L43 69 Z" fill="#E1F5EE" />
          <ellipse cx="40" cy="72" rx="3.5" ry="4.5" fill="#FAC775" />
          <g transform="translate(60,18)">
            <path d="M0,-7 L1.7,-1.7 L7,0 L1.7,1.7 L0,7 L-1.7,1.7 L-7,0 L-1.7,-1.7 Z" fill="#FAC775" />
          </g>
          <g transform="translate(52,30)">
            <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#FAC775" opacity="0.7" />
          </g>
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notia</h1>
      </div>
      <Link
        href="/settings"
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="설정"
      >
        <Settings size={20} color="#374151" strokeWidth={1.8} />
      </Link>
    </div>
  );
}
