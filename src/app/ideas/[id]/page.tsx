'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useIdeas } from '@/lib/useIdeas';

export default function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useIdeas();
  const idea = getById(id);

  if (!idea) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="아이디어" backHref="/ideas" />
        <p className="text-center text-gray-400 text-sm py-16">아이디어를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleDelete = () => {
    if (confirm('이 아이디어를 삭제할까요?')) {
      remove(id);
      router.push('/ideas');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="아이디어" backHref="/ideas" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {idea.imageBase64 && (
          <img
            src={idea.imageBase64}
            alt=""
            className="w-full max-h-60 object-cover rounded-2xl"
          />
        )}
        <h2 className="text-lg font-semibold text-gray-800">{idea.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{idea.content}</p>
        <p className="text-xs text-gray-400">{new Date(idea.createdAt).toLocaleString('ko-KR')}</p>
        <div className="flex gap-2 pt-4">
          <Link
            href={`/ideas/${id}/edit`}
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
