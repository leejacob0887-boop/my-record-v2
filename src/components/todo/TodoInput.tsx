'use client'

import { useState, useCallback, useRef } from 'react'
import { Plus, Mic, Calendar } from 'lucide-react'
import { useSpeechInput } from '@/lib/useSpeechInput'
import { parseTodoIntent, extractDueDate } from '@/lib/parseTodoIntent'
import type { Priority } from '@/lib/todos'

const PRIORITY_OPTIONS: { value: Priority; label: string; active: string }[] = [
  { value: 'high',   label: '높음', active: 'bg-red-50 border-red-300 text-red-600 dark:bg-red-900/30 dark:border-red-700' },
  { value: 'medium', label: '중간', active: 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-900/30 dark:border-orange-700' },
  { value: 'low',    label: '낮음', active: 'bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-500' },
]

interface Props {
  onAdd: (content: string, due_date?: string, priority?: Priority) => void
}

export default function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [priority, setPriority] = useState<Priority>('medium')

  // ref로 관리해 useCallback deps에서 제외 → useSpeechInput 재초기화 방지
  const priorityRef = useRef<Priority>('medium')
  const onAddRef = useRef(onAdd)
  onAddRef.current = onAdd

  const handlePriorityChange = (p: Priority) => {
    priorityRef.current = p
    setPriority(p)
  }

  const handleAdd = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const { content, due_date: parsedDate } = extractDueDate(trimmed)
    onAdd(content, parsedDate || dueDate || undefined, priority)
    setValue('')
    setDueDate('')
    setShowPicker(false)
    priorityRef.current = 'medium'
    setPriority('medium')
  }

  // priority를 ref로 읽어서 deps에서 제거 → 우선순위 변경 시 SpeechRecognition 재초기화 방지
  const handleVoiceResult = useCallback((text: string) => {
    const { isTodoIntent, content, due_date } = parseTodoIntent(text)
    if (isTodoIntent) {
      onAddRef.current(content, due_date, priorityRef.current)
      return
    }
    const { content: parsedContent, due_date: parsedDate } = extractDueDate(text)
    if (parsedDate) {
      onAddRef.current(parsedContent, parsedDate, priorityRef.current)
    } else {
      setValue(text)
    }
  }, []) // deps 없음 — ref로 최신값 참조

  const { isRecording, isSupported, toggle } = useSpeechInput(handleVoiceResult)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* 입력 행 */}
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(value)}
          placeholder='"내일까지 보고서 제출" 또는 할 일 입력'
          className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-lg transition-colors ${
            showPicker || dueDate ? 'text-[#0F6E56] bg-[#0F6E56]/10' : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label="마감일 선택"
        >
          <Calendar size={16} />
        </button>
        {isSupported && (
          <button
            type="button"
            onClick={toggle}
            className="relative flex items-center justify-center w-8 h-8 flex-shrink-0"
            aria-label={isRecording ? '녹음 중지' : '음성 입력'}
          >
            {isRecording && (
              <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50 animate-ping" />
            )}
            <Mic size={18} color={isRecording ? '#ef4444' : '#9ca3af'} className="relative z-10" />
          </button>
        )}
        <button
          type="button"
          onClick={() => handleAdd(value)}
          disabled={!value.trim()}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#0F6E56] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
          aria-label="추가"
        >
          <Plus size={16} color="white" />
        </button>
      </div>

      {/* 우선순위 선택 행 */}
      <div className="flex gap-2 px-4 pb-3">
        {PRIORITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handlePriorityChange(opt.value)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              priority === opt.value
                ? opt.active
                : 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 날짜 picker */}
      {showPicker && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full text-sm bg-transparent outline-none text-gray-700 dark:text-gray-300"
          />
        </div>
      )}
    </div>
  )
}
