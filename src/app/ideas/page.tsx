'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useIdeas } from '@/lib/useIdeas';
import { Idea } from '@/lib/types';

const SAMPLES = [
  { title: '앱 개선 아이디어 💡', content: '사용자가 더 편하게 쓸 수 있는 기능들을 생각해보자.' },
  { title: '오늘 떠오른 생각 ✨', content: '작은 아이디어도 기록해두면 나중에 큰 가치가 된다.' },
  { title: '버킷리스트 🎯',       content: '언젠가 꼭 해보고 싶은 것들을 적어보자.' },
];

function BulbIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
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

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-black/[0.02] transition-colors -mx-1 px-1 rounded-xl"
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <BulbIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{idea.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{idea.createdAt.slice(0, 10)}</p>
        {idea.content && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{idea.content}</p>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  );
}

export default function IdeasPage() {
  const { ideas, add } = useIdeas();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const filtered = q
    ? ideas.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
      )
    : ideas;

  useEffect(() => {
    if (localStorage.getItem('ideas_samples_initialized')) return;
    if (ideas.length > 0) return;
    SAMPLES.forEach(({ title, content }) => add({ title, content }));
    localStorage.setItem('ideas_samples_initialized', '1');
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
          <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">아이디어</h1>
          <p className="text-sm text-gray-400 mt-1">떠오르는 생각들</p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-sm mb-4">
          <SearchIcon />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="아이디어 검색"
            className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-400 text-base leading-none">×</button>
          )}
        </div>

        {/* New button */}
        <Link
          href="/ideas/new"
          className="block w-full text-center bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors mb-6"
        >
          + 새 아이디어
        </Link>

        {/* List */}
        {ideas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">아직 아이디어가 없어요</p>
            <p className="text-gray-300 text-xs mt-1">첫 번째 아이디어를 기록해보세요</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">검색 결과가 없어요</p>
          </div>
        ) : (
          <div>
            {filtered.map((idea) => (
              <IdeaCard key={idea.id || idea.createdAt} idea={idea} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
