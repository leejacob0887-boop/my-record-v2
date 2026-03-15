'use client';

import Link from 'next/link';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, Zap, Lightbulb, CalendarDays, ChevronRight, ChevronDown, Bot, Camera, Mic } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useDiary } from '@/lib/useDiary';
import { useMoments } from '@/lib/useMoments';
import { useIdeas } from '@/lib/useIdeas';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/storageUpload';

interface RecordCardProps {
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  label: string;
  description: string;
  count: number;
  href: string;
}

function RecordCard({ icon, iconBg, cardBg, label, description, count, href }: RecordCardProps) {
  return (
    <Link
      href={href}
      className={`${cardBg} rounded-2xl p-5 active:scale-95 transition-all flex flex-col gap-3 min-h-[130px]`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-none">{count}</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}

type RecentItem = { type: 'diary' | 'moment' | 'idea'; label: string; date: string; createdAt: string; href: string };

export default function Home() {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const { entries, save: saveDiary } = useDiary();
  const { moments, add: addMoment } = useMoments();
  const { ideas, add: addIdea } = useIdeas();

  const [recentOpen, setRecentOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const showToast = (msg: string, autoClear = false) => {
    setToast(msg);
    if (autoClear) setTimeout(() => setToast(null), 3000);
  };

  const handleMicClick = () => {
    // 녹음 중이면 중지
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      setToast(null);
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
    showToast('듣고 있어요...');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsRecording(false);
      recognitionRef.current = null;
      showToast('자동 저장 중...');
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'save',
            messages: [{ role: 'user', content: transcript }],
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? '저장 실패');

        const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const date = data.date ?? today;

        if (data.type === 'diary') {
          await saveDiary({ date, title: data.title ?? '음성 기록', content: data.content ?? '' });
        } else if (data.type === 'moment') {
          await addMoment({ text: data.text ?? data.content ?? '', date });
        } else if (data.type === 'idea') {
          await addIdea({ title: data.title ?? '아이디어', content: data.content ?? '', date });
        }
        const label = data.type === 'diary' ? '일기로 저장됐어요! 📔'
          : data.type === 'moment' ? '메모로 저장됐어요! ⚡'
          : '아이디어로 저장됐어요! 💡';
        showToast(label, true);
        // 탭바 NEW 뱃지
        const badgeKey = data.type === 'diary' ? 'new_badge_diary'
          : data.type === 'moment' ? 'new_badge_moment' : 'new_badge_idea';
        localStorage.setItem(badgeKey, '1');
        window.dispatchEvent(new CustomEvent('badge-update'));
      } catch {
        showToast('저장 중 오류가 발생했어요', true);
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      showToast('마이크 권한이 필요해요', true);
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.start();
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    showToast('저장 중...');
    try {
      const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let imageUrl: string;
      if (user) {
        imageUrl = await uploadImage(file, user.id);
      } else {
        // 비로그인: base64로 로컬 저장
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
      showToast('사진이 저장됐어요! 📷', true);
    } catch {
      showToast('저장 중 오류가 발생했어요', true);
    }
  };

  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const todayDiaryCount = useMemo(() => entries.filter(e => e.date === today).length, [entries, today]);
  const todayMomentCount = useMemo(() => moments.filter(m => {
    const kstDate = new Date(new Date(m.createdAt).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return kstDate === today;
  }).length, [moments, today]);
  const todayIdeaCount = useMemo(() => ideas.filter(i => {
    const kstDate = new Date(new Date(i.createdAt).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return kstDate === today;
  }).length, [ideas, today]);

  const recentItems = useMemo<RecentItem[]>(() => {
    const all: RecentItem[] = [
      ...entries.map(e => ({ type: 'diary' as const, label: e.title, date: e.date ?? '', createdAt: e.createdAt ?? '', href: `/diary/${e.id}` })),
      ...moments.map(m => ({ type: 'moment' as const, label: m.text, date: m.date ?? '', createdAt: m.createdAt ?? '', href: `/moments/${m.id}` })),
      ...ideas.map(i => ({ type: 'idea' as const, label: i.title, date: i.date ?? '', createdAt: i.createdAt ?? '', href: `/ideas/${i.id}` })),
    ];
    return all.sort((a, b) => (b.createdAt || b.date || '').localeCompare(a.createdAt || a.date || '')).slice(0, 5);
  }, [entries, moments, ideas]);

  return (
    <main className="min-h-screen bg-[#F4F2EE] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-4">

        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-6">
          <DarkModeToggle />
          <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 80 80">
              <rect width="80" height="80" rx="18" fill="#0F6E56"/>
              <path d="M40 62 Q30 48 32 30 Q36 14 50 10 Q62 7 64 20 Q66 33 54 42 Q46 48 40 62Z" fill="#E1F5EE" opacity="0.95"/>
              <path d="M40 62 Q43 48 50 30" fill="none" stroke="#5DCAA5" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M40 62 L37 69 L40 67 L43 69 Z" fill="#E1F5EE"/>
              <ellipse cx="40" cy="72" rx="3.5" ry="4.5" fill="#FAC775"/>
              <g transform="translate(60,18)">
                <path d="M0,-7 L1.7,-1.7 L7,0 L1.7,1.7 L0,7 L-1.7,1.7 L-7,0 L-1.7,-1.7 Z" fill="#FAC775"/>
              </g>
              <g transform="translate(52,30)">
                <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#FAC775" opacity="0.7"/>
              </g>
            </svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notia</h1>
          </div>
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="설정"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* AI Chat banner */}
        <Link
          href="/chat"
          className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 mb-5 active:scale-95 transition-all"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0F6E56' }}>
            <Bot size={22} color="white" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">AI와 대화하며 기록해보세요</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">무슨 생각이든 알아서 정리해드려요</p>
          </div>
          <ChevronRight size={18} color="#6366F1" />
        </Link>

        {/* Record cards grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl py-2 px-4 mb-5">
        <div className="grid grid-cols-2">
          {/* 일기 */}
          <Link href="/diary" className="flex items-center gap-3 px-4 py-4 border-b border-[#e6e2db] active:opacity-70">
            <div className="w-10 h-10 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} color="white" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">일기</p>
          </Link>
          {/* 메모 */}
          <Link href="/moments" className="flex items-center gap-3 px-4 py-4 border-b border-[#e6e2db] active:opacity-70">
            <div className="w-10 h-10 rounded-xl bg-[#1D9E75] flex items-center justify-center flex-shrink-0">
              <Zap size={18} color="white" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">메모</p>
          </Link>
          {/* 아이디어 */}
          <Link href="/ideas" className="flex items-center gap-3 px-4 py-4 active:opacity-70">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] border border-[#5DCAA5] flex items-center justify-center flex-shrink-0">
              <Lightbulb size={18} color="#0F6E56" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">아이디어</p>
          </Link>
          {/* 캘린더 */}
          <Link href="/calendar" className="flex items-center gap-3 px-4 py-4 active:opacity-70">
            <div className="w-10 h-10 rounded-full bg-[#9FE1CB] flex items-center justify-center flex-shrink-0">
              <CalendarDays size={18} color="#085041" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">돌아보기</p>
          </Link>
        </div>
        </div>

        {/* Bottom section — illustration card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-3">
          <div className="flex flex-row items-center px-4 py-1 gap-4">
            <div className="flex-1 min-w-0 pl-4">
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 whitespace-pre-line">{"생각은\n사라지지만,"}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-0.5 whitespace-pre-line">{"기록은\n남습니다."}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/poetry.gif" alt="일러스트" className="w-44 h-44 object-contain flex-shrink-0 -translate-x-4" />
          </div>
          {/* 최근 기록 + 카메라/마이크 한 줄 */}
          <div className="flex items-center justify-between px-6 pb-5">
            <button
              onClick={() => setRecentOpen(v => !v)}
              className="flex items-center gap-1 active:opacity-70"
            >
              <span className="text-sm font-semibold" style={{ color: '#0F6E56' }}>최근 기록</span>
              <ChevronDown
                size={16}
                color="#0F6E56"
                className={`transition-transform ${recentOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">빠른메모</span>
              <button onClick={() => cameraInputRef.current?.click()} className="active:opacity-70" aria-label="카메라">
                <Camera size={22} color="#0F6E56" strokeWidth={1.8} />
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCameraChange}
              />
              <button onClick={handleMicClick} className="active:opacity-70" aria-label="마이크">
                <Mic size={22} color={isRecording ? '#ef4444' : '#0F6E56'} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom sheet */}
        {recentOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setRecentOpen(false)}
            />
            {/* Sheet */}
            <div className="fixed bottom-16 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl flex flex-col" style={{ maxHeight: 'calc(85vh - 64px)' }}>
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-600" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <span className="text-base font-bold text-gray-800 dark:text-gray-100">최근 기록</span>
                <button
                  onClick={() => setRecentOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                  aria-label="닫기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-gray-500 dark:text-gray-400">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* List */}
              <div className="flex-1 overflow-y-auto pb-8">
                {recentItems.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-12">아직 기록이 없어요</p>
                ) : (
                  recentItems.map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setRecentOpen(false)}
                      className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.type === 'diary' ? 'bg-[#EDE9FF]' :
                        item.type === 'moment' ? 'bg-[#FFF0E0]' : 'bg-[#E8F8EE]'
                      }`}>
                        {item.type === 'diary' && <BookOpen size={17} color="#7C3AED" strokeWidth={1.8} />}
                        {item.type === 'moment' && <Zap size={17} color="#EA580C" strokeWidth={1.8} />}
                        {item.type === 'idea' && <Lightbulb size={17} color="#16A34A" strokeWidth={1.8} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {item.type === 'diary' ? '일기' : item.type === 'moment' ? '메모' : '아이디어'} · {item.date}
                        </p>
                      </div>
                      <ChevronRight size={16} color="#D1D5DB" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#111] text-white text-sm rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
    </main>
  );
}
