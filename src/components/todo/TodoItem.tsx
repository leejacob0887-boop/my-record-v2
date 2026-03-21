'use client'

import { CheckCircle, Circle, Trash2 } from 'lucide-react'
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

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  const status = getDueDateStatus(todo.due_date)

  const checkColor =
    status === 'overdue' ? '#ef4444'
    : status === 'today' ? '#f97316'
    : '#d1d5db'

  const contentClass = todo.is_done
    ? 'line-through text-gray-400 dark:text-gray-500'
    : status === 'overdue' ? 'text-red-600 dark:text-red-400'
    : status === 'today' ? 'text-orange-600 dark:text-orange-400'
    : 'text-gray-800 dark:text-gray-100'

  const badgeClass =
    status === 'overdue' ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400'
    : status === 'today' ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400'
    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
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
        {todo.due_date && !todo.is_done && (
          <span className={`text-xs px-1.5 py-0.5 rounded w-fit font-medium ${badgeClass}`}>
            {formatDueLabel(todo.due_date, status)}
          </span>
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
  )
}
