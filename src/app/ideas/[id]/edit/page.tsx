'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useIdeas } from '@/lib/useIdeas';
import ImagePicker from '@/components/ImagePicker';

function splitContentAndTags(full: string): { body: string; tags: string[] } {
  const parts = full.split('\n\n');
  const last = parts[parts.length - 1];
  if (parts.length > 1 && last.trim().length > 0 && last.trim().split(' ').every(w => w.startsWith('#'))) {
    return {
      body: parts.slice(0, -1).join('\n\n'),
      tags: last.trim().split(' ').map(t => t.slice(1)),
    };
  }
  return { body: full, tags: [] };
}

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default function IdeaEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = useIdeas();
  const idea = getById(id);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(idea?.date ?? todayStr);
  const [title, setTitle] = useState(idea?.title ?? '');
  const { body: initialBody, tags: initialTags } = splitContentAndTags(idea?.content ?? '');
  const [content, setContent] = useState(initialBody);
  const [imageBase64, setImageBase64] = useState<string | undefined>(idea?.imageBase64);
  const [tagOpen, setTagOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  if (!idea) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
        <div className="max-w-[430px] mx-auto px-5 pt-12">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-center text-gray-400 text-sm py-16">아이디어를 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    const tagStr = tags.length > 0 ? '\n\n' + tags.map(t => `#${t}`).join(' ') : '';
    await update(id, { title: title.trim(), content: content.trim() + tagStr, date, imageBase64 });
    router.push(`/ideas/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
      <div className="max-w-[430px] mx-auto px-5">

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
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">아이디어 수정</span>
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
            <label className="block text-xs text-gray-500 mb-2">내용</label>
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
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <label className="block text-xs text-gray-500 mb-2">사진</label>
            <ImagePicker value={imageBase64} onChange={setImageBase64} />
          </div>

          {/* 태그 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">태그</label>
              <button
                type="button"
                onClick={() => setTagOpen(o => !o)}
                className={`text-xs font-medium transition-colors ${tagOpen ? 'text-[#4A90D9]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                + 태그 추가
              </button>
            </div>
            {tagOpen && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#4A90D9] text-sm font-medium">#</span>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                    if (e.key === 'Escape') setTagOpen(false);
                  }}
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none border-b border-dashed border-gray-200 focus:border-[#4A90D9]"
                  autoFocus
                />
                <button type="button" onClick={addTag} className="text-[#4A90D9] text-xs font-semibold">추가</button>
              </div>
            )}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-blue-50 text-blue-500 text-xs rounded-full px-3 py-1 border border-blue-100">
                    #{tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-blue-400 hover:text-blue-600 leading-none ml-0.5">×</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-300">태그 없음</p>
            )}
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
            ) : '저장'}
          </button>
        </form>

      </div>
    </main>
  );
}
