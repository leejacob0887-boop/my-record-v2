// 리마인더 의도 감지 — parseEventIntent와 독립적인 별도 파일 (기존 코드 무변경)

const KST_OFFSET = 9 * 60 * 60 * 1000

function kstDateOffset(days: number): string {
  return new Date(Date.now() + KST_OFFSET + days * 86400000).toISOString().slice(0, 10)
}

function thisWeekday(weekday: number): string {
  const now = new Date(Date.now() + KST_OFFSET)
  const diff = (weekday - now.getUTCDay() + 7) % 7
  return kstDateOffset(diff === 0 ? 7 : diff)
}

const WEEKDAY_MAP: Record<string, number> = {
  '일요일': 0, '월요일': 1, '화요일': 2, '수요일': 3, '목요일': 4, '금요일': 5, '토요일': 6,
  '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6,
}

// 리마인더 의도 키워드 (시간 표현 + 이 키워드가 있어야 알림 제안)
const REMINDER_KEYWORDS = [
  '해야 해', '해야해', '잊지 마', '잊지마', '알려줘', '상기시켜', '챙겨줘',
  '챙겨야', '잊으면 안', '놓치면 안', '기억해', '먹어야', '먹어야 해',
  '가야 해', '가야해', '해야 되', '해야돼', '약', '병원', '회의', '수업', '예약',
  '제출', '마감', '출발', '탑승',
]

function parseDateExpr(expr: string): string | undefined {
  const e = expr.trim()
  if (e === '오늘') return kstDateOffset(0)
  if (e === '내일') return kstDateOffset(1)
  if (e === '모레') return kstDateOffset(2)

  const nextWeekMatch = e.match(/다음\s*주?\s*([월화수목금토일](?:요일)?)/)
  if (nextWeekMatch) {
    const key = nextWeekMatch[1]
    const day = WEEKDAY_MAP[key] ?? WEEKDAY_MAP[key + '요일']
    if (day !== undefined) {
      const now = new Date(Date.now() + KST_OFFSET)
      const diff = ((day - now.getUTCDay() + 7) % 7) || 7
      return kstDateOffset(diff + 7)
    }
  }

  for (const [name, day] of Object.entries(WEEKDAY_MAP)) {
    if (e.includes(name)) return thisWeekday(day)
  }

  const monthDay = e.match(/(\d{1,2})월\s*(\d{1,2})일/)
  if (monthDay) {
    const year = new Date(Date.now() + KST_OFFSET).getUTCFullYear()
    return `${year}-${monthDay[1].padStart(2, '0')}-${monthDay[2].padStart(2, '0')}`
  }

  return undefined
}

function parseTimeExpr(expr: string): string | undefined {
  const e = expr.trim()
  const match = e.match(/(오전|오후|저녁|아침|밤|낮)?\s*(\d{1,2})\s*시\s*(?:(\d{1,2})\s*분)?/)
  if (!match) return undefined

  let hour = parseInt(match[2])
  const minute = match[3] ? parseInt(match[3]) : 0
  const period = match[1]

  if (period === '오후' || period === '저녁' || period === '밤') {
    if (hour < 12) hour += 12
  } else if (period === '오전' || period === '아침') {
    if (hour === 12) hour = 0
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export interface ReminderParseResult {
  isReminderIntent: boolean
  title: string
  date?: string      // YYYY-MM-DD
  time?: string      // HH:MM
  remindAt?: Date    // UTC Date
  displayLabel?: string  // 사용자에게 보여줄 텍스트 (예: "내일 오전 9시")
}

export function parseReminderIntent(text: string): ReminderParseResult {
  const t = text.trim()

  // 시간 표현이 없으면 스킵
  const hasTime = /(?:오전|오후|저녁|아침|밤|낮)?\s*\d{1,2}\s*시/.test(t)
  if (!hasTime) return { isReminderIntent: false, title: '' }

  // 리마인더 키워드가 없으면 스킵
  const hasKeyword = REMINDER_KEYWORDS.some((k) => t.includes(k))
  if (!hasKeyword) return { isReminderIntent: false, title: '' }

  const datePatterns = [
    /다음\s*주?\s*[월화수목금토일](?:요일)?/,
    /이번\s*주?/,
    /다음\s*주?/,
    /\d{1,2}월\s*\d{1,2}일/,
    /오늘|내일|모레/,
    /[월화수목금토일]요일?/,
  ]

  const timePatterns = [
    /(?:오전|오후|저녁|아침|밤|낮)\s*\d{1,2}\s*시\s*(?:\d{1,2}\s*분)?/,
    /\d{1,2}\s*시\s*(?:\d{1,2}\s*분)?/,
  ]

  let dateStr: string | undefined
  let timeStr: string | undefined
  let remaining = t
  let rawDate = ''
  let rawTime = ''

  for (const pattern of datePatterns) {
    const match = remaining.match(pattern)
    if (match) {
      dateStr = parseDateExpr(match[0])
      if (dateStr) {
        rawDate = match[0]
        remaining = remaining.replace(match[0], ' ').trim()
        break
      }
    }
  }

  for (const pattern of timePatterns) {
    const match = remaining.match(pattern)
    if (match) {
      timeStr = parseTimeExpr(match[0])
      if (timeStr) {
        rawTime = match[0]
        remaining = remaining.replace(match[0], ' ').trim()
        break
      }
    }
  }

  if (!timeStr) return { isReminderIntent: false, title: '' }

  const finalDate = dateStr ?? kstDateOffset(0)
  const [hh, mm] = timeStr.split(':').map(Number)

  // KST → UTC 변환
  const [year, month, day] = finalDate.split('-').map(Number)
  const kstDate = new Date(Date.UTC(year, month - 1, day, hh, mm, 0))
  const remindAt = new Date(kstDate.getTime() - KST_OFFSET)

  const title = remaining
    .replace(/\s+/g, ' ')
    .trim() || t

  const displayLabel = `${rawDate ? rawDate + ' ' : ''}${rawTime}`

  return {
    isReminderIntent: true,
    title,
    date: finalDate,
    time: timeStr,
    remindAt,
    displayLabel: displayLabel.trim(),
  }
}
