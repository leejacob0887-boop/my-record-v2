// api/cron/send-reminders/route.ts
// Vercel Cron이 매분 호출 → remind_at <= now AND is_sent=false 인 reminders를 FCM 발송

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminMessaging } from '@/lib/firebase-admin'

interface Reminder {
  id: string
  title: string
  remind_at: string
  fcm_token: string | null
}

export async function GET(req: NextRequest) {
  // Vercel Cron Secret 검증
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Supabase Service Role 클라이언트 (RLS 우회)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing Supabase env vars' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  // 발송 대상 조회: remind_at <= now AND is_sent = false
  const now = new Date().toISOString()
  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, title, remind_at, fcm_token')
    .eq('is_sent', false)
    .lte('remind_at', now)

  if (fetchError) {
    console.error('[send-reminders] fetch error:', fetchError)
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const messaging = getAdminMessaging()
  let sentCount = 0
  const failedIds: string[] = []

  for (const reminder of reminders as Reminder[]) {
    // fcm_token이 없으면 is_sent만 true로 처리 (graceful skip)
    if (reminder.fcm_token) {
      try {
        await messaging.send({
          token: reminder.fcm_token,
          notification: {
            title: '알림',
            body: reminder.title,
          },
          webpush: {
            notification: {
              icon: '/icons/icon-192x192.png',
            },
          },
        })
        sentCount++
      } catch (e) {
        console.error(`[send-reminders] FCM send failed for id=${reminder.id}:`, e)
        failedIds.push(reminder.id)
        // 토큰 만료/잘못된 토큰이면 is_sent=true로 처리하여 재시도 방지
      }
    }

    // 성공했거나 토큰이 없는 경우 모두 is_sent=true 업데이트
    if (!failedIds.includes(reminder.id)) {
      const { error: updateError } = await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminder.id)

      if (updateError) {
        console.error(`[send-reminders] update error for id=${reminder.id}:`, updateError)
      }
    }
  }

  return NextResponse.json({
    sent: sentCount,
    total: reminders.length,
    failed: failedIds.length,
  })
}
