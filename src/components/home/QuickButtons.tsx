'use client';

import { QuickButtonType } from './types';

const BUTTONS: { type: QuickButtonType; label: string }[] = [
  { type: 'schedule', label: '오늘 일정' },
  { type: 'todo', label: '오늘 할일' },
  { type: 'recent', label: '최근 기록' },
  { type: 'weather', label: '오늘 날씨' },
];

interface QuickButtonsProps {
  onSelect: (type: QuickButtonType) => void;
}

export default function QuickButtons({ onSelect }: QuickButtonsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {BUTTONS.map((btn) => (
        <button
          key={btn.type}
          onClick={() => onSelect(btn.type)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[#0F6E56] text-xs font-medium text-[#0F6E56] active:bg-[#E1F5EE] transition-colors"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
