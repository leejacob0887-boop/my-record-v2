'use client'

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import type { Todo } from '@/lib/todos'
import TodoItem from './TodoItem'

type Filter = 'today' | 'all'

interface Props {
  todos: Todo[]
  filter: Filter
  onFilterChange: (f: Filter) => void
  onToggle: (id: string, is_done: boolean) => void
  onDelete: (id: string) => void
  onReorder: (todos: Todo[]) => void
}

export default function TodoList({ todos, filter, onFilterChange, onToggle, onDelete, onReorder }: Props) {
  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘' },
  ]

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    onReorder(arrayMove(todos, oldIndex, newIndex))
  }

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
