'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useMoments } from '@/lib/useMoments';
import { shareCard } from '@/lib/shareCard';
import { useLinkPreview } from '@/lib/useLinkPreview';

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

import { formatDateTime } from '@/lib/dateUtils';
import LinkPreviewCard from '@/components/LinkPreviewCard';

const URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  const urls = text.match(URL_REGEX) ?? [];
  return parts.flatMap((part, i) => {
    const nodes: React.ReactNode[] = [part];
    if (urls[i]) {
      nodes.push(
        <a
          key={i}
          href={urls[i]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline break-all"
        >
          {urls[i]}
        </a>
      );
    }
    return nodes;
  });
}

export default function MomentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { getById, remove } = useMoments();
  const moment = getById(id);
  const [sharing, setSharing] = useState(false);

  // 저장된 linkPreview가 없는 경우 텍스트에서 URL 감지해 실시간 프리뷰 fetch
  const textForPreview = moment?.linkPreview ? '' : (moment?.text ?? '');
  const { preview: fetchedPreview, loading: previewLoading } = useLinkPreview(textForPreview);
  const displayPreview = moment?.linkPreview ?? fetchedPreview;

  if (!moment) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
        <div className="max-w-[430px] mx-auto px-4 pt-12">
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

  const handleDelete = async () => {
    if (confirm('이 기록을 삭제할까요?')) {
      await remove(id);
      router.push('/moments');
    }
  };

  const handleShare = async () => {
    if (!moment) return;
    setSharing(true);
    try {
      await shareCard({
        type: 'moment',
        title: moment.text.split('\n')[0].slice(0, 50),
        content: moment.text.slice(0, 120),
        date: moment.date,
        isDark: resolvedTheme === 'dark',
      });
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        alert('공유 중 오류가 발생했어요.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-4">

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
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">메모</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="공유하기"
            >
              {sharing ? (
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              )}
            </button>
            <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
              <SettingsIcon />
            </Link>
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-4">
          {moment.imageBase64 && (
            <img
              src={moment.imageBase64}
              alt=""
              className="w-full max-h-60 object-cover rounded-xl mb-4"
            />
          )}
          <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-7">
            {renderTextWithLinks(moment.text)}
          </p>

          {/* Link preview: 저장된 것 우선, 없으면 실시간 fetch */}
          {previewLoading && (
            <div className="mt-3">
              <LinkPreviewCard preview={{ url: '', title: '', type: 'link' }} loading />
            </div>
          )}
          {!previewLoading && displayPreview && (
            <div className="mt-3">
              <LinkPreviewCard preview={displayPreview} />
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-block text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
              📅 {formatDateTime(moment.date, moment.createdAt)}
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
