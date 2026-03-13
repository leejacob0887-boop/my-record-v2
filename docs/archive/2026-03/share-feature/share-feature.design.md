# [Design] Share Feature (기록 공유하기)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Share Feature — 감성 카드 이미지 생성 + Web Share API 공유 |
| 신규 파일 | `src/lib/shareCard.ts` |
| 수정 파일 | `src/app/diary/[id]/page.tsx`, `src/app/moments/[id]/page.tsx`, `src/app/ideas/[id]/page.tsx` |

---

## 1. 컴포넌트 구조

```
상세 페이지 (diary/moments/ideas [id]/page.tsx)
├── 헤더 우측
│   └── [신규] 공유 아이콘 버튼 (설정 아이콘 좌측에 추가)
│       ├── 기본: 공유 SVG 아이콘
│       └── 로딩 중: animate-spin 스피너
└── (기존 수정/삭제 버튼 그대로 유지)

src/lib/shareCard.ts (신규)
├── generateShareCard(data) → Promise<Blob>  (Canvas 렌더링)
└── shareCard(data) → Promise<void>          (공유 or 다운로드)
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/lib/shareCard.ts` | 신규 | Canvas 카드 생성 + 공유 유틸 |
| `src/app/diary/[id]/page.tsx` | 수정 | 공유 버튼 + shareCard 호출 |
| `src/app/moments/[id]/page.tsx` | 수정 | 공유 버튼 + shareCard 호출 |
| `src/app/ideas/[id]/page.tsx` | 수정 | 공유 버튼 + shareCard 호출 |

---

## 3. shareCard.ts 전체 구현

```ts
// src/lib/shareCard.ts

export type ShareCardData = {
  type: 'diary' | 'moment' | 'idea';
  title: string;    // diary/idea: title | moment: 첫 줄
  content: string;  // 120자 truncate 후 전달
  date: string;     // "2026-03-12" 형식
  isDark: boolean;
};

const TYPE_META = {
  diary:  { emoji: '📖', label: '일기' },
  moment: { emoji: '⚡', label: '메모' },
  idea:   { emoji: '💡', label: '아이디어' },
};

const COLORS = {
  diary:  { light: ['#EEF2FF', '#C7D2FE'], dark: ['#1E1B4B', '#312E81'], text: { light: '#1E40AF', dark: '#E0E7FF' }, sub: { light: '#6366F1', dark: '#A5B4FC' } },
  moment: { light: ['#F0F9FF', '#BAE6FD'], dark: ['#0C1A2E', '#082F49'], text: { light: '#0369A1', dark: '#E0F2FE' }, sub: { light: '#0EA5E9', dark: '#7DD3FC' } },
  idea:   { light: ['#FEFCE8', '#FEF08A'], dark: ['#1C1917', '#292524'], text: { light: '#92400E', dark: '#FEF9C3' }, sub: { light: '#D97706', dark: '#FDE68A' } },
};

// 둥근 사각형 path 헬퍼
function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// 한글 포함 텍스트 줄바꿈
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      if (lineCount === maxLines - 1) {
        // 마지막 줄 — 말줄임
        while (ctx.measureText(line + '…').width > maxWidth && line.length > 0) {
          line = line.slice(0, -1);
        }
        ctx.fillText(line + '…', x, startY + lineCount * lineHeight);
        return startY + (lineCount + 1) * lineHeight;
      }
      ctx.fillText(line, x, startY + lineCount * lineHeight);
      line = text[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, startY + lineCount * lineHeight);
  return startY + (lineCount + 1) * lineHeight;
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const W = 900, H = 560;
  const PAD = 56;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const scheme = COLORS[data.type];
  const isDark = data.isDark;

  // 1. 배경 그라디언트
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, isDark ? scheme.dark[0] : scheme.light[0]);
  grad.addColorStop(1, isDark ? scheme.dark[1] : scheme.light[1]);
  roundRectPath(ctx, 0, 0, W, H, 32);
  ctx.fillStyle = grad;
  ctx.fill();

  const textColor = isDark ? scheme.text.dark : scheme.text.light;
  const subColor  = isDark ? scheme.sub.dark  : scheme.sub.light;
  const divColor  = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';

  const meta = TYPE_META[data.type];

  // 2. 타입 이모지
  ctx.font = `48px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillText(meta.emoji, PAD, PAD + 48);

  // 3. 타입 라벨 (이모지 옆)
  ctx.font = `500 15px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = subColor;
  ctx.fillText(meta.label, PAD + 64, PAD + 40);

  // 4. 날짜 (이모지 아래)
  ctx.font = `400 13px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = subColor;
  ctx.fillText(data.date, PAD + 64, PAD + 58);

  // 5. 앱 이름 (우측 상단)
  ctx.font = `600 14px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = subColor;
  ctx.textAlign = 'right';
  ctx.fillText('나의 기록', W - PAD, PAD + 40);
  ctx.textAlign = 'left';

  // 6. 제목
  ctx.font = `bold 30px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = textColor;
  wrapText(ctx, data.title, PAD, PAD + 120, W - PAD * 2, 42, 2);

  // 7. 내용 미리보기
  const contentY = PAD + 185;
  ctx.font = `400 18px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';
  wrapText(ctx, data.content, PAD, contentY, W - PAD * 2, 30, 3);

  // 8. 구분선
  const divY = H - 88;
  ctx.strokeStyle = divColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, divY);
  ctx.lineTo(W - PAD, divY);
  ctx.stroke();

  // 9. 앱 서명
  ctx.font = `400 13px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;
  ctx.fillStyle = subColor;
  ctx.fillText('나의 기록 · my-record', PAD, H - 52);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('canvas toBlob failed')), 'image/png');
  });
}

export async function shareCard(data: ShareCardData): Promise<void> {
  const blob = await generateShareCard(data);
  const file = new File([blob], 'my-record-card.png', { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: data.title,
    });
  } else {
    // fallback: 다운로드
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-record-card.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

---

## 4. 상태 설계 (각 상세 페이지 공통)

```ts
const [sharing, setSharing] = useState(false);

const handleShare = async () => {
  setSharing(true);
  try {
    await shareCard({
      type: 'diary',          // 각 페이지에 맞게
      title: entry.title,
      content: (entry.content ?? '').slice(0, 120),
      date: entry.date,
      isDark: resolvedTheme === 'dark',
    });
  } catch (e) {
    // 사용자가 취소한 경우 무시 (AbortError)
    if (e instanceof Error && e.name !== 'AbortError') {
      alert('공유 중 오류가 발생했어요.');
    }
  } finally {
    setSharing(false);
  }
};
```

> moment 타입은 `title: moment.text.split('\n')[0].slice(0, 50)` 로 첫 줄 사용

---

## 5. 공유 버튼 UI

헤더 우측 영역에 설정 아이콘 **좌측**에 추가 (flex gap-1 그룹).

```tsx
{/* 헤더 우측 버튼 그룹 */}
<div className="flex items-center gap-1">
  {/* 공유 버튼 */}
  <button
    onClick={handleShare}
    disabled={sharing}
    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
    aria-label="공유하기"
  >
    {sharing ? (
      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    )}
  </button>

  {/* 기존 설정 링크 */}
  <Link href="/settings" ...>
    <SettingsIcon />
  </Link>
</div>
```

---

## 6. 페이지별 수정 포인트

### diary/[id]/page.tsx
```ts
// 추가 imports
import { useTheme } from 'next-themes';
import { shareCard } from '@/lib/shareCard';

// resolvedTheme 추가
const { resolvedTheme } = useTheme();

// shareCard 호출
type: 'diary', title: entry.title, content: (entry.content ?? '').slice(0, 120), date: entry.date
```

### moments/[id]/page.tsx
```ts
type: 'moment', title: moment.text.split('\n')[0].slice(0, 50), content: moment.text.slice(0, 120), date: moment.date
```

### ideas/[id]/page.tsx
```ts
type: 'idea', title: idea.title, content: idea.content.slice(0, 120), date: idea.date ?? idea.createdAt.slice(0, 10)
```

---

## 7. 카드 시각 레이아웃

```
┌─────────────────────────────────────────────────────────────────────┐  (900×560)
│                                                                     │
│  📖  일기                                              나의 기록   │  y=56~108
│      2026-03-12                                                     │
│                                                                     │
│  [제목 bold 30px — 최대 2줄]                                        │  y=176~
│                                                                     │
│  [내용 미리보기 18px — 최대 3줄 말줄임...]                          │  y=241~
│                                                                     │
│                                                                     │
│  ──────────────────────────────────────────────────────────────    │  y=472
│  나의 기록 · my-record                                              │  y=508
└─────────────────────────────────────────────────────────────────────┘
```

**타입별 색상:**

| 타입 | 라이트 배경 | 다크 배경 | 라이트 텍스트 | 다크 텍스트 |
|------|-------------|-----------|---------------|-------------|
| 일기 | #EEF2FF → #C7D2FE | #1E1B4B → #312E81 | #1E40AF | #E0E7FF |
| 메모 | #F0F9FF → #BAE6FD | #0C1A2E → #082F49 | #0369A1 | #E0F2FE |
| 아이디어 | #FEFCE8 → #FEF08A | #1C1917 → #292524 | #92400E | #FEF9C3 |

---

## 8. 구현 순서

```
1. src/lib/shareCard.ts 생성 (Canvas 유틸)
2. src/app/diary/[id]/page.tsx 수정
   a. import 추가 (useTheme, shareCard)
   b. resolvedTheme 추가
   c. sharing 상태 + handleShare 함수
   d. 헤더 우측을 <div className="flex items-center gap-1">로 감싸고 공유 버튼 추가
3. src/app/moments/[id]/page.tsx 수정 (동일 패턴)
4. src/app/ideas/[id]/page.tsx 수정 (동일 패턴)
```

---

## 9. 수용 기준 확인

| 기준 | 설계 반영 |
|------|-----------|
| 상세 페이지 헤더에 공유 버튼 | 헤더 우측 설정 아이콘 좌측에 인디고 공유 아이콘 |
| 감성 카드 이미지 생성 | Canvas API, 타입별 그라디언트, 이모지/제목/내용/날짜/앱명 |
| Web Share API 공유 | `navigator.share({ files })` + `canShare` 체크 |
| fallback 다운로드 | `<a download>` 트리거 |
| 다크모드 대응 | `resolvedTheme === 'dark'` → 어두운 카드 배경/텍스트 |
| 로딩 표시 | `sharing` 상태 → 스피너 SVG |
| 에러 처리 | AbortError 무시, 그 외 alert |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
