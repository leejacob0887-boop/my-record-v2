import { supabase } from '@/lib/supabase'
import { getTodayKST } from '@/lib/dateUtils'

export interface Todo {
  id: string
  user_id: string
  content: string
  is_done: boolean
  due_date: string | null
  created_at: string
}

export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getTodayTodos(): Promise<Todo[]> {
  const today = getTodayKST()
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('due_date', today)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addTodo(content: string, due_date?: string): Promise<Todo> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('todos')
    .insert({ content, due_date: due_date ?? getTodayKST(), user_id: user.id })
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

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
