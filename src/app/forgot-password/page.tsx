'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://my-record-v2.vercel.app/reset-password',
    });
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-3xl mb-3">📬</p>
          <p className="text-base font-semibold text-gray-800">이메일을 확인하세요</p>
          <p className="text-sm text-gray-400 mt-1">비밀번호 재설정 링크를 보냈습니다.</p>
          <Link href="/auth/login" className="inline-block mt-6 text-sm text-[#4A90D9] font-semibold">
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">비밀번호 찾기</h1>
          <p className="text-sm text-gray-400 mt-1">가입한 이메일로 재설정 링크를 보내드립니다</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4A90D9] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A90D9] text-white rounded-2xl py-3.5 text-sm font-semibold hover:bg-[#3A7FC9] transition-colors disabled:opacity-60"
          >
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          <Link href="/auth/login" className="text-[#4A90D9] font-semibold">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}
