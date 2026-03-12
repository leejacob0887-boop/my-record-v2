'use client';

import { useCallback, useState } from 'react';
import { Moment } from '@/lib/types';
import ImagePicker from './ImagePicker';
import MicButton from './MicButton';
import { useSpeechInput } from '@/lib/useSpeechInput';

interface MomentFormProps {
  initial?: Partial<Moment>;
  onSubmit: (data: { text: string; imageBase64?: string }) => void;
}

export default function MomentForm({ initial, onSubmit }: MomentFormProps) {
  const [text, setText] = useState(initial?.text ?? '');
  const [imageBase64, setImageBase64] = useState<string | undefined>(initial?.imageBase64);

  const handleVoiceResult = useCallback((text: string) => {
    setText(prev => prev ? prev + ' ' + text : text);
  }, []);
  const { isRecording, isSupported, error: voiceError, toggle } = useSpeechInput(handleVoiceResult);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), imageBase64 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500">메모</label>
          {isSupported && <MicButton isRecording={isRecording} onClick={toggle} />}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="지금 무슨 생각을 하고 있나요?"
          rows={4}
          maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
          required
        />
        <p className="text-right text-xs text-gray-400 mt-1">{text.length}/500</p>
        {voiceError && <p className="text-xs text-red-400 mt-1">{voiceError}</p>}
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">사진</label>
        <ImagePicker value={imageBase64} onChange={setImageBase64} />
      </div>
      <button
        type="submit"
        className="w-full bg-amber-400 text-white rounded-xl py-3 text-sm font-medium hover:bg-amber-500 transition-colors"
      >
        기록하기
      </button>
    </form>
  );
}
