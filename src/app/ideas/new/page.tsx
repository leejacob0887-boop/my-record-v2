'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import IdeaForm from '@/components/IdeaForm';
import { useIdeas } from '@/lib/useIdeas';

export default function IdeaNewPage() {
  const router = useRouter();
  const { add } = useIdeas();

  const handleSubmit = (data: { title: string; content: string; imageBase64?: string }) => {
    add(data);
    router.push('/ideas');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="새 아이디어" backHref="/ideas" />
      <div className="max-w-md mx-auto px-4 py-6">
        <IdeaForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
