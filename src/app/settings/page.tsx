'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PinLock from '@/components/PinLock';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();

  const [hasPin, setHasPin] = useState(() =>
    typeof window !== 'undefined' ? !!localStorage.getItem('app_pin') : false
  );
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  // ── PIN handlers ──────────────────────────────────────────
  const handlePinSetupSuccess = () => {
    setHasPin(true);
    setShowPinSetup(false);
  };

  const handleRemovePin = () => {
    if (!confirm('PIN을 해제할까요?')) return;
    localStorage.removeItem('app_pin');
    sessionStorage.removeItem('pin_authed');
    setHasPin(false);
  };

  // ── Backup handlers ───────────────────────────────────────
  const handleExport = () => {
    const keys = Object.keys(localStorage).filter(
      k => k.startsWith('diary_') || k === 'moments_list' || k === 'ideas_list'
    );
    const data: Record<string, unknown> = {};
    keys.forEach(k => {
      const raw = localStorage.getItem(k);
      if (raw) data[k] = JSON.parse(raw);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-record-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target!.result as string) as Record<string, unknown>;
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        setImportMsg('가져오기 완료! 새로고침합니다...');
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setImportMsg('파일을 읽을 수 없습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (showPinSetup) {
    return (
      <PinLock
        mode="setup"
        onSuccess={handlePinSetupSuccess}
        onCancel={() => setShowPinSetup(false)}
      />
    );
  }

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
          <span className="text-base font-semibold text-gray-800 dark:text-gray-100">설정</span>
          <div className="w-9 h-9" />
        </div>

        {/* PIN section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">앱 잠금</p>
              <p className="text-xs text-gray-400 mt-0.5">PIN 4자리로 앱을 보호하세요</p>
            </div>
          </div>
          {hasPin ? (
            <button
              onClick={handleRemovePin}
              className="w-full text-center bg-red-50 border border-red-100 text-red-400 rounded-2xl py-3 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              PIN 해제
            </button>
          ) : (
            <button
              onClick={() => setShowPinSetup(true)}
              className="w-full text-center bg-[#4A90D9] text-white rounded-2xl py-3 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors"
            >
              PIN 설정
            </button>
          )}
          {hasPin && (
            <p className="text-center text-xs text-[#4A90D9] mt-3">잠금 활성화됨</p>
          )}
        </div>

        {/* Backup section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 15 21 19 3 19 3 15" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">데이터 백업</p>
              <p className="text-xs text-gray-400 mt-0.5">기록을 JSON 파일로 내보내고 가져옵니다</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 text-center bg-[#4A90D9] text-white rounded-2xl py-3 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors"
            >
              내보내기
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 text-center bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl py-3 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              가져오기
            </button>
          </div>
          {importMsg && (
            <p className="text-center text-xs text-[#4A90D9] mt-3">{importMsg}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {/* Account section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">계정</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user ? user.email : '로그인하면 클라우드에 저장됩니다'}
              </p>
            </div>
          </div>
          {user ? (
            <button
              onClick={async () => { await signOut(); router.push('/'); }}
              className="w-full text-center bg-red-50 border border-red-100 text-red-400 rounded-2xl py-3 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <div className="flex gap-3">
              <Link
                href="/auth/login"
                className="flex-1 text-center bg-[#4A90D9] text-white rounded-2xl py-3 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="flex-1 text-center bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl py-3 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>

        {/* App info */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-300">나의 기록 v2</p>
        </div>

      </div>
    </main>
  );
}
