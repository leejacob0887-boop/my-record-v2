'use client';

import RecordTypeCard from '@/components/RecordTypeCard';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';

export default function Home() {
  const { entries } = useDiary();
  const { moments } = useMoments();
  const { ideas } = useIdeas();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">나의 기록</h1>
        <p className="text-sm text-gray-400 mb-8">오늘의 생각과 순간을 기록해보세요.</p>

        <div className="grid grid-cols-2 gap-3">
          <RecordTypeCard
            type="diary"
            label="일기"
            icon="📖"
            count={entries.length}
            href="/diary"
            description="하루 하나씩 깊은 기록"
          />
          <RecordTypeCard
            type="moment"
            label="지금 이 순간"
            icon="⚡"
            count={moments.length}
            href="/moments"
            description="짧은 순간의 기억"
          />
          <RecordTypeCard
            type="idea"
            label="아이디어"
            icon="💡"
            count={ideas.length}
            href="/ideas"
            description="떠오르는 생각들"
          />
        </div>
      </div>
    </main>
  );
}
