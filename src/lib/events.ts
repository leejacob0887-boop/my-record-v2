import { supabase } from '@/lib/supabase'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  date: string           // 'YYYY-MM-DD'
  start_time: string | null  // 'HH:MM'
  end_time: string | null
  description: string | null
  created_at: string
}

export async function getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getEventsByDate(date: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('date', date)
    .order('start_time', { ascending: true, nullsFirst: true })
  if (error) throw error
  return data ?? []
}

export async function addEvent(
  event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>
): Promise<CalendarEvent> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({ ...event, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>>
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
  if (error) throw error
}
