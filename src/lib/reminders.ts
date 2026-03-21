import { supabase } from './supabase'

export interface Reminder {
  id: string
  user_id: string
  title: string
  remind_at: string  // ISO UTC
  fcm_token: string | null
  source: 'chat' | 'calendar'
  source_id: string | null
  is_sent: boolean
  created_at: string
}

export async function addReminder(data: {
  title: string
  remindAt: Date      // UTC Date
  fcmToken: string | null
  source: 'chat' | 'calendar'
  sourceId?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { error } = await supabase.from('reminders').insert({
    user_id: user.id,
    title: data.title,
    remind_at: data.remindAt.toISOString(),
    fcm_token: data.fcmToken,
    source: data.source,
    source_id: data.sourceId ?? null,
    is_sent: false,
  })
  if (error) throw error
}

export async function getUpcomingReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_sent', false)
    .gte('remind_at', new Date().toISOString())
    .order('remind_at')
  if (error) throw error
  return data as Reminder[]
}

export async function deleteReminder(id: string) {
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw error
}
