'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMoments } from '@/lib/useMoments';

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default function MomentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useMoments();
  const moment = getById(id);

  if (!moment) {
    return (
      <main className="min-h-screen bg-[#FAF8F4]">
        <div className="max-w-[430px] mx-auto px-5 pt-12">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-center text-gray-400 text-sm py-16">기록을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const handleDelete = () => {
    if (confirm('이 기록을 삭제할까요?')) {
      remove(id);
      router.push('/moments');
    }
  };

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
          <span className="text-base font-semibold text-gray-800">지금 이 순간</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <SettingsIcon />
          </button>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          {moment.imageBase64 && (
            <img
              src={moment.imageBase64}
              alt=""
              className="w-full max-h-60 object-cover rounded-xl mb-4"
            />
          )}
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-7">{moment.text}</p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-block text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
              📅 {moment.date}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            href={`/moments/${id}/edit`}
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
