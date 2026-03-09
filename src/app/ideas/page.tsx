'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import RecordItem from '@/components/RecordItem';
import { useIdeas } from '@/lib/useIdeas';

export default function IdeasPage() {
  const { ideas } = useIdeas();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="아이디어" backHref="/" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Link
          href="/ideas/new"
          className="block text-center bg-purple-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-purple-600 transition-colors"
        >
          + 새 아이디어
        </Link>
        {ideas.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">아직 아이디어가 없습니다.</p>
        ) : (
          ideas.map((i) => (
            <RecordItem
              key={i.id}
              id={i.id}
              title={i.title}
              date={i.createdAt.slice(0, 10)}
              imageBase64={i.imageBase64}
              href={`/ideas/${i.id}`}
            />
          ))
        )}
      </div>
    </main>
  );
}
