'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, Lightbulb, CalendarDays } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import SavePreviewCard from '@/components/SavePreviewCard';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';
import { getTodayKST, toKSTDateString } from '@/lib/dateUtils';

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
  const { moments, add: addMoment } = useMoments();
  const { ideas } = useIdeas();

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [savedPreview, setSavedPreview] = useState<{ content: string; savedAt: string } | null>(null);

  const handleSummary = async () => {
    setSummaryLoading(true);
    setSummaryText(null);
    setSummaryError(null);
    try {
      const res = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          diary: diaryEntries.filter(e => e.date === today).map(e => ({ title: e.title, content: e.content })),
          moments: moments.filter(m => m.date === today).map(m => ({ text: m.text })),
          ideas: ideas.filter(i => toKSTDateString(i.createdAt) === today).map(i => ({ title: i.title, content: i.content })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummaryText(data.summary);
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : '요약 중 오류가 발생했어요.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summaryText) return;
    const savedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    await addMoment({ text: `✨ 오늘의 요약\n\n${summaryText}`, date: today });
    setSummaryText(null);
    setSummaryError(null);
    setSavedPreview({ content: summaryText, savedAt });
  };

  const closeSummary = () => { setSummaryText(null); setSummaryError(null); };

  // Build a Set of dates that have at least one record
  const activeDates = useMemo(() => {
    const set = new Set<string>();
    diaryEntries.forEach((e) => set.add(e.date));
    moments.forEach((m) => set.add(m.date));
    ideas.forEach((i) => set.add(toKSTDateString(i.createdAt)));
    return set;
  }, [diaryEntries, moments, ideas]);

  // Calendar grid calculation
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayKST();

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

        {/* Today's Summary */}
        {(() => {
          const diaryCount = diaryEntries.filter(e => e.date === today).length;
          const momentCount = moments.filter(m => m.date === today).length;
          const ideaCount = ideas.filter(i => toKSTDateString(i.createdAt) === today).length;
          const total = diaryCount + momentCount + ideaCount;

          return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">오늘의 기록</p>
                <p className="text-xs text-gray-300 dark:text-gray-600">
                  {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </p>
              </div>
              {total === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-1">
                  오늘 아직 기록이 없어요 🌱
                </p>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  {diaryCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2">
                      <span className="text-base leading-none">📖</span>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-none">{diaryCount}개</p>
                        <p className="text-[10px] text-amber-500/70 dark:text-amber-600 mt-0.5">일기</p>
                      </div>
                    </div>
                  )}
                  {momentCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
                      <span className="text-base leading-none">⚡</span>
                      <div>
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-none">{momentCount}개</p>
                        <p className="text-[10px] text-blue-500/70 dark:text-blue-600 mt-0.5">메모</p>
                      </div>
                    </div>
                  )}
                  {ideaCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-3 py-2">
                      <span className="text-base leading-none">💡</span>
                      <div>
                        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 leading-none">{ideaCount}개</p>
                        <p className="text-[10px] text-yellow-500/70 dark:text-yellow-600 mt-0.5">아이디어</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 요약하기 버튼 */}
              <button
                onClick={handleSummary}
                disabled={total === 0 || summaryLoading}
                className="mt-3 w-full py-3.5 rounded-2xl text-base font-semibold flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-violet-400 dark:border-violet-600 text-violet-600 dark:text-violet-400 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {summaryLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI가 오늘을 돌아보고 있어요...
                  </>
                ) : (
                  <>✨ 오늘 하루 요약하기</>
                )}
              </button>
            </div>
          );
        })()}

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
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} color="#7C3AED" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">일기 쓰기</p>
                    <p className="text-xs text-gray-400">하루를 기록해요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/moments/new?date=${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap size={18} color="#EA580C" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">메모 쓰기</p>
                    <p className="text-xs text-gray-400">짧은 메모를 남겨요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/ideas/new?date=${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={18} color="#16A34A" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">아이디어 쓰기</p>
                    <p className="text-xs text-gray-400">번뜩이는 생각을 기록해요</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push(`/calendar/${selectedDate}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={18} color="#2563EB" strokeWidth={2} />
                  </div>
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
      {/* 요약 모달 */}
      {(summaryText || summaryError) && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={closeSummary}
          />
          <div className="fixed bottom-20 left-0 right-0 z-[60] flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-[400px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-slide-up-toast">
              {/* 상단 보라 그라데이션 바 */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B5CF6, #A855F7)' }} />

              <div className="px-6 py-5">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-100">✨ 오늘의 요약</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} · AI가 당신의 하루를 읽었어요
                    </p>
                  </div>
                  <button
                    onClick={closeSummary}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-3"
                    aria-label="닫기"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-700 mb-4" />

                {/* 요약 텍스트 또는 에러 */}
                {summaryText && (
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {summaryText}
                  </p>
                )}
                {summaryError && (
                  <p className="text-sm text-red-500 dark:text-red-400">{summaryError}</p>
                )}

                {/* 버튼 행 */}
                {summaryText && (
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={closeSummary}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      닫기
                    </button>
                    <button
                      onClick={handleSaveSummary}
                      className="flex-[1.5] py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #8B5CF6, #A855F7)' }}
                    >
                      메모로 저장 ✨
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 저장 완료 피드백 */}
      {savedPreview && (
        <SavePreviewCard
          type="moment"
          content={savedPreview.content}
          savedAt={savedPreview.savedAt}
          onDismiss={() => setSavedPreview(null)}
        />
      )}
    </main>
  );
}
