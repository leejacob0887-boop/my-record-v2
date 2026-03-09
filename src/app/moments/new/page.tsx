'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MomentForm from '@/components/MomentForm';
import { useMoments } from '@/lib/useMoments';

export default function MomentNewPage() {
  const router = useRouter();
  const { add } = useMoments();

  const handleSubmit = (data: { text: string; imageBase64?: string }) => {
    const today = new Date().toISOString().slice(0, 10);
    add({ ...data, date: today });
    router.push('/moments');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="지금 이 순간" backHref="/moments" />
      <div className="max-w-md mx-auto px-4 py-6">
        <MomentForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
