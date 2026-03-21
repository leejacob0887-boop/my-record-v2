'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { requestFCMToken } from '@/lib/firebase'
import { addReminder } from '@/lib/reminders'

interface Props {
  title: string
  remindAt: Date    // UTC
  displayLabel?: string
  source?: 'chat' | 'calendar'
  sourceId?: string
  /** true이면 마운트 즉시 handleConfirm 자동 실행 */
  autoConfirm?: boolean
  onClose: () => void
}

// KST 변환 포맷 (표시용)
function formatKST(utcDate: Date): string {
  const kst = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000)
  const month = kst.getUTCMonth() + 1
  const day = kst.getUTCDate()
  const hour = kst.getUTCHours()
  const min = kst.getUTCMinutes()
  const period = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  const minStr = min > 0 ? ` ${min}분` : ''
  return `${month}월 ${day}일 ${period} ${h}시${minStr}`
}

export default function ReminderPrompt({
  title,
  remindAt,
  displayLabel,
  source = 'chat',
  sourceId,
  autoConfirm = false,
  onClose,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle')

  // autoConfirm: 마운트 즉시 confirm 실행 (텍스트 동의 응답)
  useEffect(() => {
    if (autoConfirm && status === 'idle') {
      handleConfirm()
    }
    // handleConfirm은 렌더마다 재생성되지 않으므로 의존성에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConfirm])

  async function handleConfirm() {
    setStatus('loading')
    try {
      const token = await requestFCMToken()
      if (!token) {
        // VAPID 키 미설정이거나 권한 거부 → 토큰 없이 저장 (서버사이드 fallback)
        await addReminder({
          title,
          remindAt,
          fcmToken: null,
          source,
          sourceId,
        })
      } else {
        await addReminder({
          title,
          remindAt,
          fcmToken: token,
          source,
          sourceId,
        })
      }
      setStatus('done')
      setTimeout(onClose, 1500)
    } catch {
      setStatus('denied')
    }
  }

  const label = displayLabel || formatKST(remindAt)

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-[400px]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-4">
        {status === 'done' ? (
          <div className="flex items-center gap-2 text-[#0F6E56] text-sm font-medium py-1">
            <Bell size={16} />
            <span>알림이 설정되었어요!</span>
          </div>
        ) : status === 'denied' ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-500">알림 설정에 실패했어요.</p>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2">
                <Bell size={16} className="text-[#0F6E56] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    알림 설정해드릴까요?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {label} — {title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={status === 'loading'}
                className="flex-1 py-2 bg-[#0F6E56] text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-opacity"
              >
                {status === 'loading' ? '설정 중...' : '알림 설정'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors"
              >
                괜찮아요
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
