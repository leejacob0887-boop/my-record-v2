# [Design] Daily Summary (오늘 하루 요약하기)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Daily Summary — 오늘 기록을 AI가 감성 요약해주는 기능 |
| 신규 파일 | `src/app/api/daily-summary/route.ts` |
| 수정 파일 | `src/app/calendar/page.tsx` |

---

## 1. 컴포넌트 구조

```
캘린더 페이지 (calendar/page.tsx)
├── 오늘의 기록 카드 (기존)
│   ├── 타입별 배지 (기존)
│   └── [신규] "✨ 오늘 하루 요약하기" 버튼
│       ├── 기록 없음: disabled + opacity-40
│       └── 로딩 중: 스피너 + "AI가 오늘을 돌아보고 있어요..."
└── [신규] 요약 모달 (조건부 렌더링)
    ├── 배경 딤 레이어 (클릭 시 닫기)
    └── 요약 카드 (slide-up)
        ├── 헤더: "✨ 오늘의 요약" + 날짜
        ├── 구분선
        ├── 요약 텍스트
        └── 버튼 행: [메모로 저장] [닫기]
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/app/api/daily-summary/route.ts` | 신규 | 요약 API 엔드포인트 |
| `src/app/calendar/page.tsx` | 수정 | 버튼 + 모달 + 저장 로직 |

---

## 3. API 설계

**파일**: `src/app/api/daily-summary/route.ts`

```ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

type RequestBody = {
  date: string;
  diary: { title: string; content: string }[];
  moments: { text: string }[];
  ideas: { title: string; content: string }[];
};

const SUMMARY_SYSTEM_PROMPT = `
당신은 사용자의 하루 기록을 읽고 따뜻하게 요약해주는 감성적인 AI입니다.
일기, 메모, 아이디어를 종합하여 2~4문장으로 오늘 하루를 요약해주세요.
- 사용자를 따뜻하게 격려하는 톤으로 작성
- 기록된 감정, 생각, 활동을 자연스럽게 엮어 표현
- 문어체가 아닌 부드러운 구어체 한국어로 작성
- 마무리에 짧은 응원 한 마디 포함
- 이모지 1~2개 자연스럽게 포함
요약 텍스트만 반환하세요. JSON이나 제목 불필요.
`.trim();

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { date, diary, moments, ideas }: RequestBody = await req.json();

  // 각 항목 200자 truncate 후 텍스트 조합
  const lines: string[] = [`📅 날짜: ${date}`];
  diary.forEach((d, i) => {
    lines.push(`\n[일기 ${i + 1}] ${d.title}`);
    lines.push(d.content.slice(0, 200));
  });
  moments.forEach((m, i) => {
    lines.push(`\n[메모 ${i + 1}] ${m.text.slice(0, 200)}`);
  });
  ideas.forEach((d, i) => {
    lines.push(`\n[아이디어 ${i + 1}] ${d.title}`);
    lines.push(d.content.slice(0, 200));
  });

  const userContent = lines.join('\n');

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  });

  const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return Response.json({ summary });
}
```

---

## 4. 캘린더 페이지 상태 설계

```ts
// 추가 상태
const [summaryLoading, setSummaryLoading] = useState(false);
const [summaryText, setSummaryText] = useState<string | null>(null);
const [summaryError, setSummaryError] = useState<string | null>(null);
const [savedPreview, setSavedPreview] = useState<{ content: string; savedAt: string } | null>(null);
```

---

## 5. 요약하기 버튼 동작 설계

```ts
const handleSummary = async () => {
  setSummaryLoading(true);
  setSummaryText(null);
  setSummaryError(null);

  const todayDiary = diaryEntries
    .filter(e => e.date === today)
    .map(e => ({ title: e.title, content: e.content }));
  const todayMoments = moments
    .filter(m => m.date === today)
    .map(m => ({ text: m.text }));
  const todayIdeas = ideas
    .filter(i => i.createdAt.slice(0, 10) === today)
    .map(i => ({ title: i.title, content: i.content }));

  try {
    const res = await fetch('/api/daily-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, diary: todayDiary, moments: todayMoments, ideas: todayIdeas }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setSummaryText(data.summary);
  } catch (e) {
    setSummaryError(e instanceof Error ? e.message : '요약 중 오류가 발생했어요.');
  } finally {
    setSummaryLoading(false);
  }
};
```

---

## 6. 메모 저장 동작 설계

```ts
const handleSaveSummary = async () => {
  if (!summaryText) return;
  const savedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  await addMoment({ text: `✨ 오늘의 요약\n\n${summaryText}`, date: today });
  setSummaryText(null); // 모달 닫기
  setSavedPreview({ content: summaryText, savedAt });
};
```

---

## 7. UI 상세 설계

### 7.1 요약하기 버튼

```tsx
<button
  onClick={handleSummary}
  disabled={total === 0 || summaryLoading}
  className="
    mt-3 w-full py-2.5 rounded-xl text-sm font-semibold
    flex items-center justify-center gap-2
    bg-gradient-to-r from-violet-500 to-purple-500
    text-white shadow-sm shadow-purple-200 dark:shadow-purple-900/30
    hover:opacity-90 active:scale-[0.98] transition-all
    disabled:opacity-40 disabled:cursor-not-allowed
  "
>
  {summaryLoading ? (
    <>
      <svg className="animate-spin h-4 w-4" .../>
      AI가 오늘을 돌아보고 있어요...
    </>
  ) : (
    <>✨ 오늘 하루 요약하기</>
  )}
</button>
```

### 7.2 요약 모달

```tsx
{(summaryText || summaryError) && (
  <>
    {/* 딤 배경 */}
    <div
      className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]"
      onClick={() => { setSummaryText(null); setSummaryError(null); }}
    />
    {/* 카드 */}
    <div className="fixed bottom-20 left-0 right-0 z-60 flex justify-center px-4">
      <div className="
        w-full max-w-[400px]
        bg-white dark:bg-gray-800
        rounded-3xl shadow-2xl
        border border-gray-100 dark:border-gray-700
        overflow-hidden
        animate-slide-up-toast
      ">
        {/* 상단 그라데이션 바 */}
        <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400" />

        <div className="px-6 py-5">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">✨ 오늘의 요약</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {dateLabel} — AI가 당신의 하루를 읽었어요
              </p>
            </div>
            <button onClick={...} className="닫기 버튼 스타일">✕</button>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-gray-100 dark:bg-gray-700 mb-4" />

          {/* 요약 텍스트 or 에러 */}
          {summaryText && (
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {summaryText}
            </p>
          )}
          {summaryError && (
            <p className="text-sm text-red-500">{summaryError}</p>
          )}

          {/* 버튼 행 */}
          {summaryText && (
            <div className="flex gap-2 mt-5">
              <button onClick={닫기} className="flex-1 닫기 버튼" />
              <button onClick={handleSaveSummary} className="flex-[1.5] 저장 버튼 (보라색)" />
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
```

### 7.3 저장 완료 — SavePreviewCard 연동

```tsx
{savedPreview && (
  <SavePreviewCard
    type="moment"
    content={savedPreview.content}
    savedAt={savedPreview.savedAt}
    onDismiss={() => setSavedPreview(null)}
  />
)}
```

---

## 8. UI 레이아웃

```
┌──────────────────────────────────────────┐
│  오늘의 기록          2026년 3월 12일    │
│  [📖 2개] [⚡ 1개] [💡 1개]             │
│  ────────────────────────────────────    │
│  [✨ 오늘 하루 요약하기  (보라 그라디언트)] │
└──────────────────────────────────────────┘

          ↓ 클릭 후 팝업

┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓ (보라 그라데이션 상단 바)         │
│                                          │
│  ✨ 오늘의 요약    AI가 당신의 하루를 읽었어요 │
│  ─────────────────────────────────────   │
│                                          │
│  오늘 하루도 참 바쁘고 풍성했네요. 일기에 │
│  서 따뜻한 감정이 느껴졌고, 번뜩이는     │
│  아이디어도 있었어요. 내일도 화이팅! 😊  │
│                                          │
│  [닫기]          [메모로 저장 ✨]         │
└──────────────────────────────────────────┘
```

---

## 9. 구현 순서

```
1. src/app/api/daily-summary/route.ts 생성
2. src/app/calendar/page.tsx 수정:
   a. import 추가 (useMoments, SavePreviewCard)
   b. 상태 추가 (summaryLoading, summaryText, summaryError, savedPreview)
   c. handleSummary, handleSaveSummary 함수 추가
   d. 오늘의 기록 카드에 버튼 추가
   e. 요약 모달 JSX 추가
   f. SavePreviewCard 조건부 렌더링 추가
```

---

## 10. 수용 기준 확인

| 기준 | 설계 반영 |
|------|-----------|
| 버튼 클릭 → 로딩 표시 | `summaryLoading` 상태 + 스피너 |
| 오늘 기록 수집 | 훅 state 필터링 (별도 fetch 없음) |
| AI 요약 생성 | `POST /api/daily-summary` + Haiku |
| 팝업 slide-up | `animate-slide-up-toast` 재사용 |
| 날짜 + 요약 텍스트 표시 | 모달 헤더 + 본문 |
| 메모로 저장 | `addMoment()` → `SavePreviewCard` |
| 닫기 | `setSummaryText(null)` |
| 기록 없으면 버튼 비활성화 | `disabled={total === 0}` |
| 다크모드 | `dark:` 클래스 전체 적용 |
| 에러 처리 | `summaryError` 상태 → 모달 내 에러 메시지 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
