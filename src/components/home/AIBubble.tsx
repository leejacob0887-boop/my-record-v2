'use client';

import { Feather } from 'lucide-react';
import { ChatMessage } from './types';

function formatTime(date: Date) {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface AIBubbleProps {
  message: ChatMessage;
}

export default function AIBubble({ message }: AIBubbleProps) {
  return (
    <div className="flex items-end gap-2">
      {/* 왼쪽 Teal 원형 아이콘 */}
      <div className="w-9 h-9 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0 self-start mt-1">
        <Feather size={16} color="white" strokeWidth={1.8} />
      </div>
      {/* 말풍선 + 시간 */}
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          {typeof message.content === 'string' ? (
            <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            message.content
          )}
        </div>
        <span className="text-[10px] text-gray-400 ml-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
