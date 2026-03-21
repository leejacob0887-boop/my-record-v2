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

function parseDateExpr(expr: string): string | undefined {
  const e = expr.trim()
  if (e === '오늘') return kstDateOffset(0)
  if (e === '내일') return kstDateOffset(1)
  if (e === '모레') return kstDateOffset(2)
  if (e === '이번주' || e === '이번 주') return thisWeekday(5)
  if (e === '다음주' || e === '다음 주') return kstDateOffset(7)

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

export function extractDueDate(text: string): { content: string; due_date?: string } {
  const match = text.trim().match(/^(.+)까지\s+(.+)$/)
  if (!match) return { content: text.trim() }

  const due_date = parseDateExpr(match[1])
  const content = match[2].trim()
  return due_date ? { content, due_date } : { content: text.trim() }
}

interface ParseResult {
  isTodoIntent: boolean
  content: string
  due_date?: string
}

const TODO_PATTERNS = [
  /^(.+)\s*할일\s*추가해?줘?[요.]?$/,
  /^(.+)\s*할일로?\s*추가해?줘?[요.]?$/,
  /^(.+)\s*할일에\s*추가해?줘?[요.]?$/,
  /^(.+)\s*할일\s*등록해?줘?[요.]?$/,
  /^(.+)\s*투두\s*추가해?줘?[요.]?$/,
  /^할일\s*추가해?줘?[요]?[:\s]+(.+)$/,
  /^투두\s*추가해?줘?[요]?[:\s]+(.+)$/,
  /^(.+)\s*to[\s-]?do\s*추가해?줘?[요.]?$/i,
]

export function parseTodoIntent(text: string): ParseResult {
  const trimmed = text.trim()
  for (const pattern of TODO_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) {
      const { content, due_date } = extractDueDate(match[1].trim())
      return { isTodoIntent: true, content, due_date }
    }
  }
  return { isTodoIntent: false, content: '' }
}
