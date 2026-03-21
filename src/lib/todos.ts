import { supabase } from '@/lib/supabase'
import { getTodayKST } from '@/lib/dateUtils'

export type Priority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  user_id: string
  content: string
  is_done: boolean
  due_date: string | null
  priority: Priority
  created_at: string
  sort_order: number | null
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

function sortByPriority(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority ?? 'medium']
    const pb = PRIORITY_ORDER[b.priority ?? 'medium']
    return pa !== pb ? pa - pb : 0
  })
}

function sortByOrder(todos: Todo[]): Todo[] {
  const hasOrder = todos.some((t) => t.sort_order != null)
  if (!hasOrder) return sortByPriority(todos)
  return [...todos].sort((a, b) => {
    const oa = a.sort_order ?? 9999
    const ob = b.sort_order ?? 9999
    return oa - ob
  })
}

export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return sortByOrder(data ?? [])
}

export async function getTodayTodos(): Promise<Todo[]> {
  const today = getTodayKST()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('due_date', today)
    .order('created_at', { ascending: false })
  if (error) throw error
  return sortByOrder(data ?? [])
}

export async function addTodo(
  content: string,
  due_date?: string,
  priority: Priority = 'medium'
): Promise<Todo> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('todos')
    .insert({ content, due_date: due_date ?? getTodayKST(), user_id: user.id, priority })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleTodo(id: string, is_done: boolean): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({ is_done })
    .eq('id', id)
  if (error) throw error
}

export async function updateTodoOrder(id: string, sort_order: number): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({ sort_order })
    .eq('id', id)
  if (error) throw error
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
