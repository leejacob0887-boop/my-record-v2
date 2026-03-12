'use client';

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export default function MicButton({ isRecording, onClick }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRecording ? '녹음 중지' : '음성 입력 시작'}
      className="relative flex items-center justify-center w-6 h-6"
    >
      {isRecording && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50 animate-ping" />
      )}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isRecording ? '#ef4444' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10"
      >
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
      </svg>
    </button>
  );
}
