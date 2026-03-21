'use client'

import { useState } from 'react'
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
import { ChevronDown, ChevronRight } from 'lucide-react'
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
  const [doneExpanded, setDoneExpanded] = useState(false)

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'today', label: '오늘' },
  ]

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const activeTodos = todos.filter((t) => !t.is_done)
  const doneTodos = todos.filter((t) => t.is_done)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // Drag only within active todos
    const oldIndex = activeTodos.findIndex((t) => t.id === active.id)
    const newIndex = activeTodos.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(activeTodos, oldIndex, newIndex)
    onReorder([...reordered, ...doneTodos])
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
        <div className="flex flex-col gap-2">
          {/* 미완료 목록 (드래그 가능) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activeTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {activeTodos.map((todo) => (
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

          {/* 완료 목록 접기/펼치기 */}
          {doneTodos.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => setDoneExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium px-1 py-1 w-fit"
              >
                {doneExpanded
                  ? <ChevronDown size={14} />
                  : <ChevronRight size={14} />
                }
                완료 {doneTodos.length}개
              </button>

              {doneExpanded && (
                <div className="flex flex-col gap-2">
                  {doneTodos.map((todo) => (
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
          )}
        </div>
      )}
    </div>
  )
}
