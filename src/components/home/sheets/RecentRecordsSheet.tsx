'use client';

import Link from 'next/link';
import { BookOpen, Zap, Lightbulb, ChevronRight, X, Archive } from 'lucide-react';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';
import { useMemo } from 'react';

interface Props {
  onClose: () => void;
}

type RecordType = 'diary' | 'moment' | 'idea';
interface RecentItem {
  type: RecordType;
  label: string;
  date: string;
  createdAt: string;
  href: string;
}

export default function RecentRecordsSheet({ onClose }: Props) {
  const { entries } = useDiary();
  const { moments } = useMoments();
  const { ideas } = useIdeas();

  const recentItems = useMemo<RecentItem[]>(() => {
    const all: RecentItem[] = [
      ...entries.map((e) => ({
        type: 'diary' as const,
        label: e.title,
        date: e.date ?? '',
        createdAt: e.createdAt ?? '',
        href: `/diary/${e.id}`,
      })),
      ...moments.map((m) => ({
        type: 'moment' as const,
        label: m.text || '사진',
        date: m.date ?? '',
        createdAt: m.createdAt ?? '',
        href: `/moments/${m.id}`,
      })),
      ...ideas.map((i) => ({
        type: 'idea' as const,
        label: i.title,
        date: i.date ?? '',
        createdAt: i.createdAt ?? '',
        href: `/ideas/${i.id}`,
      })),
    ];
    return all
      .sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || ''))
      .slice(0, 10);
  }, [entries, moments, ideas]);

  const typeLabel = (type: RecordType) =>
    type === 'diary' ? '일기' : type === 'moment' ? '메모' : '아이디어';

  const typeIcon = (type: RecordType) => {
    if (type === 'diary') return <BookOpen size={16} color="#7C3AED" strokeWidth={1.8} />;
    if (type === 'moment') return <Zap size={16} color="#EA580C" strokeWidth={1.8} />;
    return <Lightbulb size={16} color="#16A34A" strokeWidth={1.8} />;
  };

  const typeBg = (type: RecordType) =>
    type === 'diary' ? 'bg-[#EDE9FF]' : type === 'moment' ? 'bg-[#FFF0E0]' : 'bg-[#E8F8EE]';

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <span className="text-base font-bold text-gray-800 dark:text-gray-100">최근 기록</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="닫기"
        >
          <X size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-8">
        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Archive size={32} color="#D1D5DB" />
            <p className="text-sm text-gray-400">아직 기록이 없어요</p>
          </div>
        ) : (
          recentItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg(item.type)}`}>
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {item.label || '(내용 없음)'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {typeLabel(item.type)} · {item.date}
                </p>
              </div>
              <ChevronRight size={16} color="#D1D5DB" />
            </Link>
          ))
        )}
      </div>
    </>
  );
}
