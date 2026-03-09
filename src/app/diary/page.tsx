'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useDiary } from '@/lib/useDiary';
import { DiaryEntry } from '@/lib/types';

const SAMPLES = [
  {
    daysAgo: 2,
    title: '나의 기록을 시작합니다',
    content: '오늘부터 하루하루를 기록해보려 한다. 작은 것도 기록하다 보면 소중한 추억이 된다.',
  },
  {
    daysAgo: 1,
    title: '오늘 배운 것',
    content: '새로운 것을 배우면 여기에 기록해보자. 배움은 쌓일수록 빛난다.',
  },
  {
    daysAgo: 0,
    title: '감사한 일 3가지',
    content: '오늘 감사했던 순간들을 적어보자. 감사함을 찾다 보면 하루가 더 풍요로워진다.',
  },
];

function BookIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function DiaryCard({ entry }: { entry: DiaryEntry }) {
  return (
    <Link
      href={`/diary/${entry.id}`}
      className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-black/[0.02] transition-colors -mx-1 px-1 rounded-xl"
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <BookIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{entry.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{entry.date}</p>
        {entry.content && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.content}</p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

export default function DiaryPage() {
  const { entries, save } = useDiary();

  useEffect(() => {
    if (localStorage.getItem('diary_samples_initialized')) return;
    if (entries.length > 0) return;
    const today = new Date();
    SAMPLES.forEach(({ daysAgo, title, content }) => {
      const d = new Date(today.getTime() - daysAgo * 86400000);
      save({ date: d.toISOString().slice(0, 10), title, content });
    });
    localStorage.setItem('diary_samples_initialized', '1');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-md mx-auto px-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="메뉴">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">일기</h1>
          <p className="text-sm text-gray-400 mt-1">하루 하나씩 깊은 기록</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-sm mb-4">
          <SearchIcon />
          <span className="text-sm text-gray-400">일기 검색</span>
        </div>

        {/* New diary button */}
        <Link
          href="/diary/new"
          className="block w-full text-center bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors mb-6"
        >
          + 새 일기 쓰기
        </Link>

        {/* Diary list */}
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">아직 일기가 없어요</p>
            <p className="text-gray-300 text-xs mt-1">첫 번째 일기를 써보세요</p>
          </div>
        ) : (
          <div>
            {entries.map((entry) => (
              <DiaryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
