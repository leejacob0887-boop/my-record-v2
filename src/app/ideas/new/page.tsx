'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIdeas } from '@/lib/useIdeas';
import ImagePicker from '@/components/ImagePicker';
import MicButton from '@/components/MicButton';
import { useSpeechInput } from '@/lib/useSpeechInput';
import { useDraft } from '@/hooks/useDraft';
import DraftToast from '@/components/DraftToast';

type IdeaDraft = { title: string; content: string; tags: string[] };

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default function IdeaNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { add } = useIdeas();
  const { load, save, clear } = useDraft<IdeaDraft>('draft:idea');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(searchParams.get('date') ?? todayStr);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();
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
    const id = setTimeout(() => save({ title, content, tags }), 500);
    return () => clearTimeout(id);
  }, [title, content, tags]); // eslint-disable-line

  const handleResume = () => {
    const draft = load();
    if (!draft) return;
    setTitle(draft.title);
    setContent(draft.content);
    setTags(draft.tags);
    clear();
    setShowDraft(false);
  };

  const handleDiscard = () => {
    clear();
    setShowDraft(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    const tagStr = tags.length > 0 ? '\n\n' + tags.map(t => `#${t}`).join(' ') : '';
    await add({ title: title.trim(), content: content.trim() + tagStr, date, imageBase64 });
    clear();
    router.push('/ideas');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      {showDraft && <DraftToast onResume={handleResume} onDiscard={handleDiscard} />}
      <div className="max-w-[430px] mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="뒤로가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">새 아이디어</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <SettingsIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <label className="block text-xs text-gray-500 mb-2">날짜</label>
            <input
              type="date"
              value={date}
              max={todayStr}
              onChange={e => setDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer border-b border-dashed border-gray-200 focus:border-[#4A90D9] transition-colors"
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <label className="block text-xs text-gray-500 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="아이디어 제목"
              className="w-full text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
              required
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">내용</label>
              {isSupported && <MicButton isRecording={isRecording} onClick={toggle} />}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="아이디어를 자유롭게 적어보세요"
              rows={6}
              maxLength={500}
              className="w-full text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none resize-none"
              required
            />
            <p className="text-right text-xs text-gray-400 mt-1">{content.length}/500</p>

            {/* Tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-500 text-xs rounded-full px-3 py-1 border border-blue-100">
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-blue-400 hover:text-blue-600 leading-none ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            {tagOpen && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="text-gray-400 text-sm">#</span>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none"
                  autoFocus
                />
                <button type="button" onClick={addTag} className="text-blue-400 text-xs font-medium hover:text-blue-600 transition-colors">추가</button>
              </div>
            )}

            {/* Tag button */}
            <button
              type="button"
              onClick={() => setTagOpen(o => !o)}
              className={`mt-2 flex items-center gap-1 text-xs transition-colors ${tagOpen ? 'text-[#4A90D9]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              태그 추가
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <label className="block text-xs text-gray-500 mb-2">사진</label>
            <ImagePicker value={imageBase64} onChange={setImageBase64} />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || saving}
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
        </form>

      </div>
    </main>
  );
}
