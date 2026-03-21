'use client'

import { useState } from 'react'
import { X, Plus, Clock, Trash2, Pencil, Circle, CheckCircle } from 'lucide-react'
import type { CalendarEvent } from '@/lib/events'
import type { Todo } from '@/lib/todos'

interface Props {
  date: string  // 'YYYY-MM-DD'
  events: CalendarEvent[]
  todos: Todo[]
  onClose: () => void
  onAddEvent: () => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
  onToggleTodo: (id: string, is_done: boolean) => void
}

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

function formatDateHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = DAY_NAMES[new Date(y, m - 1, d).getDay()]
  return `${m}월 ${d}일 ${dow}`
}

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return '하루 종일'
  if (!end) return start
  return `${start} ~ ${end}`
}

export default function CalendarDaySheet({
  date,
  events,
  todos,
  onClose,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleTodo,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.start_time && !b.start_time) return 0
    if (!a.start_time) return 1
    if (!b.start_time) return -1
    return a.start_time.localeCompare(b.start_time)
  })

  async function handleDelete(id: string) {
    if (deletingId === id) {
      onDeleteEvent(id)
      setDeletingId(null)
    } else {
      setDeletingId(id)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-[#FAF8F4] dark:bg-gray-900 rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
        {/* 핸들 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
            {formatDateHeader(date)}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-5">
          {/* 일정 섹션 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">일정</h3>
              <button
                onClick={onAddEvent}
                className="flex items-center gap-1 text-xs text-[#0F6E56] font-medium"
              >
                <Plus size={14} />
                추가
              </button>
            </div>

            {sortedEvents.length === 0 ? (
              <div className="text-sm text-gray-400 dark:text-gray-500 py-3 text-center bg-white dark:bg-gray-800 rounded-xl">
                일정이 없어요
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-start gap-3"
                  >
                    <div className="w-1 self-stretch rounded-full bg-[#0F6E56] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatTimeRange(event.start_time, event.end_time)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Pencil size={13} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                          deletingId === event.id
                            ? 'bg-red-50 dark:bg-red-900/30'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Trash2
                          size={13}
                          className={deletingId === event.id ? 'text-red-500' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {deletingId && (
              <p className="text-xs text-red-400 text-center mt-1">한 번 더 누르면 삭제됩니다</p>
            )}
          </section>

          {/* 할일 섹션 */}
          {todos.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                할일
              </h3>
              <div className="flex flex-col gap-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <button
                      onClick={() => onToggleTodo(todo.id, !todo.is_done)}
                      className="flex-shrink-0"
                    >
                      {todo.is_done ? (
                        <CheckCircle size={18} color="#0F6E56" />
                      ) : (
                        <Circle size={18} className="text-gray-300" />
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        todo.is_done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {todo.content}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 하단 일정 추가 버튼 */}
        <div className="px-5 pb-8 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onAddEvent}
            className="w-full py-3 bg-[#0F6E56] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            일정 추가
          </button>
        </div>
      </div>
    </div>
  )
}
