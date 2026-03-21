'use client';

import { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { Plus, Mic, Camera, Send } from 'lucide-react';
import { QuickButtonType } from './types';
import QuickButtons from './QuickButtons';

interface BottomInputAreaProps {
  inputText: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
  onCameraChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  isSending: boolean;
  onQuickButton: (type: QuickButtonType) => void;
  cameraInputRef: RefObject<HTMLInputElement | null>;
}

export default function BottomInputArea({
  inputText,
  onInputChange,
  onSend,
  onMic,
  onCameraChange,
  isRecording,
  isSending,
  onQuickButton,
  cameraInputRef,
}: BottomInputAreaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white dark:bg-gray-800 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-4 space-y-3 z-30"
      style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      <QuickButtons onSelect={onQuickButton} />
      {/* 입력창 */}
      <div className="flex items-center gap-2 bg-[#F4F2EE] dark:bg-gray-700 rounded-3xl px-3 py-2.5 shadow-inner overflow-hidden">
        <button className="text-gray-400 dark:text-gray-500 flex-shrink-0 p-1" aria-label="추가">
          <Plus size={20} />
        </button>
        <button
          onClick={onMic}
          className="flex-shrink-0 active:opacity-70 p-1"
          aria-label="마이크"
        >
          <Mic size={20} color={isRecording ? '#ef4444' : '#9CA3AF'} strokeWidth={1.8} />
        </button>
        <input
          className="flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
          placeholder="말하거나 입력하세요..."
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-shrink-0 active:opacity-70 p-1"
          aria-label="카메라"
        >
          <Camera size={20} color="#9CA3AF" strokeWidth={1.8} />
        </button>
        <button
          onClick={onSend}
          disabled={!inputText.trim() || isSending}
          className="w-8 h-8 rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:opacity-70 transition-opacity"
          aria-label="전송"
        >
          <Send size={14} color="white" />
        </button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onCameraChange}
      />
    </div>
  );
}
