'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMoments } from '@/lib/useMoments';
import { Moment } from '@/lib/types';

const SAMPLES = [
  { daysAgo: 2, text: '오늘 하늘이 너무 예뻤다 ☁️' },
  { daysAgo: 1, text: '커피 한 잔의 여유 ☕' },
  { daysAgo: 0, text: '오늘 배운 것 하나 😊' },
];

function BoltIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

function MomentCard({ moment }: { moment: Moment }) {
  return (
    <Link
      href={`/moments/${moment.id}`}
      className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-black/[0.02] transition-colors -mx-1 px-1 rounded-xl"
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <BoltIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{moment.text}</p>
        <p className="text-xs text-gray-400 mt-0.5">{moment.date}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

export default function MomentsPage() {
  const { moments, add } = useMoments();
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? moments.filter(m => m.text.toLowerCase().includes(query.toLowerCase()))
    : moments;

  useEffect(() => {
    if (localStorage.getItem('moments_samples_initialized')) return;
    if (moments.length > 0) return;
    const today = new Date();
    SAMPLES.forEach(({ daysAgo, text }) => {
      const d = new Date(today.getTime() - daysAgo * 86400000);
      add({ text, date: d.toISOString().slice(0, 10) });
    });
    localStorage.setItem('moments_samples_initialized', '1');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-[430px] mx-auto px-5">

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
          <h1 className="text-3xl font-bold text-gray-800">지금 이 순간</h1>
          <p className="text-sm text-gray-400 mt-1">짧은 순간의 기억</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-sm mb-4">
          <SearchIcon />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="순간 검색"
            className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-400 text-base leading-none">×</button>
          )}
        </div>

        {/* New button */}
        <Link
          href="/moments/new"
          className="block w-full text-center bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors mb-6"
        >
          + 지금 이 순간 기록
        </Link>

        {/* List */}
        {moments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">아직 기록이 없어요</p>
            <p className="text-gray-300 text-xs mt-1">지금 이 순간을 기록해보세요</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">검색 결과가 없어요</p>
          </div>
        ) : (
          <div>
            {filtered.map((m) => (
              <MomentCard key={m.id} moment={m} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
