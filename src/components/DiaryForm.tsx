'use client';

import { useState } from 'react';
import { DiaryEntry } from '@/lib/types';
import ImagePicker from './ImagePicker';

interface DiaryFormProps {
  initial?: Partial<DiaryEntry>;
  onSubmit: (data: { date: string; title: string; content: string; imageBase64?: string }) => void | Promise<void>;
}

export default function DiaryForm({ initial, onSubmit }: DiaryFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date ?? today);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(initial?.imageBase64);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    await onSubmit({ date, title: title.trim(), content: content.trim(), imageBase64 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="오늘의 제목"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 어떤 하루였나요?"
          rows={8}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">사진</label>
        <ImagePicker value={imageBase64} onChange={setImageBase64} />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  );
}
