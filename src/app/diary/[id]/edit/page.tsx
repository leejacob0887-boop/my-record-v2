'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import DiaryForm from '@/components/DiaryForm';
import { useDiary } from '@/lib/useDiary';

export default function DiaryEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, save } = useDiary();
  const entry = getById(id);

  if (!entry) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="일기 수정" backHref="/diary" />
        <p className="text-center text-gray-400 text-sm py-16">일기를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleSubmit = (data: { date: string; title: string; content: string; imageBase64?: string }) => {
    save(data);
    router.push(`/diary/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="일기 수정" backHref={`/diary/${id}`} />
      <div className="max-w-md mx-auto px-4 py-6">
        <DiaryForm initial={entry} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
