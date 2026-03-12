'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'info';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === 'info') {
    return (
      <div className="flex justify-center px-4 my-1">
        <div className="text-xs text-gray-500 dark:text-gray-400 py-1.5 px-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-[#4A90D9] text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
          }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-current opacity-70 animate-pulse rounded-sm align-middle" />
        )}
      </div>
    </div>
  );
}
