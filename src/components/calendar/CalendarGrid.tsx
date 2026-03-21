'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  year: number
  month: number  // 1-based
  eventDates: Set<string>  // 'YYYY-MM-DD' strings
  selectedDate: string | null
  today: string  // 'YYYY-MM-DD'
  onPrev: () => void
  onNext: () => void
  onSelectDate: (date: string) => void
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarGrid({
  year,
  month,
  eventDates,
  selectedDate,
  today,
  onPrev,
  onNext,
  onSelectDate,
}: Props) {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()

  // 6행 × 7열 = 42칸
  const cells: Array<{ date: string; day: number; isCurrentMonth: boolean }> = []

  // 이전 달 빈 칸
  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    cells.push({
      date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
    })
  }

  // 이번 달
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: true,
    })
  }

  // 다음 달 빈 칸 (6행 채우기)
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    cells.push({
      date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      day: d,
      isCurrentMonth: false,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
      {/* 헤더: 년/월 + 이전/다음 */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={onPrev}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <span className="text-base font-bold text-gray-800 dark:text-gray-100">
          {year}년 {month}월
        </span>
        <button
          onClick={onNext}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-2 pb-1">
        {DAY_NAMES.map((name, i) => (
          <div
            key={name}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-1">
        {cells.map(({ date, day, isCurrentMonth }) => {
          const isToday = date === today
          const isSelected = date === selectedDate
          const hasEvent = eventDates.has(date)
          const isSun = new Date(date).getDay() === 0
          const isSat = new Date(date).getDay() === 6

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className="flex flex-col items-center justify-center py-1 gap-0.5"
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  isToday
                    ? 'bg-[#0F6E56] text-white'
                    : isSelected
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    : !isCurrentMonth
                    ? 'text-gray-300 dark:text-gray-600'
                    : isSun
                    ? 'text-red-400'
                    : isSat
                    ? 'text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {day}
              </span>
              {/* 일정 도트 */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                  hasEvent && isCurrentMonth ? 'opacity-100' : 'opacity-0'
                } ${isToday ? 'bg-white/60' : 'bg-[#0F6E56]'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
