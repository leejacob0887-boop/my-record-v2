'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { BookOpen, Zap, Lightbulb, Calendar } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

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
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all active:scale-95 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between">
        {icon}
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-full px-2 py-0.5 border border-gray-100 dark:border-gray-600">
          {count}개
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
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
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-5">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <DarkModeToggle />
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
            icon={<BookOpen size={28} color="#4A90D9" strokeWidth={1.8} />}
            label="일기"
            description="하루 하나씩 깊은 기록"
            count={entries.length}
            href="/diary"
          />
          <RecordCard
            icon={<Zap size={28} color="#4A90D9" strokeWidth={1.8} />}
            label="메모"
            description="짧은 메모 기록"
            count={moments.length}
            href="/moments"
          />
          <RecordCard
            icon={<Lightbulb size={28} color="#4A90D9" strokeWidth={1.8} />}
            label="아이디어"
            description="떠오르는 생각들"
            count={ideas.length}
            href="/ideas"
          />
          <RecordCard
            icon={<Calendar size={28} color="#4A90D9" strokeWidth={1.8} />}
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
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {recentItems.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {item.type === 'diary' && <BookOpen size={18} color="#4A90D9" strokeWidth={1.8} />}
                      {item.type === 'moment' && <Zap size={18} color="#4A90D9" strokeWidth={1.8} />}
                      {item.type === 'idea' && <Lightbulb size={18} color="#4A90D9" strokeWidth={1.8} />}
                    </div>
                    <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{item.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Illustration section */}
        <div className="flex flex-row items-end pt-2">
          <div className="flex-1 pb-8">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 leading-snug">
              생각은 사라지지만,<br />
              <span className="font-bold text-gray-800 dark:text-gray-100">기록은 남습니다.</span>
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
