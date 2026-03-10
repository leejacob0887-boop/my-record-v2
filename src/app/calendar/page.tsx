'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, Lightbulb, CalendarDays } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { entries: diaryEntries } = useDiary();
  const { moments } = useMoments();
  const { ideas } = useIdeas();

  // Build a Set of dates that have at least one record
  const activeDates = useMemo(() => {
    const set = new Set<string>();
    diaryEntries.forEach((e) => set.add(e.date));
    moments.forEach((m) => set.add(m.date));
    ideas.forEach((i) => set.add(i.createdAt.slice(0, 10)));
    return set;
  }, [diaryEntries, moments, ideas]);

  // Calendar grid calculation
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.toISOString().slice(0, 10);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const monthLabel = new Date(year, month).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  });

  // Build grid cells: nulls for leading empty cells, then day numbers
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <DarkModeToggle />
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">캘린더</span>
          <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 transition-colors"
              aria-label="이전 달"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-base font-bold text-gray-800 dark:text-gray-100">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 transition-colors"
              aria-label="다음 달"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <button
            onClick={goToToday}
            className="flex items-center gap-0.5 text-xs text-[#4A90D9] font-medium hover:opacity-70 transition-opacity"
          >
            오늘로 이동
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Calendar card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-gray-50 dark:border-gray-700">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`py-3 text-center text-xs font-medium ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 p-2">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateStr = toDateStr(year, month, day);
              const isToday = dateStr === today;
              const hasRecord = activeDates.has(dateStr);
              const col = idx % 7;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center gap-0.5 transition-colors rounded-xl
                    ${isToday ? 'bg-[#4A90D9] text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                    ${!isToday && col === 0 ? 'text-red-400' : ''}
                    ${!isToday && col === 6 ? 'text-blue-400' : ''}
                    ${!isToday && col > 0 && col < 6 ? 'text-gray-700 dark:text-gray-200' : ''}
                  `}
                >
                  <span className="text-sm font-medium leading-none">{day}</span>
                  {hasRecord && (
                    <span className={`w-1 h-1 rounded-full ${isToday ? 'bg-white/70' : 'bg-[#4A90D9]'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-[#4A90D9] inline-block" />
            기록 있음
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-5 h-5 rounded-xl border-2 border-[#4A90D9] inline-block" />
            오늘
          </div>
        </div>

      </div>

      {/* Bottom sheet overlay */}
      {selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedDate(null)}
          />
          <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center px-4">
            <div className="w-full max-w-[430px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-50 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">어떤 기록을 남길까요?</p>
              </div>
              <div className="p-3 space-y-1">
                <button
                  onClick={() => router.push(`/diary/new?date=${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <BookOpen size={20} color="#4A90D9" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">일기 쓰기</p>
                    <p className="text-xs text-gray-400">하루를 기록해요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/moments/new?date=${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Zap size={20} color="#4A90D9" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">메모 쓰기</p>
                    <p className="text-xs text-gray-400">짧은 메모를 남겨요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/ideas/new?date=${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Lightbulb size={20} color="#4A90D9" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">아이디어 쓰기</p>
                    <p className="text-xs text-gray-400">번뜩이는 생각을 기록해요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/calendar/${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <CalendarDays size={20} color="#9CA3AF" strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">날짜 기록 보기</p>
                    <p className="text-xs text-gray-400">이 날의 기록을 확인해요</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
