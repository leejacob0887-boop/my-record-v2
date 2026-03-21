'use client';

import { ChangeEvent, useRef, useState, useCallback } from 'react';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/storageUpload';
import { addEvent } from '@/lib/events';
import { ChatMessage, BottomSheetState, QuickButtonType } from '@/components/home/types';
import HomeTopBar from '@/components/home/HomeTopBar';
import CategoryScroll from '@/components/home/CategoryScroll';
import ChatArea from '@/components/home/ChatArea';
import BottomInputArea from '@/components/home/BottomInputArea';
import TodayScheduleSheet from '@/components/home/sheets/TodayScheduleSheet';
import TodayTodoSheet from '@/components/home/sheets/TodayTodoSheet';
import RecentRecordsSheet from '@/components/home/sheets/RecentRecordsSheet';
import WeatherSheet from '@/components/home/sheets/WeatherSheet';

const INIT_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'ai',
  content: '안녕하세요! 😊 오늘 어떤 걸 기록할까요?\n"저장해줘"라고 하면 기록으로 남겨드릴게요.',
  timestamp: new Date(),
};

const SAVE_TRIGGERS = ['저장해줘', '저장해', '저장할게', '기록해줘', '기록해'];
const isSaveRequest = (text: string) => SAVE_TRIGGERS.some((t) => text.includes(t));

function getDefaultReply(type: string): string {
  if (type === 'diary') return '일기로 저장됐어요! 📔';
  if (type === 'moment') return '메모로 저장됐어요! ⚡';
  if (type === 'idea') return '아이디어로 저장됐어요! 💡';
  if (type === 'calendar_event') return '일정을 추가했어요! 📅';
  return '기록됐어요!';
}

type ApiMessage = { role: 'user' | 'assistant'; content: string };

export default function Home() {
  const { user } = useAuth();
  const { save: saveDiary } = useDiary();
  const { add: addMoment } = useMoments();
  const { add: addIdea } = useIdeas();

  const [messages, setMessages] = useState<ChatMessage[]>([INIT_MESSAGE]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sheet, setSheet] = useState<BottomSheetState>({ open: false, type: null });

  const chatEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addAIMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'ai', content, timestamp: new Date() },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    const newHistory: ApiMessage[] = [...apiHistory, { role: 'user', content: text }];
    setApiHistory(newHistory);

    try {
      const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

      if (isSaveRequest(text)) {
        // ── 저장 모드 ──────────────────────────────────────
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'save', messages: newHistory }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? '저장 실패');

        const date = data.date ?? today;
        if (data.type === 'diary') {
          await saveDiary({ date, title: data.title ?? '기록', content: data.content ?? '' });
          localStorage.setItem('new_badge_diary', '1');
        } else if (data.type === 'moment') {
          await addMoment({ text: data.text ?? data.content ?? '', date });
          localStorage.setItem('new_badge_moment', '1');
        } else if (data.type === 'idea') {
          await addIdea({ title: data.title ?? '아이디어', content: data.content ?? '', date });
          localStorage.setItem('new_badge_idea', '1');
        } else if (data.type === 'calendar_event') {
          await addEvent({
            title: data.title ?? '일정',
            date,
            start_time: data.start_time ?? null,
            end_time: data.end_time ?? null,
            description: data.description ?? null,
          });
        }
        window.dispatchEvent(new CustomEvent('badge-update'));

        const reply = data.confirmMessage ?? data.reply ?? getDefaultReply(data.type);
        addAIMessage(reply);
        setApiHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
      } else {
        // ── 채팅 모드 — 스트리밍 ───────────────────────────
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'chat', messages: newHistory }),
        });
        if (!res.ok || !res.body) throw new Error('응답 오류');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setStreamingText(accumulated);
        }

        setStreamingText('');
        addAIMessage(accumulated);
        setApiHistory((prev) => [...prev, { role: 'assistant', content: accumulated }]);
      }
    } catch {
      addAIMessage('오류가 발생했어요 😢 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, apiHistory, saveDiary, addMoment, addIdea, addAIMessage]);

  const handleMic = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    setIsRecording(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsRecording(false);
      recognitionRef.current = null;
      setInputText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      addAIMessage('마이크 권한이 필요해요 🎤');
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.start();
  }, [isRecording, addAIMessage]);

  const handleCameraChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: '📷 사진을 저장합니다',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let imageUrl: string;
      if (user) {
        imageUrl = await uploadImage(file, user.id);
      } else {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      await addMoment({ text: '', date: kstToday, imageBase64: imageUrl });
      localStorage.setItem('new_badge_moment', '1');
      window.dispatchEvent(new CustomEvent('badge-update'));
      addAIMessage('사진이 저장됐어요! 📷');
    } catch {
      addAIMessage('사진 저장 중 오류가 발생했어요 😢');
    } finally {
      setIsSending(false);
    }
  }, [user, addMoment, addAIMessage]);

  const openSheet = useCallback((type: QuickButtonType) => {
    setSheet({ open: true, type });
  }, []);

  const closeSheet = useCallback(() => {
    setSheet({ open: false, type: null });
  }, []);

  return (
    <main className="flex flex-col h-[100dvh] bg-[#F4F2EE] dark:bg-gray-900 max-w-[430px] mx-auto">
      <HomeTopBar />
      <CategoryScroll />
      <hr className="border-gray-200 dark:border-gray-700 mx-4" />
      <ChatArea messages={messages} chatEndRef={chatEndRef} isSending={isSending} streamingText={streamingText} />
      {/* 하단 입력창(빠른버튼+입력창) 높이 확보 */}
      <div className="h-[140px] flex-shrink-0" />
      <BottomInputArea
        inputText={inputText}
        onInputChange={setInputText}
        onSend={handleSend}
        onMic={handleMic}
        onCameraChange={handleCameraChange}
        isRecording={isRecording}
        isSending={isSending}
        onQuickButton={openSheet}
        cameraInputRef={cameraInputRef}
      />

      {/* 바텀시트 */}
      {sheet.open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeSheet}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-600" />
            </div>
            {sheet.type === 'schedule' && <TodayScheduleSheet onClose={closeSheet} />}
            {sheet.type === 'todo' && <TodayTodoSheet onClose={closeSheet} />}
            {sheet.type === 'recent' && <RecentRecordsSheet onClose={closeSheet} />}
            {sheet.type === 'weather' && <WeatherSheet onClose={closeSheet} />}
          </div>
        </>
      )}
    </main>
  );
}
