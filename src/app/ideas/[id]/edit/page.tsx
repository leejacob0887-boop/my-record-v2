'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import IdeaForm from '@/components/IdeaForm';
import { useIdeas } from '@/lib/useIdeas';

export default function IdeaEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = useIdeas();
  const idea = getById(id);

  if (!idea) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header title="아이디어 수정" backHref="/ideas" />
        <p className="text-center text-gray-400 text-sm py-16">아이디어를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const handleSubmit = (data: { title: string; content: string; imageBase64?: string }) => {
    update(id, data);
    router.push(`/ideas/${id}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header title="아이디어 수정" backHref={`/ideas/${id}`} />
      <div className="max-w-md mx-auto px-4 py-6">
        <IdeaForm initial={idea} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
