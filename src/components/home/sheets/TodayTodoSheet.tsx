'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, X, ClipboardList } from 'lucide-react';
import { getTodayTodos, toggleTodo, Todo } from '@/lib/todos';

interface Props {
  onClose: () => void;
}

export default function TodayTodoSheet({ onClose }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayTodos()
      .then(setTodos)
      .catch(() => setTodos([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (todo: Todo) => {
    const next = !todo.is_done;
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, is_done: next } : t)));
    await toggleTodo(todo.id, next).catch(() => {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, is_done: todo.is_done } : t)));
    });
  };

  const doneCount = todos.filter((t) => t.is_done).length;

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">오늘 할일</span>
          {todos.length > 0 && (
            <span className="ml-2 text-xs text-gray-400">{doneCount}/{todos.length}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="닫기"
        >
          <X size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <ClipboardList size={32} color="#D1D5DB" />
            <p className="text-sm text-gray-400">오늘 할일이 없어요</p>
          </div>
        ) : (
          todos.map((todo) => (
            <button
              key={todo.id}
              onClick={() => handleToggle(todo)}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-gray-700 last:border-none active:bg-gray-50 dark:active:bg-gray-700 text-left"
            >
              {todo.is_done ? (
                <CheckCircle2 size={20} color="#0F6E56" className="flex-shrink-0" />
              ) : (
                <Circle size={20} color="#D1D5DB" className="flex-shrink-0" />
              )}
              <span
                className={`text-sm flex-1 ${
                  todo.is_done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                {todo.content}
              </span>
              {todo.priority === 'high' && (
                <span className="text-xs text-red-400 flex-shrink-0">마감</span>
              )}
            </button>
          ))
        )}
      </div>
    </>
  );
}
