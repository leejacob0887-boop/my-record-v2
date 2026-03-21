'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { requestFCMToken } from '@/lib/firebase'
import { addReminder } from '@/lib/reminders'

interface Props {
  onClose: () => void
}

const KST_OFFSET = 9 * 60 * 60 * 1000

export default function ReminderSheet({ onClose }: Props) {
  // KST 기본값 — 내일 오전 9시
  const tomorrow = new Date(Date.now() + KST_OFFSET + 86400000)
  const defaultDate = tomorrow.toISOString().slice(0, 10)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState('09:00')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSave() {
    if (!title.trim()) return
    setStatus('loading')
    try {
      // KST → UTC
      const [year, month, day] = date.split('-').map(Number)
      const [hh, mm] = time.split(':').map(Number)
      const kstMs = Date.UTC(year, month - 1, day, hh, mm, 0)
      const remindAt = new Date(kstMs - KST_OFFSET)

      const token = await requestFCMToken()
      await addReminder({ title: title.trim(), remindAt, fcmToken: token, source: 'calendar' })
      setStatus('done')
      setTimeout(onClose, 1500)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '저장에 실패했어요.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-2xl px-5 pt-5 pb-8 shadow-xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#0F6E56]" />
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">알림 추가</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {status === 'done' ? (
          <div className="py-6 text-center text-[#0F6E56] font-medium text-sm">
            ✅ 알림이 설정되었어요!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 내용"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[#0F6E56]"
              autoFocus
            />
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">날짜 (KST)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[#0F6E56]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">시간 (KST)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[#0F6E56]"
              />
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-500">{errorMsg}</p>
            )}
            <button
              onClick={handleSave}
              disabled={!title.trim() || status === 'loading'}
              className="w-full py-3 bg-[#0F6E56] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
            >
              {status === 'loading' ? '설정 중...' : '알림 설정'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
