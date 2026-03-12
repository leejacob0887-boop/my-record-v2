'use client';

import { useEffect, useRef, useState } from 'react';

type SavePreviewCardProps = {
  type: 'diary' | 'moment' | 'idea';
  title?: string;
  content: string;
  savedAt: string;
  onDismiss: () => void;
};

const TYPE_META = {
  diary:  { emoji: '📖', label: '일기', color: 'bg-amber-50 dark:bg-amber-900/20' },
  moment: { emoji: '💬', label: '메모', color: 'bg-blue-50 dark:bg-blue-900/20' },
  idea:   { emoji: '💡', label: '아이디어', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
};

export default function SavePreviewCard({ type, title, content, savedAt, onDismiss }: SavePreviewCardProps) {
  const [leaving, setLeaving] = useState(false);
  const dismissed = useRef(false);
  const meta = TYPE_META[type];

  const displayTitle = title?.trim() || content.slice(0, 20);
  const displayContent = content.length > 60 ? content.slice(0, 60) + '…' : content;

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setLeaving(true);
    setTimeout(onDismiss, 300);
  };

  useEffect(() => {
    const id = setTimeout(dismiss, 3500);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-5 pointer-events-none">
      <div
        className={`
          pointer-events-auto
          w-full max-w-[360px]
          bg-white/92 dark:bg-gray-800/92
          backdrop-blur-md
          rounded-2xl
          shadow-[0_8px_40px_rgba(0,0,0,0.13)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]
          border border-white/70 dark:border-gray-700/50
          overflow-hidden
          ${leaving ? 'animate-slide-down-out' : 'animate-slide-up-toast'}
        `}
      >
        {/* 타이머 바 — 상단 */}
        <div className="h-[3px] bg-gray-100 dark:bg-gray-700">
          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-300 dark:from-green-500 dark:to-emerald-400 animate-timer-drain" />
        </div>

        <div className="px-5 py-4">
          {/* 헤더 행 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl ${meta.color} flex items-center justify-center text-lg flex-shrink-0`}>
                {meta.emoji}
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 leading-none">
                  저장 완료
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {meta.label} · {savedAt}
                </p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-gray-100 dark:bg-gray-700 mb-3" />

          {/* 제목 */}
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug mb-1.5 line-clamp-1">
            {displayTitle}
          </p>

          {/* 내용 */}
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-2">
            {displayContent}
          </p>
        </div>
      </div>
    </div>
  );
}
