'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
  </svg>
);

export default function CalendarDayPage() {
  const { date } = useParams<{ date: string }>();
  const router = useRouter();
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
    <main className="min-h-screen bg-[#FAF8F4]">
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
          <span className="text-base font-semibold text-gray-800">{displayDate}</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <SettingsIcon />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 pb-8">
          {!hasAny && (
            <div className="text-center py-16 space-y-3">
              <p className="text-gray-300 text-4xl">📭</p>
              <p className="text-gray-400 text-sm">이 날의 기록이 없습니다.</p>
              <Link
                href="/diary/new"
                className="inline-block text-sm text-[#4A90D9] hover:opacity-70 transition-opacity mt-2"
              >
                일기 쓰러 가기 →
              </Link>
            </div>
          )}

          {/* Diary */}
          {diary && (
            <section>
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <BookIcon />
                <h2 className="text-xs font-semibold text-[#4A90D9]">일기</h2>
              </div>
              <Link
                href={`/diary/${diary.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
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
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <BoltIcon />
                <h2 className="text-xs font-semibold text-[#4A90D9]">메모 ({moments.length})</h2>
              </div>
              <div className="space-y-2">
                {moments.map((m) => (
                  <Link
                    key={m.id}
                    href={`/moments/${m.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
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
              <div className="flex items-center gap-1.5 mb-2 px-1">
                <BulbIcon />
                <h2 className="text-xs font-semibold text-[#4A90D9]">아이디어 ({dayIdeas.length})</h2>
              </div>
              <div className="space-y-2">
                {dayIdeas.map((i) => (
                  <Link
                    key={i.id}
                    href={`/ideas/${i.id}`}
                    className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-semibold text-gray-800">{i.title}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{i.content}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

      </div>
    </main>
  );
}
