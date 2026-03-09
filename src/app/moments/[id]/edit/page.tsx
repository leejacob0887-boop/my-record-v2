'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MomentForm from '@/components/MomentForm';
import { useMoments } from '@/lib/useMoments';

export default function MomentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = useMoments();
  const moment = getById(id);

  if (!moment) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="순간 수정" backHref="/moments" />
        <p className="text-center text-gray-400 text-sm py-16">기록을 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleSubmit = (data: { text: string; imageBase64?: string }) => {
    update(id, data);
    router.push(`/moments/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="순간 수정" backHref={`/moments/${id}`} />
      <div className="max-w-md mx-auto px-4 py-6">
        <MomentForm initial={moment} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
