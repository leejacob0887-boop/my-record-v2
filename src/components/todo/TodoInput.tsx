'use client'

import { useState, useCallback } from 'react'
import { Plus, Mic, Calendar } from 'lucide-react'
import { useSpeechInput } from '@/lib/useSpeechInput'
import { parseTodoIntent, extractDueDate } from '@/lib/parseTodoIntent'

interface Props {
  onAdd: (content: string, due_date?: string) => void
}

export default function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const handleAdd = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const { content, due_date: parsedDate } = extractDueDate(trimmed)
    onAdd(content, parsedDate || dueDate || undefined)
    setValue('')
    setDueDate('')
    setShowPicker(false)
  }

  const handleVoiceResult = useCallback((text: string) => {
    const { isTodoIntent, content, due_date } = parseTodoIntent(text)
    if (isTodoIntent) {
      onAdd(content, due_date)
      return
    }
    const { content: parsedContent, due_date: parsedDate } = extractDueDate(text)
    if (parsedDate) {
      onAdd(parsedContent, parsedDate)
    } else {
      setValue(text)
    }
  }, [onAdd])

  const { isRecording, isSupported, toggle } = useSpeechInput(handleVoiceResult)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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
