'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import TodoInput from '@/components/todo/TodoInput'
import TodoList from '@/components/todo/TodoList'
import {
  getTodos,
  getTodayTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  updateTodoOrder,
  getNextDueDate,
  type Todo,
  type Priority,
  type Recurrence,
} from '@/lib/todos'

type Filter = 'today' | 'all'

export default function TodosPage() {
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  const fetchTodos = useCallback(async (f: Filter) => {
    setLoading(true)
    try {
      const data = f === 'today' ? await getTodayTodos() : await getTodos()
      setTodos(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos(filter)
  }, [filter, fetchTodos])

  const handleAdd = async (content: string, due_date?: string, priority?: Priority, recurrence?: Recurrence) => {
    try {
      const newTodo = await addTodo(content, due_date, priority, recurrence)
      setTodos((prev) => {
        const next = [newTodo, ...prev]
        const ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
        return [...next].sort((a, b) => (ORDER[a.priority] ?? 1) - (ORDER[b.priority] ?? 1))
      })
    } catch (e) {
      console.error('[addTodo error]', e)
    }
  }

  const handleToggle = async (id: string, is_done: boolean) => {
    const todo = todos.find((t) => t.id === id)
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, is_done } : t)))
    try {
      await toggleTodo(id, is_done)
      // 반복 할일 완료 시 다음 항목 자동 생성
      if (is_done && todo?.recurrence) {
        const nextDue = getNextDueDate(todo.due_date, todo.recurrence)
        const newTodo = await addTodo(todo.content, nextDue, todo.priority, todo.recurrence)
        setTodos((prev) => [newTodo, ...prev])
      }
    } catch {
      fetchTodos(filter)
    }
  }

  const handleReorder = async (reordered: Todo[]) => {
    setTodos(reordered)
    try {
      await Promise.all(reordered.map((todo, index) => updateTodoOrder(todo.id, index)))
    } catch {
      fetchTodos(filter)
    }
  }

  const handleDelete = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    try {
      await deleteTodo(id)
    } catch {
      fetchTodos(filter)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F4] dark:bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-[#FAF8F4] dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-base font-bold text-gray-800 dark:text-gray-100">할 일</h1>
      </div>

      <div className="flex-1 px-4 py-4 pb-24 max-w-[430px] w-full mx-auto flex flex-col gap-4">
        <TodoInput onAdd={handleAdd} />
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-8">불러오는 중...</p>
        ) : (
          <TodoList
            todos={todos}
            filter={filter}
            onFilterChange={setFilter}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        )}
      </div>
    </div>
  )
}
