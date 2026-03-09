'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useMoments } from '@/lib/useMoments';

export default function MomentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useMoments();
  const moment = getById(id);

  if (!moment) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="순간 기록" backHref="/moments" />
        <p className="text-center text-gray-400 text-sm py-16">기록을 찾을 수 없습니다.</p>
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
    <main className="min-h-screen bg-gray-50">
      <Header title={moment.date} backHref="/moments" />
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {moment.imageBase64 && (
          <img
            src={moment.imageBase64}
            alt=""
            className="w-full max-h-60 object-cover rounded-2xl"
          />
        )}
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{moment.text}</p>
        <p className="text-xs text-gray-400">{new Date(moment.createdAt).toLocaleString('ko-KR')}</p>
        <div className="flex gap-2 pt-4">
          <Link
            href={`/moments/${id}/edit`}
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
