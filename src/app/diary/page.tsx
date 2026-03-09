'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import RecordItem from '@/components/RecordItem';
import { useDiary } from '@/lib/useDiary';

export default function DiaryPage() {
  const { entries } = useDiary();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="일기" backHref="/" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Link
          href="/diary/new"
          className="block text-center bg-blue-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          + 새 일기 쓰기
        </Link>
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">아직 일기가 없습니다.</p>
        ) : (
          entries.map((e) => (
            <RecordItem
              key={e.id}
              id={e.id}
              title={e.title}
              date={e.date}
              imageBase64={e.imageBase64}
              href={`/diary/${e.id}`}
            />
          ))
        )}
      </div>
    </main>
  );
}
