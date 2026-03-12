'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDiary } from '@/lib/useDiary';
import { useSpeechInput } from '@/lib/useSpeechInput';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/storageUpload';
import { useDraft } from '@/hooks/useDraft';
import DraftToast from '@/components/DraftToast';

type DiaryDraft = {
  title: string;
  content: string;
  weatherIndex: number;
  emotionIndex: number | null;
  tags: string[];
  dateStr: string;
};

const WEATHERS = [
  { label: '맑음', icon: '☀️' },
  { label: '구름', icon: '🌤️' },
  { label: '흐림', icon: '☁️' },
  { label: '비',   icon: '🌧️' },
  { label: '눈',   icon: '❄️' },
];

const EMOTIONS = ['😊', '😐', '😟', '😤', '⚡'];

export default function DiaryNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { save, getByDate } = useDiary();
  const { load, save: saveDraft, clear } = useDraft<DiaryDraft>('draft:diary');

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const timeLabel = today.toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  });
  const [dateStr, setDateStr] = useState(searchParams.get('date') ?? todayStr);

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [emotionIndex, setEmotionIndex] = useState<number | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    const draft = load();
    if (draft && (draft.title.trim() || draft.content.trim())) setShowDraft(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!title.trim() && !content.trim()) return;
    const id = setTimeout(() => saveDraft({ title, content, weatherIndex, emotionIndex, tags, dateStr }), 500);
    return () => clearTimeout(id);
  }, [title, content, weatherIndex, emotionIndex, tags, dateStr]); // eslint-disable-line

  const handleResume = () => {
    const draft = load();
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setWeatherIndex(draft.weatherIndex);
    setEmotionIndex(draft.emotionIndex);
    setTags(draft.tags);
    setDateStr(draft.dateStr);
    clear();
    setShowDraft(false);
  };

  const handleDiscard = () => {
    clear();
    setShowDraft(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('사진 크기는 20MB 이하여야 합니다.');
      e.target.value = '';
      return;
    }
    if (!user) { e.target.value = ''; return; }
    try {
      const url = await uploadImage(file, user.id);
      setImageBase64(url);
    } catch {
      alert('사진 업로드에 실패했습니다.');
    }
    e.target.value = '';
  };

  const handleVoiceResult = useCallback((text: string) => {
    setContent(prev => prev ? prev + ' ' + text : text);
  }, []);
  const { isRecording, isSupported, toggle } = useSpeechInput(handleVoiceResult);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async () => {
    if (!content.trim() || saving) return;
    const existing = getByDate(dateStr);
    if (existing) {
      const ok = confirm(`${dateStr}에 이미 일기가 있습니다. 덮어쓸까요?`);
      if (!ok) return;
    }
    setSaving(true);
    await save({ date: dateStr, title: title.trim() || '제목 없음', content: content.trim(), imageBase64, tags });
    clear();
    router.push('/diary');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      {showDraft && <DraftToast onResume={handleResume} onDiscard={handleDiscard} />}
      <div className="max-w-[430px] mx-auto flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="뒤로가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">일기</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Date + Title */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <input
              type="date"
              value={dateStr}
              max={todayStr}
              onChange={e => setDateStr(e.target.value)}
              className="text-sm text-gray-500 bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-300 focus:border-[#4A90D9] transition-colors"
            />
            <span>📅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">오늘의 일기</h1>
        </div>

        {/* White card area */}
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1">

          {/* Title + Weather row */}
          <div className="flex items-center border-b border-gray-100">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘 하루의 제목 (선택)"
              className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
            />
            <div className="relative">
              <button
                onClick={() => setWeatherOpen((o) => !o)}
                className="flex items-center gap-1 px-3 py-3 text-sm text-gray-500 hover:bg-gray-50 rounded-tr-2xl transition-colors"
              >
                <span>{WEATHERS[weatherIndex].icon}</span>
                <span>{WEATHERS[weatherIndex].label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {weatherOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                  {WEATHERS.map((w, i) => (
                    <button
                      key={w.label}
                      onClick={() => { setWeatherIndex(i); setWeatherOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm w-full text-left hover:bg-gray-50 transition-colors ${i === weatherIndex ? 'text-blue-500 font-medium' : 'text-gray-600'}`}
                    >
                      <span>{w.icon}</span>
                      <span>{w.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image preview */}
          {imageBase64 && (
            <div className="relative mx-4 mt-3 mb-1 flex-shrink-0">
              <img
                src={imageBase64}
                alt=""
                className="w-full max-h-48 object-cover rounded-xl block"
              />
              <button
                onClick={() => setImageBase64(undefined)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/70 transition-colors"
                aria-label="사진 제거"
              >×</button>
            </div>
          )}

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="오늘 하루는 어땠나요?"
            className="flex-1 w-full px-4 py-4 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none resize-none min-h-[200px]"
          />

        </div>

        {/* Fixed bottom panel */}
        <div className="fixed bottom-16 left-0 right-0 bg-[#FAF8F4] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10">
          <div className="max-w-[430px] mx-auto px-4">

            {/* Tag input row */}
            {tagOpen && (
              <div className="flex items-center gap-2 py-2.5 border-b border-gray-100">
                <span className="text-[#4A90D9] text-sm font-medium">#</span>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                    if (e.key === 'Escape') setTagOpen(false);
                  }}
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={addTag}
                  className="text-[#4A90D9] text-xs font-semibold hover:text-[#3A7FC9] transition-colors"
                >
                  추가
                </button>
              </div>
            )}

            {/* Tag chips row */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-2.5 border-b border-gray-100">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-blue-50 text-blue-500 text-xs rounded-full px-3 py-1 border border-blue-100"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-blue-400 hover:text-blue-600 leading-none ml-0.5"
                      aria-label={`${tag} 태그 삭제`}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Emotion picker */}
            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
              {EMOTIONS.map((emoji, i) => (
                <button
                  key={emoji}
                  onClick={() => setEmotionIndex(i === emotionIndex ? null : i)}
                  className={`text-2xl transition-all ${emotionIndex === i ? 'scale-125' : 'opacity-50 hover:opacity-80'}`}
                >
                  {emoji}
                </button>
              ))}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={isRecording ? '녹음 중지' : '음성 입력'}
                  className="relative flex items-center justify-center ml-auto"
                >
                  {isRecording && (
                    <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50 animate-ping" />
                  )}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isRecording ? '#ef4444' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                    <rect x="9" y="2" width="6" height="12" rx="3" />
                    <path d="M5 10a7 7 0 0 0 14 0" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                </button>
              )}
            </div>

            {/* Toolbar */}
            <div className="flex items-center py-3 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#4A90D9] transition-colors"
                  aria-label="사진 추가"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs font-medium">사진 추가</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button
                  onClick={() => setTagOpen(o => !o)}
                  className={`transition-colors ${tagOpen ? 'text-[#4A90D9]' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="태그"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mx-auto">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>작성 시간 {timeLabel}</span>
              </div>
              <button className="text-gray-300 hover:text-red-400 transition-colors" aria-label="삭제">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </div>

            {/* Save button */}
            <div className="py-3">
              <button
                onClick={handleSubmit}
                disabled={!content.trim() || saving}
                className="w-full bg-[#4A90D9] text-white rounded-2xl py-3.5 text-base font-semibold hover:bg-[#3A7FC9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    저장 중...
                  </>
                ) : '저장'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
