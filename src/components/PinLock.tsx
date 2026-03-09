'use client';

import { useState } from 'react';

interface PinLockProps {
  mode: 'enter' | 'setup';
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PinLock({ mode, onSuccess, onCancel }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input'); // setup only
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const current = step === 'confirm' ? confirmPin : pin;
  const setter = step === 'confirm' ? setConfirmPin : setPin;

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handlePress = (digit: string) => {
    if (current.length >= 4) return;
    const next = current + digit;
    setter(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (mode === 'enter') {
          const saved = localStorage.getItem('app_pin');
          if (next === saved) {
            sessionStorage.setItem('pin_authed', '1');
            onSuccess();
          } else {
            setter('');
            triggerShake('PIN이 올바르지 않습니다');
          }
        } else {
          // setup mode
          if (step === 'input') {
            setStep('confirm');
            setConfirmPin('');
            setError('');
          } else {
            if (next === pin) {
              localStorage.setItem('app_pin', pin);
              sessionStorage.setItem('pin_authed', '1');
              onSuccess();
            } else {
              setStep('input');
              setPin('');
              setConfirmPin('');
              triggerShake('PIN이 일치하지 않습니다. 다시 입력해주세요.');
            }
          }
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setter(prev => prev.slice(0, -1));
    setError('');
  };

  const title =
    mode === 'enter'
      ? 'PIN 입력'
      : step === 'input'
      ? 'PIN 설정'
      : 'PIN 확인';

  const subtitle =
    mode === 'enter'
      ? '앱을 잠금 해제하려면 PIN을 입력하세요'
      : step === 'input'
      ? '사용할 4자리 PIN을 입력하세요'
      : '같은 PIN을 한 번 더 입력하세요';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F4]">
      <div className="w-full max-w-[320px] px-6 flex flex-col items-center">

        {/* Lock icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#4A90D9] flex items-center justify-center mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1">{title}</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">{subtitle}</p>

        {/* PIN dots */}
        <div className={`flex gap-4 mb-3 ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                current.length > i
                  ? 'bg-[#4A90D9] border-[#4A90D9]'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <p className={`text-xs text-red-400 mb-6 h-4 text-center ${error ? '' : 'invisible'}`}>
          {error || '-'}
        </p>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1','2','3','4','5','6','7','8','9'].map(d => (
            <button
              key={d}
              onClick={() => handlePress(d)}
              className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-xl font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
            >
              {d}
            </button>
          ))}
          {/* Cancel / 0 / Delete */}
          <button
            onClick={onCancel}
            className={`h-16 rounded-2xl text-sm text-gray-400 hover:bg-gray-100 transition-colors ${!onCancel ? 'invisible' : ''}`}
          >
            취소
          </button>
          <button
            onClick={() => handlePress('0')}
            className="h-16 rounded-2xl bg-white border border-gray-100 shadow-sm text-xl font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="삭제"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
