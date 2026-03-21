'use client'

// calendar/layout.tsx — 기존 calendar/page.tsx 건드리지 않고 리마인더 FAB 주입

import { useState } from 'react'
import { Bell } from 'lucide-react'
import ReminderSheet from '@/components/calendar/ReminderSheet'

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  const [showReminder, setShowReminder] = useState(false)

  return (
    <>
      {children}

      {/* 알림 추가 FAB — 캘린더 페이지 우하단 */}
      <button
        onClick={() => setShowReminder(true)}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-[#0F6E56] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        aria-label="알림 추가"
      >
        <Bell size={20} color="white" />
      </button>

      {showReminder && (
        <ReminderSheet onClose={() => setShowReminder(false)} />
      )}
    </>
  )
}
