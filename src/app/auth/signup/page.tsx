'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const createDefaultData = async (userId: string) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const twoDaysAgo = new Date(now.getTime() - 172800000).toISOString().slice(0, 10);
    const ts = now.toISOString();

    await Promise.all([
      supabase.from('diary_entries').insert([
        { id: crypto.randomUUID(), user_id: userId, date: twoDaysAgo, title: '오늘 감사한 일 3가지를 써보세요 🙏', content: '감사한 일들을 기록해보세요.', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, date: yesterday, title: '오늘 하루 어땠나요? ✏️', content: '하루를 돌아보며 자유롭게 써보세요.', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, date: today, title: '내일 하고 싶은 일은? 🌟', content: '내일의 나에게 하고 싶은 말을 적어보세요.', created_at: ts, updated_at: ts },
      ]),
      supabase.from('moments').insert([
        { id: crypto.randomUUID(), user_id: userId, date: today, text: '오늘 가장 기억에 남는 순간 📸', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, date: today, text: '지금 이 순간 느끼는 감정은? 💭', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, date: today, text: '오늘 만난 사람, 먹은 것, 본 것 🎯', created_at: ts, updated_at: ts },
      ]),
      supabase.from('ideas').insert([
        { id: crypto.randomUUID(), user_id: userId, title: '떠오르는 아이디어를 기록해보세요 💡', content: '아이디어를 자유롭게 적어보세요.', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, title: '해보고 싶은 것들 📝', content: '언젠가 꼭 해보고 싶은 것들을 적어보세요.', created_at: ts, updated_at: ts },
        { id: crypto.randomUUID(), user_id: userId, title: '나만의 버킷리스트 🚀', content: '인생에서 이루고 싶은 것들을 적어보세요.', created_at: ts, updated_at: ts },
      ]),
    ]);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      if (data.user) await createDefaultData(data.user.id);
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-base font-semibold text-gray-800">가입 완료!</p>
          <p className="text-sm text-gray-400 mt-1">이메일을 확인하고 로그인해 주세요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-5">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
          <p className="text-sm text-gray-400 mt-1">나만의 기록 공간을 만드세요</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4A90D9] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
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
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[#4A90D9] font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
