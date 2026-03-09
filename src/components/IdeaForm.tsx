'use client';

import { useState } from 'react';
import { Idea } from '@/lib/types';
import ImagePicker from './ImagePicker';

interface IdeaFormProps {
  initial?: Partial<Idea>;
  onSubmit: (data: { title: string; content: string; imageBase64?: string }) => void;
}

export default function IdeaForm({ initial, onSubmit }: IdeaFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(initial?.imageBase64);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title: title.trim(), content: content.trim(), imageBase64 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="아이디어 제목"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="아이디어를 자세히 적어보세요"
          rows={6}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-200"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">사진</label>
        <ImagePicker value={imageBase64} onChange={setImageBase64} />
      </div>
      <button
        type="submit"
        className="w-full bg-purple-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-purple-600 transition-colors"
      >
        저장
      </button>
    </form>
  );
}
