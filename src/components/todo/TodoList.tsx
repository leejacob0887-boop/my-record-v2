'use client'

import type { Todo } from '@/lib/todos'
import TodoItem from './TodoItem'

type Filter = 'today' | 'all'

interface Props {
  todos: Todo[]
  filter: Filter
  onFilterChange: (f: Filter) => void
  onToggle: (id: string, is_done: boolean) => void
  onDelete: (id: string) => void
}

export default function TodoList({ todos, filter, onFilterChange, onToggle, onDelete }: Props) {
  const tabs: { key: Filter; label: string }[] = [
    { key: 'today', label: '오늘' },
    { key: 'all', label: '전체' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.key
                ? 'bg-white dark:bg-gray-700 text-[#0F6E56] shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {todos.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
          {filter === 'today' ? '오늘 할 일이 없어요 🎉' : '할 일이 없어요'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
