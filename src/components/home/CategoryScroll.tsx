'use client';

import { useRouter } from 'next/navigation';
import {
  BookOpen, Zap, Lightbulb, Calendar, CheckSquare,
  FileText, Receipt, Heart, Lock,
} from 'lucide-react';

export default function CategoryScroll() {
  const router = useRouter();

  // max-w-[430px] 컨테이너 기준, px-4 양쪽 = 32px
  const itemWidth = 'calc((min(100vw, 430px) - 32px) / 5)';

  const v1Items = [
    { icon: <BookOpen size={22} />,    label: '일기',    bg: '#0F6E56', href: '/diary' },
    { icon: <Zap size={22} />,         label: '메모',    bg: '#1A8A6B', href: '/moments' },
    { icon: <Lightbulb size={22} />,   label: '아이디어', bg: '#5BBFAA', href: '/ideas' },
    { icon: <Calendar size={22} />,    label: '캘린더',  bg: '#7DCFBC', href: '/calendar' },
    { icon: <CheckSquare size={22} />, label: '투두',    bg: '#0A5240', href: '/todos' },
  ];

  const v2Items = [
    { icon: <FileText size={22} />, label: '노트' },
    { icon: <Receipt size={22} />,  label: '가계부' },
    { icon: <Heart size={22} />,    label: '건강' },
    { icon: <span className="text-2xl font-bold text-gray-400">?</span>, label: '미공개' },
    { icon: <span className="text-2xl font-bold text-gray-400">?</span>, label: '미공개' },
  ];

  return (
    <div className="relative">
    <div
      className="flex px-4 py-2"
      style={{
        overflowX: 'auto',
        overflowY: 'visible',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* V1 — 활성 아이콘 */}
      {v1Items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-1 cursor-pointer active:opacity-70 transition-opacity"
          style={{ flexShrink: 0, width: itemWidth }}
          onClick={() => router.push(item.href)}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto"
            style={{ backgroundColor: item.bg }}
          >
            {item.icon}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{item.label}</span>
        </div>
      ))}

      {/* V2 — 잠금 아이콘 (스크롤로 이어서) */}
      {v2Items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center"
          style={{ flexShrink: 0, width: itemWidth }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 relative mx-auto">
            {item.icon}
            <div className="absolute top-1 right-1 bg-gray-400 rounded-full p-0.5">
              <Lock size={10} className="text-white" />
            </div>
          </div>
          <span className="text-xs text-gray-400 mt-0.5">{item.label}</span>
          <span style={{ fontSize: '9px' }} className="text-gray-300 dark:text-gray-500 leading-tight">준비중</span>
        </div>
      ))}
    </div>
    {/* 오른쪽 페이드 + 스크롤 화살표 */}
    <div
      className="absolute top-0 right-0 h-full w-16 pointer-events-none flex items-center justify-end pr-1"
      style={{ background: 'linear-gradient(to right, transparent, #F4F2EE)' }}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/80 shadow-sm">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3 2L7 5L3 8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
    </div>
  );
}
