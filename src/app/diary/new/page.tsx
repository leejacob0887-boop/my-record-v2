'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import DiaryForm from '@/components/DiaryForm';
import { useDiary } from '@/lib/useDiary';

export default function DiaryNewPage() {
  const router = useRouter();
  const { save, getByDate } = useDiary();

  const handleSubmit = (data: { date: string; title: string; content: string; imageBase64?: string }) => {
    const existing = getByDate(data.date);
    if (existing) {
      const ok = confirm(`${data.date}에 이미 일기가 있습니다. 덮어쓸까요?`);
      if (!ok) return;
    }
    save(data);
    router.push('/diary');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="새 일기" backHref="/diary" />
      <div className="max-w-md mx-auto px-4 py-6">
        <DiaryForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
