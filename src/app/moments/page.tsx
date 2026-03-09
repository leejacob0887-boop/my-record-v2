'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import RecordItem from '@/components/RecordItem';
import { useMoments } from '@/lib/useMoments';

export default function MomentsPage() {
  const { moments } = useMoments();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="지금 이 순간" backHref="/" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-3">
        <Link
          href="/moments/new"
          className="block text-center bg-amber-400 text-white rounded-xl py-3 text-sm font-medium hover:bg-amber-500 transition-colors"
        >
          + 지금 이 순간 기록
        </Link>
        {moments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">아직 기록이 없습니다.</p>
        ) : (
          moments.map((m) => (
            <RecordItem
              key={m.id}
              id={m.id}
              title={m.text}
              date={m.date}
              imageBase64={m.imageBase64}
              href={`/moments/${m.id}`}
            />
          ))
        )}
      </div>
    </main>
  );
}
