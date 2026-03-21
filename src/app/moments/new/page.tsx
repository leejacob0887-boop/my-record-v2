'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMoments } from '@/lib/useMoments';
import { useTags } from '@/lib/useTags';
import { useSpeechInput } from '@/lib/useSpeechInput';
import { useDraft } from '@/hooks/useDraft';
import DraftToast from '@/components/DraftToast';
import SavePreviewCard from '@/components/SavePreviewCard';

type MomentDraft = { text: string; tags: string[] };
type PreviewData = { content: string; savedAt: string };

export default function MomentNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { add } = useMoments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { load, save, clear } = useDraft<MomentDraft>('draft:moment');
  const { loading: tagsLoading, generateTags } = useTags([]);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const timeLabel = today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const [dateStr, setDateStr] = useState(searchParams.get('date') ?? todayStr);

  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [tagOpen, setTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    const draft = load();
    if (draft && draft.text.trim()) setShowDraft(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!text.trim()) return;
    const id = setTimeout(() => save({ text, tags }), 500);
    return () => clearTimeout(id);
  }, [text, tags]); // eslint-disable-line

  const handleResume = () => {
    const draft = load();
    if (!draft) return;
    setText(draft.text);
    setTags(draft.tags);
    clear();
    setShowDraft(false);
  };

  const handleDiscard = () => {
    clear();
    setShowDraft(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('사진 크기는 20MB 이하여야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVoiceResult = useCallback((t: string) => {
    setText(prev => prev ? prev + ' ' + t : t);
  }, []);
  const { isRecording, isSupported, toggle } = useSpeechInput(handleVoiceResult);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleSubmit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    let finalTags = tags;
    if (finalTags.length === 0) {
      finalTags = await generateTags(text, 'moment') ?? [];
    }
    await add({ text: text.trim(), date: dateStr, imageBase64, tags: finalTags });
    clear();
    const savedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setPreview({ content: text.trim(), savedAt });
  };

  const handleDismiss = () => {
    setPreview(null);
    router.push('/moments');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      {showDraft && <DraftToast onResume={handleResume} onDiscard={handleDiscard} />}
      {preview && (
        <SavePreviewCard
          type="moment"
          content={preview.content}
          savedAt={preview.savedAt}
          onDismiss={handleDismiss}
        />
      )}
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
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">메모</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Date picker */}
        <div className="px-4 pb-3 flex items-center gap-1.5">
          <input
            type="date"
            value={dateStr}
            max={todayStr}
            onChange={e => setDateStr(e.target.value)}
            className="text-sm text-gray-500 bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-300 focus:border-[#4A90D9] transition-colors"
          />
          <span>📅</span>
        </div>

        {/* White card area */}
        <div className="mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-1">

          {/* Image preview */}
          {imageBase64 && (
            <div className="relative mx-4 mt-3">
              <img src={imageBase64} alt="" className="w-full max-h-48 object-cover rounded-xl" />
              <button
                onClick={() => setImageBase64(undefined)}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs hover:bg-black/70 transition-colors"
                aria-label="사진 제거"
              >×</button>
            </div>
          )}

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={async () => {
              if (text.trim() && tags.length === 0) {
                const generated = await generateTags(text, 'moment');
                if (generated?.length) setTags(generated);
              }
            }}
            placeholder="지금 무슨 생각을 하고 있나요?"
            maxLength={500}
            className="flex-1 w-full px-4 py-4 text-sm text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 bg-transparent outline-none resize-none min-h-[200px]"
          />
          <p className="px-4 pb-2 text-right text-xs text-gray-400">{text.length}/500</p>

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
                  className="flex-1 text-sm text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 bg-transparent outline-none"
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
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="text-blue-400 hover:text-blue-600 leading-none ml-0.5"
                      aria-label={`${tag} 태그 삭제`}
                    >×</button>
                  </span>
                ))}
              </div>
            )}

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
                {isSupported && (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={isRecording ? '녹음 중지' : '음성 입력'}
                    className="relative flex items-center justify-center"
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
                <button
                  onClick={() => setTagOpen(o => !o)}
                  disabled={tagsLoading}
                  className={`transition-colors ${tagOpen ? 'text-[#4A90D9]' : tagsLoading ? 'text-gray-300 animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
                  aria-label="태그"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>작성 시간 {timeLabel}</span>
              </div>
            </div>

            {/* Save button */}
            <div className="py-3">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || saving}
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
                ) : '기록하기'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
