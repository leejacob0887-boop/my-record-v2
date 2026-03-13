'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, Zap, Lightbulb, Calendar, ChevronRight, ChevronDown, Bot } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

interface RecordCardProps {
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  label: string;
  description: string;
  count: number;
  href: string;
}

function RecordCard({ icon, iconBg, cardBg, label, description, count, href }: RecordCardProps) {
  return (
    <Link
      href={href}
      className={`${cardBg} rounded-2xl p-5 active:scale-95 transition-all flex flex-col gap-3 min-h-[130px]`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">{count}</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}

type RecentItem = { type: 'diary' | 'moment' | 'idea'; label: string; date: string; href: string };

export default function Home() {
  const { resolvedTheme } = useTheme();
  const { entries } = useDiary();
  const { moments } = useMoments();
  const { ideas } = useIdeas();

  const [recentOpen, setRecentOpen] = useState(false);

  const recentItems = useMemo<RecentItem[]>(() => {
    const all: RecentItem[] = [
      ...entries.map(e => ({ type: 'diary' as const, label: e.title, date: e.date ?? '', href: `/diary/${e.id}` })),
      ...moments.map(m => ({ type: 'moment' as const, label: m.text, date: m.date ?? m.createdAt?.slice(0, 10) ?? '', href: `/moments/${m.id}` })),
      ...ideas.map(i => ({ type: 'idea' as const, label: i.title, date: i.createdAt?.slice(0, 10) ?? '', href: `/ideas/${i.id}` })),
    ];
    return all.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
  }, [entries, moments, ideas]);

  return (
    <main className="min-h-screen bg-[#F4F2EE] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-4 pb-8">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-6">
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

        {/* Title section */}
        <div className="text-center mb-7">
<h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Dancing Script', cursive" }}>My Story</h1>
        </div>

        {/* AI Chat banner */}
        <Link
          href="/chat"
          className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-600 rounded-2xl px-5 py-4 mb-5 active:scale-95 transition-all"
        >
          <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot size={22} color="white" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">AI와 대화하며 기록해보세요</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">무슨 생각이든 알아서 정리해드려요</p>
          </div>
          <ChevronRight size={18} color="#6366F1" />
        </Link>

        {/* Record cards grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <RecordCard
            icon={<BookOpen size={22} color="#7C3AED" strokeWidth={2} />}
            iconBg="bg-[#C4B5FD] dark:bg-purple-900/60"
            cardBg="bg-white dark:bg-gray-800 border border-violet-300 dark:border-violet-800"
            label="일기"
            description="하루 하나씩"
            count={entries.length}
            href="/diary"
          />
          <RecordCard
            icon={<Zap size={22} color="#EA580C" strokeWidth={2} />}
            iconBg="bg-[#FDC9A0] dark:bg-orange-900/60"
            cardBg="bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-800"
            label="메모"
            description="짧은 메모 기록"
            count={moments.length}
            href="/moments"
          />
          <RecordCard
            icon={<Lightbulb size={22} color="#16A34A" strokeWidth={2} />}
            iconBg="bg-[#86EFAC] dark:bg-green-900/60"
            cardBg="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-800"
            label="아이디어"
            description="떠오르는 생각들"
            count={ideas.length}
            href="/ideas"
          />
          <RecordCard
            icon={<Calendar size={22} color="#2563EB" strokeWidth={2} />}
            iconBg="bg-[#93C5FD] dark:bg-blue-900/60"
            cardBg="bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-800"
            label="캘린더"
            description="날짜별로 돌아보기"
            count={0}
            href="/calendar"
          />
        </div>

        {/* Recent records — illustration placeholder + 전체보기 버튼 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-violet-300 dark:border-violet-700">
          <div className="flex flex-row items-center px-6 py-5 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-400 dark:text-gray-500">생각은 사라지지만,</p>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-0.5">기록은 남습니다.</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolvedTheme === 'dark' ? '/chatbot-dark.gif' : '/chatbot.gif'} alt="챗봇 일러스트" className="w-36 h-36 object-contain flex-shrink-0" />
          </div>
          <button
            onClick={() => setRecentOpen(true)}
            className="w-full border-t border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span className="text-base font-bold text-gray-800 dark:text-gray-100">최근 기록</span>
            <ChevronDown size={18} color="#9CA3AF" className="rotate-180" />
          </button>
        </div>

        {/* Bottom sheet */}
        {recentOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setRecentOpen(false)}
            />
            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-600" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">최근 기록</span>
                <button
                  onClick={() => setRecentOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                  aria-label="닫기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-500 dark:text-gray-400">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* List */}
              <div className="overflow-y-auto max-h-[60vh] pb-8">
                {recentItems.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-12">아직 기록이 없어요</p>
                ) : (
                  recentItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setRecentOpen(false)}
                      className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.type === 'diary' ? 'bg-[#EDE9FF]' :
                        item.type === 'moment' ? 'bg-[#FFF0E0]' : 'bg-[#E8F8EE]'
                      }`}>
                        {item.type === 'diary' && <BookOpen size={17} color="#7C3AED" strokeWidth={1.8} />}
                        {item.type === 'moment' && <Zap size={17} color="#EA580C" strokeWidth={1.8} />}
                        {item.type === 'idea' && <Lightbulb size={17} color="#16A34A" strokeWidth={1.8} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {item.type === 'diary' ? '일기' : item.type === 'moment' ? '메모' : '아이디어'} · {item.date}
                        </p>
                      </div>
                      <ChevronRight size={16} color="#D1D5DB" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}
