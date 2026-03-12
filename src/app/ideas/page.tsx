'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useIdeas } from '@/lib/useIdeas';
import { Idea } from '@/lib/types';

const SAMPLES = [
  { title: '앱 개선 아이디어 💡', content: '사용자가 더 편하게 쓸 수 있는 기능들을 생각해보자.' },
  { title: '오늘 떠오른 생각 ✨', content: '작은 아이디어도 기록해두면 나중에 큰 가치가 된다.' },
  { title: '버킷리스트 🎯',       content: '언젠가 꼭 해보고 싶은 것들을 적어보자.' },
];

function formatDateTime(date: string, createdAt: string): string {
  const d = new Date(createdAt);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

function SkeletonList() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 bg-gray-200 rounded-full w-2/3 mb-2" />
            <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
          </div>
        </div>
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

function IdeaCard({
  idea,
  editMode,
  isSelected,
  onToggle,
}: {
  idea: Idea;
  editMode: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
}) {
  const body = (
    <>
      {editMode ? (
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#4A90D9] border-[#4A90D9]' : 'border-gray-300 dark:border-gray-600'}`}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Lightbulb size={36} color="#4A90D9" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{idea.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(idea.date ?? idea.createdAt.slice(0, 10), idea.createdAt)}</p>
        {idea.content && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{idea.content}</p>
        )}
      </div>
      {!editMode && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </>
  );

  if (editMode) {
    return (
      <div
        onClick={() => idea.id && onToggle(idea.id)}
        className={`flex items-center gap-3 py-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer -mx-1 px-1 rounded-xl transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'active:bg-black/[0.02]'}`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="flex items-center gap-3 py-4 border-b border-gray-100 hover:bg-black/[0.02] transition-colors -mx-1 px-1 rounded-xl"
    >
      {body}
    </Link>
  );
}

function extractTags(text: string): string[] {
  return (text.match(/#([^\s#]+)/g) ?? []).map(t => t.slice(1));
}

export default function IdeasPage() {
  const { ideas, add, remove, isLoading } = useIdeas();
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<'selected' | 'all' | null>(null);

  const q = query.trim().toLowerCase();

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach(i => extractTags(i.content).forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [ideas]);

  const filtered = useMemo(() => {
    let result = q
      ? ideas.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)
        )
      : ideas;
    if (tagFilter) result = result.filter(i => extractTags(i.content).includes(tagFilter));
    return result;
  }, [ideas, q, tagFilter]);

  useEffect(() => {
    if (localStorage.getItem('ideas_samples_initialized')) return;
    if (ideas.length > 0) return;
    SAMPLES.forEach(({ title, content }) => add({ title, content }));
    localStorage.setItem('ideas_samples_initialized', '1');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitEditMode = () => {
    setEditMode(false);
    setSelected(new Set());
  };

  const handleDeleteConfirm = () => {
    const idsToDelete = deleteTarget === 'all'
      ? filtered.map(i => i.id).filter((id): id is string => Boolean(id))
      : Array.from(selected);
    idsToDelete.forEach(id => remove(id));
    setDeleteTarget(null);
    exitEditMode();
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className={`max-w-[430px] mx-auto px-4 ${editMode ? 'pb-28' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">아이디어</h1>
            <p className="text-sm text-gray-400 mt-1">떠오르는 생각들</p>
          </div>
          {ideas.length > 0 && (
            <button
              onClick={editMode ? exitEditMode : () => setEditMode(true)}
              className="absolute right-0 text-sm font-medium text-[#4A90D9] py-1 px-2"
            >
              {editMode ? '취소' : '편집'}
            </button>
          )}
        </div>

        {/* Search bar */}
        {!editMode && (
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
        )}

        {/* Tag filter */}
        {!editMode && allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setTagFilter(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === null ? 'bg-[#4A90D9] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              전체
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tagFilter === tag ? 'bg-[#4A90D9] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* New button */}
        {!editMode && (
          <Link
            href="/ideas/new"
            className="block w-full text-center bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors mb-6"
          >
            + 새 아이디어
          </Link>
        )}

        {/* List */}
        {isLoading ? (
          <SkeletonList />
        ) : ideas.length === 0 ? (
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
              <IdeaCard
                key={idea.id || idea.createdAt}
                idea={idea}
                editMode={editMode}
                isSelected={Boolean(idea.id && selected.has(idea.id))}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}

      </div>

      {/* Edit mode bottom bar */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 flex gap-3 z-40">
          <button
            onClick={() => selected.size > 0 && setDeleteTarget('selected')}
            disabled={selected.size === 0}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-red-500 border border-red-200 dark:border-red-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98]"
          >
            선택 삭제{selected.size > 0 ? ` (${selected.size})` : ''}
          </button>
          <button
            onClick={() => filtered.length > 0 && setDeleteTarget('all')}
            disabled={filtered.length === 0}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
          >
            전체 삭제
          </button>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setDeleteTarget(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-[360px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5">
                <p className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1.5">
                  {deleteTarget === 'all' ? '전체 삭제' : `${selected.size}개 삭제`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {deleteTarget === 'all'
                    ? `${filtered.length}개의 아이디어를 모두 삭제할까요?`
                    : `선택한 ${selected.size}개의 아이디어를 삭제할까요?`}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">삭제된 기록은 복구할 수 없어요.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
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
