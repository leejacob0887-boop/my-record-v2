'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiary } from '@/lib/useDiary';

function formatDateTime(date: string, createdAt: string): string {
  const d = new Date(createdAt);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useDiary();
  const entry = getById(id);
  const [entryTags, setEntryTags] = useState<string[]>([]);

  useEffect(() => {
    if (!entry) return;
    try {
      const stored = localStorage.getItem('diary_tags_' + entry.date);
      if (stored) setEntryTags(JSON.parse(stored));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.date]);

  if (!entry) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex flex-col w-full">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <p className="text-center text-gray-400 text-sm py-16">일기를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleDelete = async () => {
    if (confirm('이 일기를 삭제할까요?')) {
      await remove(id);
      router.push('/diary');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex flex-col w-full">

      {/* Header */}
      <div className="max-w-[430px] mx-auto w-full flex items-center justify-between px-4 pt-12 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          aria-label="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm text-gray-600">{formatDateTime(entry.date, entry.createdAt)}</span>
        </button>
        <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </Link>
      </div>

      {/* Content card */}
      <div className="flex-1 max-w-[430px] mx-auto w-full px-4 pb-28">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          {/* Image */}
          {entry.imageBase64 && (
            <img
              src={entry.imageBase64}
              alt=""
              className="w-full max-h-60 object-cover rounded-xl mb-4"
            />
          )}

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-800 mb-2">{entry.title}</h1>

          {/* Date badge */}
          <span className="inline-block text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 mb-4">
            📅 {formatDateTime(entry.date, entry.createdAt)}
          </span>

          {/* Tag chips */}
          {entryTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {entryTags.map(tag => (
                <span key={tag} className="text-xs text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 mb-4" />

          {/* Content */}
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-7">{entry.content}</p>
        </div>
      </div>

      {/* Action buttons - fixed bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-[#FAF8F4] border-t border-gray-100 px-4 py-3">
        <div className="max-w-[430px] mx-auto flex gap-3">
          <Link
            href={`/diary/${id}/edit`}
            className="flex-1 text-center bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 text-center bg-red-50 border border-red-100 text-red-400 rounded-2xl py-3.5 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

    </main>
  );
}
