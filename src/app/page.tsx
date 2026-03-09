'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

// SVG icons (outline style)
function BookIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}
function BoltIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function BulbIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

interface RecordCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  count: number;
  href: string;
}

function RecordCard({ icon, label, description, count, href }: RecordCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all active:scale-95 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between">
        {icon}
        <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100">
          {count}개
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 mt-1">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

type RecentItem = { type: 'diary' | 'moment' | 'idea'; label: string; date: string; href: string };

export default function Home() {
  const { entries } = useDiary();
  const { moments } = useMoments();
  const { ideas } = useIdeas();

  const [recentOpen, setRecentOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const todayCount = useMemo(() => {
    const d = entries.filter(e => e.date === today).length;
    const m = moments.filter(m => m.date === today).length;
    const i = ideas.filter(i => i.createdAt.slice(0, 10) === today).length;
    return d + m + i;
  }, [entries, moments, ideas, today]);

  const recentItems = useMemo<RecentItem[]>(() => {
    const all: RecentItem[] = [
      ...entries.map(e => ({ type: 'diary' as const, label: e.title, date: e.date ?? '', href: `/diary/${e.id}` })),
      ...moments.map(m => ({ type: 'moment' as const, label: m.text, date: m.date ?? m.createdAt?.slice(0, 10) ?? '', href: `/moments/${m.id}` })),
      ...ideas.map(i => ({ type: 'idea' as const, label: i.title, date: i.createdAt?.slice(0, 10) ?? '', href: `/ideas/${i.id}` })),
    ];
    return all.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
  }, [entries, moments, ideas]);

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-[430px] mx-auto px-5">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="메뉴">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="설정"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">나의 기록</h1>

        {/* Today badge */}
        <div className={`text-center mb-5 text-sm font-medium ${todayCount > 0 ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
          {todayCount > 0
            ? `오늘 ${todayCount}개의 기록을 남겼어요 ✨`
            : '오늘 첫 기록을 남겨볼까요?'}
        </div>

        {/* Record cards grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <RecordCard
            icon={<BookIcon />}
            label="일기"
            description="하루 하나씩 깊은 기록"
            count={entries.length}
            href="/diary"
          />
          <RecordCard
            icon={<BoltIcon />}
            label="지금 이 순간"
            description="짧은 순간의 기억"
            count={moments.length}
            href="/moments"
          />
          <RecordCard
            icon={<BulbIcon />}
            label="아이디어"
            description="떠오르는 생각들"
            count={ideas.length}
            href="/ideas"
          />
          <RecordCard
            icon={<CalendarIcon />}
            label="캘린더"
            description="날짜별로 돌아보기"
            count={0}
            href="/calendar"
          />
        </div>

        {/* Recent records — collapsible */}
        {recentItems.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setRecentOpen(o => !o)}
              className="flex items-center gap-1.5 w-full text-left px-1 mb-2 group"
            >
              <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-500 transition-colors">최근 기록</span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-300 ${recentOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: recentOpen ? `${recentItems.length * 56}px` : '0px', opacity: recentOpen ? 1 : 0 }}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {recentItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-none hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {item.type === 'diary' && <BookIcon size={18} />}
                      {item.type === 'moment' && <BoltIcon size={18} />}
                      {item.type === 'idea' && <BulbIcon size={18} />}
                    </div>
                    <p className="flex-1 text-sm text-gray-700 truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{item.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Illustration section */}
        <div className="flex flex-row items-end pt-2">
          <div className="flex-1 pb-8">
            <p className="text-lg font-medium text-gray-600 leading-snug">
              생각은 사라지지만,<br />
              <span className="font-bold text-gray-800">기록은 남습니다.</span>
            </p>
          </div>
          <div className="w-[52%] flex-shrink-0 -mr-5">
            <Image
              src="/illustration.png"
              alt="기록하는 일러스트"
              width={220}
              height={220}
              className="object-contain w-full h-auto mix-blend-multiply"
              priority
            />
          </div>
        </div>

      </div>
    </main>
  );
}
