'use client';

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Camera } from 'lucide-react';
import ChatMessage from '@/components/ChatMessage';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';
import { useSpeechInput } from '@/lib/useSpeechInput';
import { addTodo } from '@/lib/todos';
import { parseTodoIntent } from '@/lib/parseTodoIntent';

type MessageRole = 'user' | 'assistant' | 'info';
type Message = { id: string; role: MessageRole; content: string; imageUrl?: string };

const CHAT_STORAGE_KEY = 'chat:history';
const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: '안녕하세요! 오늘 어떤 이야기를 나눠볼까요? 😊\n대화하다가 "저장해줘"라고 하면 제가 기록으로 남겨드릴게요.',
};

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [INITIAL_MESSAGE];
    const parsed = JSON.parse(raw) as Message[];
    return parsed.length > 0 ? parsed : [INITIAL_MESSAGE];
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
  } catch {}
}

function clearMessages() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
}

const SAVE_TRIGGERS = ['저장해줘', '저장해', '저장할게', '기록해줘', '기록해'];

const isSaveRequest = (text: string) =>
  SAVE_TRIGGERS.some((t) => text.trim().includes(t));

export default function ChatPage() {
  const router = useRouter();
  const { save: saveDiary } = useDiary();
  const { add: addMoment } = useMoments();
  const { add: addIdea } = useIdeas();

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isTTSMode, setIsTTSMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const handleSendRef = useRef<() => void>(() => {});
  const chatCameraRef = useRef<HTMLInputElement>(null);

  const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // 마운트 시 이전 대화 복원
  useEffect(() => {
    setMessages(loadMessages());
  }, []); // eslint-disable-line

  // messages 변경 시 localStorage 저장
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text: string) {
    if (!isTTSMode || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  function newId() {
    return crypto.randomUUID();
  }

  // 채팅용 메시지 배열 (info 제외, user 메시지부터 시작)
  function toChatHistory(msgs: Message[]) {
    const filtered = msgs
      .filter((m) => m.role !== 'info')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    // Anthropic API는 user 메시지로 시작해야 함
    const firstUserIdx = filtered.findIndex((m) => m.role === 'user');
    return firstUserIdx >= 0 ? filtered.slice(firstUserIdx) : filtered;
  }

  async function handleChat(msgs: Message[]) {
    setIsLoading(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', messages: toChatHistory(msgs) }),
      });

      if (!res.ok || !res.body) throw new Error('응답 오류');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingContent(accumulated);
      }

      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: accumulated },
      ]);
      speak(accumulated);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'info', content: '오류가 발생했습니다. 다시 시도해주세요.' },
      ]);
    } finally {
      setStreamingContent('');
      setIsLoading(false);
    }
  }

  async function handleSave(msgs: Message[]) {
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'info', content: '대화 내용을 분석 중이에요...' },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'save', messages: toChatHistory(msgs) }),
      });

      if (!res.ok) throw new Error('저장 분석 오류');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const today = new Date().toISOString().slice(0, 10);
      const date = data.date ?? today;

      if (data.type === 'diary') {
        await saveDiary({ date, title: data.title ?? '대화 기록', content: data.content ?? '' });
      } else if (data.type === 'moment') {
        await addMoment({ text: data.text ?? data.content ?? '', date });
      } else if (data.type === 'idea') {
        await addIdea({ title: data.title ?? '아이디어', content: data.content ?? '', date });
      }

      // 저장 성공 → 1.5초 후 대화 초기화
      const confirmMsg = data.confirmMessage ?? '✅ 저장했어요!';
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === 'info' && m.content === '대화 내용을 분석 중이에요...')),
        { id: newId(), role: 'info', content: confirmMsg },
      ]);
      setTimeout(() => {
        clearMessages();
        setMessages([INITIAL_MESSAGE]);
      }, 1500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장 중 오류가 발생했어요.';
      setMessages((prev) => [
        ...prev.filter((m) => !(m.role === 'info' && m.content === '대화 내용을 분석 중이에요...')),
        { id: newId(), role: 'info', content: `❌ ${msg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');

    window.speechSynthesis?.cancel();

    const newMessages: Message[] = [
      ...messages,
      { id: newId(), role: 'user', content: userText },
    ];
    setMessages(newMessages);

    const todoIntent = parseTodoIntent(userText);
    if (todoIntent.isTodoIntent) {
      try {
        await addTodo(todoIntent.content, todoIntent.due_date);
        const duePart = todoIntent.due_date ? ` (마감: ${todoIntent.due_date})` : '';
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'assistant', content: `✅ **"${todoIntent.content}"** 할일을 추가했어요!${duePart} 할일 탭에서 확인할 수 있어요. 😊` },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: 'info', content: '❌ 할일 추가에 실패했어요.' },
        ]);
      }
    } else if (isSaveRequest(userText)) {
      await handleSave(newMessages);
    } else {
      await handleChat(newMessages);
    }
  }

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
    setTimeout(() => handleSendRef.current(), 0);
  }, []);

  const { isRecording, isSupported: isSpeechSupported, toggle: toggleMic } =
    useSpeechInput(handleVoiceResult);

  const handleChatCameraChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result as string;
      const userMsg: Message = { id: newId(), role: 'user', content: '', imageUrl };
      const aiMsg: Message = { id: newId(), role: 'assistant', content: '이 사진으로 무엇을 도와드릴까요? 😊' };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    };
    reader.readAsDataURL(file);
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAF8F4] dark:bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-[#FAF8F4] dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-800 dark:text-gray-100">AI와 대화</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">"저장해줘"라고 하면 기록으로 남겨드려요</p>
        </div>
        <button
          onClick={() => {
            if (!confirm('대화 내용을 전체 삭제할까요?')) return;
            clearMessages();
            setMessages([INITIAL_MESSAGE]);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label="대화 초기화"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
        {isTTSSupported && (
          <button
            onClick={() => {
              if (isTTSMode) window.speechSynthesis.cancel();
              setIsTTSMode((prev) => !prev);
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              isTTSMode
                ? 'text-[#4A90D9] bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            aria-label={isTTSMode ? '대화 모드 끄기' : '대화 모드 켜기'}
          >
            {isTTSMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} role={msg.role} content={msg.content} imageUrl={msg.imageUrl} />
        ))}
        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} isStreaming />
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 pb-6 pt-3 bg-[#FAF8F4] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-end gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 max-h-32"
            style={{ lineHeight: '1.5' }}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => chatCameraRef.current?.click()}
            disabled={isLoading}
            className="flex items-center justify-center w-8 h-8 flex-shrink-0 disabled:opacity-40"
            aria-label="사진 첨부"
          >
            <Camera size={18} color="#0F6E56" />
          </button>
          <input
            ref={chatCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleChatCameraChange}
          />
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={isLoading}
              className="relative flex items-center justify-center w-8 h-8 flex-shrink-0 disabled:opacity-40"
              aria-label={isRecording ? '녹음 중지' : '음성 입력'}
            >
              {isRecording && (
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50 animate-ping" />
              )}
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={isRecording ? '#ef4444' : '#9ca3af'}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="relative z-10"
              >
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#4A90D9] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
            aria-label="전송"
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
