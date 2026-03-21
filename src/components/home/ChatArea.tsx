'use client';

import { RefObject, useEffect } from 'react';
import { ChatMessage } from './types';
import AIBubble from './AIBubble';
import UserBubble from './UserBubble';
import { Loader2 } from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  chatEndRef: RefObject<HTMLDivElement | null>;
  isSending: boolean;
}

export default function ChatArea({ messages, chatEndRef, isSending }: ChatAreaProps) {
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending, chatEndRef]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.map((msg) =>
        msg.role === 'ai' ? (
          <AIBubble key={msg.id} message={msg} />
        ) : (
          <UserBubble key={msg.id} message={msg} />
        )
      )}
      {isSending && (
        <div className="flex items-end gap-2">
          <div className="w-9 h-9 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0 self-start mt-1">
            <svg width="16" height="16" viewBox="0 0 80 80" fill="none">
              <path d="M40 62 Q30 48 32 30 Q36 14 50 10 Q62 7 64 20 Q66 33 54 42 Q46 48 40 62Z" fill="#E1F5EE" opacity="0.95" />
            </svg>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
