'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { CalendarEvent } from '@/lib/events'

interface Props {
  initialDate: string
  event?: CalendarEvent  // 수정 모드
  onSave: (data: { title: string; date: string; start_time: string | null; end_time: string | null; description: string | null }) => Promise<void>
  onClose: () => void
}

export default function EventForm({ initialDate, event, onSave, onClose }: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? initialDate)
  const [startTime, setStartTime] = useState(event?.start_time ?? '')
  const [endTime, setEndTime] = useState(event?.end_time ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        date,
        start_time: startTime || null,
        end_time: endTime || null,
        description: description.trim() || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-white dark:bg-gray-900 rounded-t-2xl px-5 pt-5 pb-8 shadow-xl">
        {/* 핸들 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
            {event ? '일정 수정' : '일정 추가'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 제목 */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none border border-transparent focus:border-[#0F6E56]"
              autoFocus
            />
          </div>

          {/* 날짜 */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[#0F6E56]"
            />
          </div>

          {/* 시간 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">시작 시간</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[#0F6E56]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">종료 시간</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 outline-none border border-transparent focus:border-[#0F6E56]"
              />
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">메모 (선택)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none resize-none border border-transparent focus:border-[#0F6E56]"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="w-full py-3 bg-[#0F6E56] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {saving ? '저장 중...' : event ? '수정하기' : '추가하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
