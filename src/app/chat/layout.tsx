'use client'

// chat/layout.tsx — 기존 chat/page.tsx 건드리지 않고 리마인더 감지를 주입
// localStorage 폴링으로 새 메시지를 감지 → 시간 표현 + 리마인더 키워드 → 알림 제안

import { useState, useEffect, useRef } from 'react'
import ReminderPrompt from '@/components/ReminderPrompt'
import { parseReminderIntent } from '@/lib/parseReminderIntent'

const CHAT_KEY = 'chat:history'
const SHOWN_KEY = 'reminder:shown-ids'

// 텍스트 동의 키워드 — "응"/"네"/"설정해줘" 등
const CONSENT_KEYWORDS = ['응', '네', '설정해줘', '설정해 줘', '알림 설정', '해줘', 'ㅇㅇ', '예']

function isConsentMessage(text: string): boolean {
  const trimmed = text.trim()
  return CONSENT_KEYWORDS.some((kw) => trimmed === kw || trimmed.startsWith(kw))
}

type StoredMsg = { id: string; role: string; content: string }

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<{
    title: string
    remindAt: Date
    displayLabel: string
  } | null>(null)
  const [autoConfirm, setAutoConfirm] = useState(false)
  const lastIdRef = useRef('')

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const raw = localStorage.getItem(CHAT_KEY)
        if (!raw) return

        const msgs: StoredMsg[] = JSON.parse(raw)
        // 마지막 user 메시지
        const last = [...msgs].reverse().find((m) => m.role === 'user')
        if (!last || last.id === lastIdRef.current) return

        // 이미 이 메시지에 대해 보여줬으면 스킵
        const shown: string[] = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? '[]')
        if (shown.includes(last.id)) return

        // pending 상태에서 텍스트 동의 감지 → autoConfirm
        if (pending && isConsentMessage(last.content)) {
          lastIdRef.current = last.id
          localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown.slice(-20), last.id]))
          setAutoConfirm(true)
          return
        }

        const result = parseReminderIntent(last.content)
        if (result.isReminderIntent && result.remindAt) {
          lastIdRef.current = last.id
          // 다시 안 보이도록 기록
          localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown.slice(-20), last.id]))
          setAutoConfirm(false)
          setPending({
            title: result.title,
            remindAt: result.remindAt,
            displayLabel: result.displayLabel ?? '',
          })
        }
      } catch {
        // parse 실패 무시
      }
    }, 800)

    return () => clearInterval(intervalId)
  }, [pending])

  return (
    <>
      {children}
      {pending && (
        <ReminderPrompt
          title={pending.title}
          remindAt={pending.remindAt}
          displayLabel={pending.displayLabel}
          source="chat"
          autoConfirm={autoConfirm}
          onClose={() => {
            setPending(null)
            setAutoConfirm(false)
          }}
        />
      )}
    </>
  )
}
