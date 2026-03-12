'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMoments } from '@/lib/useMoments';
import ImagePicker from '@/components/ImagePicker';
import MicButton from '@/components/MicButton';
import { useSpeechInput } from '@/lib/useSpeechInput';

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

function MomentEditForm({ initial, onSubmit }: {
  initial: { text: string; date: string; imageBase64?: string };
  onSubmit: (data: { text: string; date: string; imageBase64?: string }) => void | Promise<void>;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [text, setText] = useState(initial.text);
  const [date, setDate] = useState(initial.date);
  const [imageBase64, setImageBase64] = useState<string | undefined>(initial.imageBase64);
  const [saving, setSaving] = useState(false);

  const handleVoiceResult = useCallback((t: string) => {
    setText(prev => prev ? prev + ' ' + t : t);
  }, []);
  const { isRecording, isSupported, toggle } = useSpeechInput(handleVoiceResult);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || saving) return;
    setSaving(true);
    await onSubmit({ text: text.trim(), date, imageBase64 });
  };

  return (
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
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500">메모</label>
          {isSupported && <MicButton isRecording={isRecording} onClick={toggle} />}
        </div>
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <label className="block text-xs text-gray-500 mb-2">사진</label>
        <ImagePicker value={imageBase64} onChange={setImageBase64} />
      </div>
      <button
        type="submit"
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
        ) : '저장'}
      </button>
    </form>
  );
}

export default function MomentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = useMoments();
  const moment = getById(id);

  if (!moment) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
        <div className="max-w-[430px] mx-auto px-4 pt-12">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-center text-gray-400 text-sm py-16">기록을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (data: { text: string; date: string; imageBase64?: string }) => {
    await update(id, data);
    router.push(`/moments/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] dark:bg-gray-900">
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
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">순간 수정</span>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors" aria-label="설정">
            <SettingsIcon />
          </button>
        </div>

        {/* Form */}
        <MomentEditForm initial={{ text: moment.text, date: moment.date, imageBase64: moment.imageBase64 }} onSubmit={handleSubmit} />

      </div>
    </main>
  );
}
