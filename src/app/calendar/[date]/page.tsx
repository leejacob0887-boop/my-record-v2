'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

export default function CalendarDayPage() {
  const { date } = useParams<{ date: string }>();
  const { getByDate: getDiary } = useDiary();
  const { getByDate: getMoments } = useMoments();
  const { ideas } = useIdeas();

  const diary = getDiary(date);
  const moments = getMoments(date);
  const dayIdeas = ideas.filter((i) => i.createdAt.slice(0, 10) === date);

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const hasAny = diary || moments.length > 0 || dayIdeas.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title={displayDate} backHref="/calendar" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {!hasAny && (
          <div className="text-center py-16 space-y-3">
            <p className="text-gray-300 text-4xl">📭</p>
            <p className="text-gray-400 text-sm">이 날의 기록이 없습니다.</p>
            <Link
              href="/diary/new"
              className="inline-block text-sm text-blue-500 hover:text-blue-600 mt-2"
            >
              일기 쓰러 가기 →
            </Link>
          </div>
        )}

        {/* Diary */}
        {diary && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              📖 일기
            </h2>
            <Link href={`/diary/${diary.id}`} className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all">
              {diary.imageBase64 && (
                <img
                  src={diary.imageBase64}
                  alt=""
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
              )}
              <p className="text-sm font-semibold text-gray-800">{diary.title}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{diary.content}</p>
            </Link>
          </section>
        )}

        {/* Moments */}
        {moments.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              ⚡ 지금 이 순간 ({moments.length})
            </h2>
            <div className="space-y-2">
              {moments.map((m) => (
                <Link
                  key={m.id}
                  href={`/moments/${m.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  {m.imageBase64 && (
                    <img
                      src={m.imageBase64}
                      alt=""
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2">{m.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ideas */}
        {dayIdeas.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              💡 아이디어 ({dayIdeas.length})
            </h2>
            <div className="space-y-2">
              {dayIdeas.map((i) => (
                <Link
                  key={i.id}
                  href={`/ideas/${i.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-semibold text-gray-800">{i.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{i.content}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
