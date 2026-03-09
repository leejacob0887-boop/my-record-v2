'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useDiary } from '@/lib/useDiary';

export default function DiaryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useDiary();
  const entry = getById(id);

  if (!entry) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="일기" backHref="/diary" />
        <p className="text-center text-gray-400 text-sm py-16">일기를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleDelete = () => {
    if (confirm('이 일기를 삭제할까요?')) {
      remove(id);
      router.push('/diary');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title={entry.date} backHref="/diary" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {entry.imageBase64 && (
          <img
            src={entry.imageBase64}
            alt=""
            className="w-full max-h-60 object-cover rounded-2xl"
          />
        )}
        <h2 className="text-lg font-semibold text-gray-800">{entry.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
        <div className="flex gap-2 pt-4">
          <Link
            href={`/diary/${id}/edit`}
            className="flex-1 text-center border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="flex-1 text-center border border-red-100 text-red-400 rounded-xl py-2.5 text-sm hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </main>
  );
}
