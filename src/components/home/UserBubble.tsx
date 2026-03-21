'use client';

import { ChatMessage } from './types';

function formatTime(date: Date) {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface UserBubbleProps {
  message: ChatMessage;
}

export default function UserBubble({ message }: UserBubbleProps) {
  return (
    <div className="flex items-end justify-end gap-2">
      <div className="flex flex-col items-end gap-1 max-w-[75%]">
        <div className="bg-[#0F6E56] rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
            {typeof message.content === 'string' ? message.content : ''}
          </p>
        </div>
        <span className="text-[10px] text-gray-400 mr-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
