const KST_OFFSET = 9 * 60 * 60 * 1000;

/** ISO 문자열을 KST 기준 Date 객체로 변환 */
export function toKST(isoString: string): Date {
  return new Date(new Date(isoString).getTime() + KST_OFFSET);
}

/** ISO 문자열을 KST 기준 'YYYY-MM-DD' 날짜 문자열로 변환 */
export function toKSTDateString(isoString: string): string {
  return toKST(isoString).toISOString().slice(0, 10);
}

/** 오늘 날짜를 KST 기준 'YYYY-MM-DD'로 반환 */
export function getTodayKST(): string {
  return new Date(Date.now() + KST_OFFSET).toISOString().slice(0, 10);
}

/** 마감일 상태 반환 (KST 기준) */
export type DueDateStatus = 'overdue' | 'today' | 'upcoming' | 'none'

export function getDueDateStatus(due_date: string | null): DueDateStatus {
  if (!due_date) return 'none'
  const today = getTodayKST()
  if (due_date < today) return 'overdue'
  if (due_date === today) return 'today'
  return 'upcoming'
}

/** createdAt 기준 KST 'YYYY-MM-DD HH:MM' 포맷 반환 (date 파라미터 무시) */
export function formatDateTime(_date: string, createdAt: string): string {
  const kst = toKST(createdAt);
  const kstDate = kst.toISOString().slice(0, 10);
  const hh = kst.getUTCHours().toString().padStart(2, '0');
  const mm = kst.getUTCMinutes().toString().padStart(2, '0');
  return `${kstDate} ${hh}:${mm}`;
}
