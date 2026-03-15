'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useMoments } from '@/lib/useMoments';
import { Moment } from '@/lib/types';
import { formatDateTime } from '@/lib/dateUtils';

const SAMPLES = [
  { daysAgo: 2, text: '오늘 하늘이 너무 예뻤다 ☁️' },
  { daysAgo: 1, text: '커피 한 잔의 여유 ☕' },
  { daysAgo: 0, text: '오늘 배운 것 하나 😊' },
];

function SkeletonList() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900 rounded-2xl p-4 h-20" />
      ))}
    </div>
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

function MomentCard({
  moment,
  editMode,
  isSelected,
  onToggle,
}: {
  moment: Moment;
  editMode: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  const cardClass = `flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 transition-all active:scale-[0.98] ${isSelected ? 'ring-2 ring-orange-400' : ''}`;

  const body = (
    <>
      {editMode ? (
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-500'}`}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      ) : (
        <div className="w-11 h-11 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={20} color="#EA580C" strokeWidth={2} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">{moment.text}</p>
        <p className="text-sm text-orange-400 dark:text-orange-400 mt-0.5">{formatDateTime(moment.date, moment.createdAt)}</p>
      </div>
      {!editMode && <ChevronRight size={18} color="#FDC9A0" className="flex-shrink-0" />}
    </>
  );

  if (editMode) {
    return (
      <div onClick={() => moment.id && onToggle(moment.id)} className={`cursor-pointer ${cardClass}`}>
        {body}
      </div>
    );
  }

  return (
    <Link href={`/moments/${moment.id}`} className={cardClass}>
      {body}
    </Link>
  );
}

function extractTags(text: string): string[] {
  return (text.match(/#([^\s#]+)/g) ?? []).map(t => t.slice(1));
}

export default function MomentsPage() {
  const { moments, add, remove, isLoading } = useMoments();
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const q = query.trim().toLowerCase();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    moments.forEach(m => extractTags(m.text).forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [moments]);

  const filtered = useMemo(() => {
    let result = q ? moments.filter(m => m.text.toLowerCase().includes(q)) : moments;
    if (tagFilter) result = result.filter(m => extractTags(m.text).includes(tagFilter));
    return result;
  }, [moments, q, tagFilter]);

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

  const allSelected = filtered.length > 0 && filtered.every(m => m.id && selected.has(m.id));

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(m => m.id).filter((id): id is string => Boolean(id))));
    }
  };

  const exitEditMode = () => {
    setEditMode(false);
    setSelected(new Set());
  };

  const handleDeleteConfirm = () => {
    Array.from(selected).forEach(id => remove(id));
    setConfirmDelete(false);
    exitEditMode();
  };

  return (
    <main className="min-h-screen bg-[#F4F2EE] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-4 pb-8">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-6">
          <DarkModeToggle />
          <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* Title */}
        <div className="relative flex items-center justify-center mb-6">
          {editMode && (
            <button onClick={toggleSelectAll} className="absolute left-0 flex items-center gap-1.5 py-1 px-1">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${allSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-500'}`}>
                {allSelected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">전체 선택</span>
            </button>
          )}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Memo</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">짧은 순간의 기억</p>
          </div>
          {moments.length > 0 && (
            <div className="absolute right-0 flex items-center gap-1">
              {editMode && (
                <button
                  onClick={() => selected.size > 0 && setConfirmDelete(true)}
                  disabled={selected.size === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-xl disabled:opacity-30 transition-colors hover:bg-red-50 active:scale-[0.95]"
                  aria-label="선택 삭제"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              )}
              <button
                onClick={editMode ? exitEditMode : () => setEditMode(true)}
                className="text-sm font-medium text-orange-500 py-1 px-2"
              >
                {editMode ? '취소' : '편집'}
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        {!editMode && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm mb-4">
            <SearchIcon />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="메모 검색"
              className="flex-1 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-400 text-base leading-none">×</button>
            )}
          </div>
        )}

        {/* Tag filter */}
        {!editMode && allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setTagFilter(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === null ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
            >
              전체
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === tag ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* New button */}
        {!editMode && (
          <Link
            href="/moments/new"
            className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3.5 text-base font-semibold transition-colors mb-5"
          >
            + 메모 기록
          </Link>
        )}

        {/* List */}
        {isLoading ? (
          <SkeletonList />
        ) : moments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-base">아직 기록이 없어요</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">메모를 기록해보세요</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-base">검색 결과가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((m) => (
              <MomentCard
                key={m.id || m.createdAt}
                moment={m}
                editMode={editMode}
                isSelected={Boolean(m.id && selected.has(m.id))}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}

      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setConfirmDelete(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5">
                <p className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1.5">{selected.size}개 삭제</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">선택한 {selected.size}개의 메모를 삭제할까요?</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">삭제된 기록은 복구할 수 없어요.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-[1.5] py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
