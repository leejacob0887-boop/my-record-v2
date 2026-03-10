'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIdeas } from '@/lib/useIdeas';

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

function formatDateTime(date: string, createdAt: string): string {
  const d = new Date(createdAt);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useIdeas();
  const idea = getById(id);

  if (!idea) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
        <div className="max-w-[430px] mx-auto px-5 pt-12">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-center text-gray-400 text-sm py-16">아이디어를 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const handleDelete = async () => {
    if (confirm('이 아이디어를 삭제할까요?')) {
      await remove(id);
      router.push('/ideas');
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="뒤로가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">아이디어</span>
          <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <SettingsIcon />
          </Link>
        </div>

        {/* Content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4">
          {idea.imageBase64 && (
            <img
              src={idea.imageBase64}
              alt=""
              className="w-full max-h-60 object-cover rounded-xl mb-4"
            />
          )}
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{idea.title}</h1>
          <span className="inline-block text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 mb-4">
            📅 {formatDateTime(idea.date ?? idea.createdAt.slice(0, 10), idea.createdAt)}
          </span>
          <div className="border-t border-gray-100 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-7">{idea.content}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            href={`/ideas/${id}/edit`}
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
