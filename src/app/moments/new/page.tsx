'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMoments } from '@/lib/useMoments';
import ImagePicker from '@/components/ImagePicker';

export default function MomentNewPage() {
  const router = useRouter();
  const { add } = useMoments();

  const [text, setText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    add({ text: text.trim(), date: today, imageBase64 });
    router.push('/moments');
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-[430px] mx-auto px-5 flex flex-col min-h-screen">

        {/* Header */}
        <div className="flex items-center justify-between pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="뒤로가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-base font-semibold text-gray-800">지금 이 순간</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-xs text-gray-500 mb-2">지금 이 순간</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="지금 무슨 생각을 하고 있나요?"
              rows={5}
              maxLength={500}
              className="w-full text-sm text-gray-700 placeholder-gray-300 bg-transparent outline-none resize-none"
              required
            />
            <p className="text-right text-xs text-gray-400 mt-1">{text.length}/500</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-xs text-gray-500 mb-2">사진</label>
            <ImagePicker value={imageBase64} onChange={setImageBase64} />
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full bg-[#4A90D9] text-white rounded-2xl py-3.5 text-base font-semibold hover:bg-[#3A7FC9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            기록하기
          </button>
        </form>

      </div>
    </main>
  );
}
