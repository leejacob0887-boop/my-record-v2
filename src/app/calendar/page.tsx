'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

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
    <main className="min-h-screen bg-gray-50">
      <Header title="캘린더" backHref="/" />

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-lg"
            aria-label="이전 달"
          >
            ‹
          </button>
          <span className="text-base font-semibold text-gray-800">{monthLabel}</span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors text-lg"
            aria-label="다음 달"
          >
            ›
          </button>
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2.5 text-center text-xs font-medium ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7">
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
                  onClick={() => router.push(`/calendar/${dateStr}`)}
                  className={`aspect-square flex flex-col items-center justify-center gap-0.5 transition-colors rounded-xl m-0.5
                    ${isToday ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}
                    ${!isToday && col === 0 ? 'text-red-400' : ''}
                    ${!isToday && col === 6 ? 'text-blue-400' : ''}
                    ${!isToday && col > 0 && col < 6 ? 'text-gray-700' : ''}
                  `}
                >
                  <span className="text-sm font-medium leading-none">{day}</span>
                  {hasRecord && (
                    <span className={`w-1 h-1 rounded-full ${isToday ? 'bg-white/70' : 'bg-blue-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 px-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            기록 있음
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-5 h-5 rounded-xl bg-blue-500 inline-block" />
            오늘
          </div>
        </div>
      </div>
    </main>
  );
}
