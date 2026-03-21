'use client'

import { useRef, useState } from 'react'
import { CheckCircle, Circle, Trash2, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Todo } from '@/lib/todos'
import { getDueDateStatus } from '@/lib/dateUtils'

interface Props {
  todo: Todo
  onToggle: (id: string, is_done: boolean) => void
  onDelete: (id: string) => void
}

function formatDueLabel(due_date: string, status: string): string {
  const [, m, d] = due_date.split('-')
  const date = `${parseInt(m)}/${parseInt(d)}`
  if (status === 'today') return '오늘 마감'
  if (status === 'overdue') return `${date} 초과`
  return `${date}까지`
}

const PRIORITY_BORDER: Record<string, string> = {
  high:   'border-l-4 border-l-red-400',
  medium: 'border-l-4 border-l-orange-400',
  low:    'border-l-4 border-l-gray-200 dark:border-l-gray-600',
}

const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  high:   { label: '높음', cls: 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' },
  medium: { label: '중간', cls: 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400' },
  low:    { label: '낮음', cls: 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500' },
}

const SWIPE_THRESHOLD = 72

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  const status = getDueDateStatus(todo.due_date)
  const priorityBorder = !todo.is_done ? (PRIORITY_BORDER[todo.priority] ?? PRIORITY_BORDER.medium) : ''

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id })

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  // Swipe state
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startXRef = useRef<number | null>(null)
  const startYRef = useRef<number | null>(null)
  const directionRef = useRef<'h' | 'v' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDragging) return
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    directionRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging || startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    const dy = e.touches[0].clientY - (startYRef.current ?? 0)

    if (!directionRef.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      directionRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
    }

    if (directionRef.current === 'h') {
      e.preventDefault()
      setIsSwiping(true)
      setSwipeX(Math.max(-120, Math.min(120, dx)))
    }
  }

  const handleTouchEnd = () => {
    if (directionRef.current === 'h') {
      if (swipeX < -SWIPE_THRESHOLD) {
        onDelete(todo.id)
      } else if (swipeX > SWIPE_THRESHOLD) {
        onToggle(todo.id, !todo.is_done)
      }
    }
    setSwipeX(0)
    setIsSwiping(false)
    startXRef.current = null
    directionRef.current = null
  }

  const checkColor =
    status === 'overdue' ? '#ef4444'
    : status === 'today' ? '#f97316'
    : '#d1d5db'

  const contentClass = todo.is_done
    ? 'line-through text-gray-400 dark:text-gray-500'
    : status === 'overdue' ? 'text-red-600 dark:text-red-400'
    : status === 'today' ? 'text-orange-600 dark:text-orange-400'
    : 'text-gray-800 dark:text-gray-100'

  const dueBadgeClass =
    status === 'overdue' ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
    : status === 'today' ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'

  const swipeProgress = Math.min(Math.abs(swipeX) / SWIPE_THRESHOLD, 1)

  return (
    <div ref={setNodeRef} style={sortableStyle} className="relative rounded-xl overflow-hidden">
      {/* 오른쪽 스와이프 배경 — 완료 */}
      <div
        className="absolute inset-0 flex items-center px-5"
        style={{ backgroundColor: `rgba(15, 110, 86, ${swipeX > 0 ? swipeProgress * 0.9 : 0})` }}
      >
        <CheckCircle size={22} color="white" />
      </div>

      {/* 왼쪽 스와이프 배경 — 삭제 */}
      <div
        className="absolute inset-0 flex items-center justify-end px-5"
        style={{ backgroundColor: `rgba(239, 68, 68, ${swipeX < 0 ? swipeProgress * 0.9 : 0})` }}
      >
        <Trash2 size={22} color="white" />
      </div>

      {/* 카드 본체 */}
      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${priorityBorder}`}
      >
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          aria-label="순서 변경"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => onToggle(todo.id, !todo.is_done)}
          className="flex-shrink-0"
          aria-label={todo.is_done ? '완료 해제' : '완료'}
        >
          {todo.is_done ? (
            <CheckCircle size={20} color="#0F6E56" />
          ) : (
            <Circle size={20} color={checkColor} />
          )}
        </button>
        <div className="flex-1 flex flex-col gap-0.5 min-w-0">
          <span className={`text-sm ${contentClass}`}>{todo.content}</span>
          {!todo.is_done && (
            <div className="flex gap-1 flex-wrap">
              {(() => {
                const badge = PRIORITY_BADGE[todo.priority] ?? PRIORITY_BADGE.medium
                return (
                  <span className={`text-xs px-1.5 py-0.5 rounded w-fit font-medium ${badge.cls}`}>
                    {badge.label}
                  </span>
                )
              })()}
              {todo.due_date && (
                <span className={`text-xs px-1.5 py-0.5 rounded w-fit font-medium ${dueBadgeClass}`}>
                  {formatDueLabel(todo.due_date, status)}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
          aria-label="삭제"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
