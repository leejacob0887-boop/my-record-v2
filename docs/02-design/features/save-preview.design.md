# [Design] Save Preview (저장 완료 미리보기 카드)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Save Preview — 저장 직후 하단에서 올라오는 감성 미리보기 카드 |
| 신규 파일 | `src/components/SavePreviewCard.tsx` |
| 수정 파일 | `globals.css`, `diary/new/page.tsx`, `moments/new/page.tsx`, `ideas/new/page.tsx` |

---

## 1. 컴포넌트 구조

```
각 폼 페이지 (diary/new, moments/new, ideas/new)
├── [신규] SavePreviewCard (조건부 표시 — preview 상태가 있을 때만)
│   ├── 아이콘 영역 (페이지 타입별 이모지)
│   ├── 제목 (title 또는 내용 첫 줄)
│   ├── 내용 일부 (최대 60자 truncate)
│   ├── 저장 시각 ("방금 저장됨 · HH:MM")
│   └── [✕] 닫기 버튼
└── 기존 폼 UI (유지)
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/components/SavePreviewCard.tsx` | 신규 | 미리보기 카드 컴포넌트 |
| `src/app/globals.css` | 수정 | slide-down-out 퇴장 애니메이션 추가 |
| `src/app/diary/new/page.tsx` | 수정 | SavePreviewCard 연동, 저장 후 이동 방식 변경 |
| `src/app/moments/new/page.tsx` | 수정 | SavePreviewCard 연동 |
| `src/app/ideas/new/page.tsx` | 수정 | SavePreviewCard 연동 |

---

## 3. SavePreviewCard 컴포넌트 설계

**파일**: `src/components/SavePreviewCard.tsx`

```tsx
type SavePreviewCardProps = {
  type: 'diary' | 'moment' | 'idea';
  title?: string;
  content: string;
  savedAt: string;      // "HH:MM" 형식
  onDismiss: () => void;
};

const TYPE_META = {
  diary:  { emoji: '📖', label: '일기' },
  moment: { emoji: '💬', label: '메모' },
  idea:   { emoji: '💡', label: '아이디어' },
};

export default function SavePreviewCard({ type, title, content, savedAt, onDismiss }: SavePreviewCardProps) {
  const [leaving, setLeaving] = useState(false);
  const meta = TYPE_META[type];
  const displayTitle = title?.trim() || content.slice(0, 20);
  const displayContent = content.length > 60 ? content.slice(0, 60) + '…' : content;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 300); // slide-down-out 애니메이션 후 호출
  };

  // 3.5초 자동 dismiss
  useEffect(() => {
    const id = setTimeout(dismiss, 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-5 pointer-events-none">
      <div className={`
        pointer-events-auto
        w-full max-w-[360px]
        bg-white/90 dark:bg-gray-800/90
        backdrop-blur-md
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        border border-white/60 dark:border-gray-700/60
        px-5 py-4
        ${leaving ? 'animate-slide-down-out' : 'animate-slide-up-toast'}
      `}>
        {/* 헤더 행 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-base">
              {meta.emoji}
            </div>
            <div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">저장됨</span>
              <span className="text-xs text-gray-400 dark:text-gray-500"> · {savedAt}</span>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="닫기"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 제목 */}
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug mb-1 line-clamp-1">
          {displayTitle}
        </p>

        {/* 내용 */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {displayContent}
        </p>

        {/* 타이머 바 */}
        <div className="mt-3 h-0.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 dark:bg-green-500 rounded-full animate-timer-drain" />
        </div>
      </div>
    </div>
  );
}
```

---

## 4. 애니메이션 설계

**파일**: `src/app/globals.css` 추가

```css
/* 퇴장: 아래로 내려가며 사라짐 */
@keyframes slide-down-out {
  from { transform: translateY(0) scale(1); opacity: 1; }
  to   { transform: translateY(120%) scale(0.95); opacity: 0; }
}
.animate-slide-down-out {
  animation: slide-down-out 0.3s ease-in forwards;
}

/* 타이머 바: 3.5초 동안 왼쪽으로 줄어듦 */
@keyframes timer-drain {
  from { width: 100%; }
  to   { width: 0%; }
}
.animate-timer-drain {
  animation: timer-drain 3.5s linear forwards;
}
```

> 진입 애니메이션(`animate-slide-up-toast`)은 기존 `globals.css`에 이미 존재.

---

## 5. 페이지별 연동 설계

### 5.1 공통 패턴

```ts
// Preview 상태 타입
type PreviewData = {
  title?: string;
  content: string;
  savedAt: string;
};

// 상태 추가
const [preview, setPreview] = useState<PreviewData | null>(null);

// handleSubmit 수정: router.push() 제거, preview 설정으로 대체
const handleSubmit = async () => {
  // ... 기존 저장 로직 ...
  const savedAt = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  setPreview({ title, content, savedAt }); // 카드 표시
  // router.push()는 여기서 호출하지 않음
};

// dismiss 콜백: 카드 사라진 후 이동
const handleDismiss = () => {
  setPreview(null);
  router.push('/목록경로');
};

// JSX
{preview && (
  <SavePreviewCard
    type="diary"
    title={preview.title}
    content={preview.content}
    savedAt={preview.savedAt}
    onDismiss={handleDismiss}
  />
)}
```

### 5.2 diary/new

```ts
type: 'diary'
title: title.trim() || '제목 없음'
content: content.trim()
router.push('/diary')
```

### 5.3 moments/new

```ts
type: 'moment'
title: undefined  // 제목 없음 → content 첫 줄 자동 사용
content: text.trim()
router.push('/moments')
```

### 5.4 ideas/new

```ts
type: 'idea'
title: title.trim()
content: content.trim()
router.push('/ideas')
```

---

## 6. UI 레이아웃

```
┌──────────────────────────────────────────────────┐
│  (기존 폼 내용)                                   │
│                                                  │
│  [fixed bottom-24, center]                       │
│  ┌──────────────────────────────────────────┐    │
│  │ 📖  저장됨 · 14:32              [✕]      │    │
│  │                                          │    │
│  │  오늘 하루는 정말 행복했다               │    │
│  │  창밖으로 햇살이 들어오고 커피 한 잔...  │    │
│  │  ▓▓▓▓▓▓▓▓▓░░░░░░░ (타이머 바)           │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
  backdrop-blur · rounded-2xl · shadow · z-50
```

---

## 7. 중복 방지 처리

```ts
// dismiss가 타이머와 수동 클릭 양쪽에서 중복 호출되지 않도록
const dismissed = useRef(false);

const dismiss = () => {
  if (dismissed.current) return;
  dismissed.current = true;
  setLeaving(true);
  setTimeout(onDismiss, 300);
};
```

---

## 8. 구현 순서

```
1. globals.css — slide-down-out + timer-drain 애니메이션 추가
2. src/components/SavePreviewCard.tsx 생성
3. moments/new/page.tsx — SavePreviewCard 연동 (가장 단순)
4. ideas/new/page.tsx — SavePreviewCard 연동
5. diary/new/page.tsx — SavePreviewCard 연동
```

---

## 9. 수용 기준 확인

| 기준 | 설계 반영 |
|------|-----------|
| 저장 후 하단 카드 slide-up | `animate-slide-up-toast` (기존 애니메이션 재사용) |
| 제목/내용/저장시각 표시 | `displayTitle`, `displayContent`, `savedAt` props |
| 3.5초 자동 dismiss | `useEffect` + `setTimeout(dismiss, 3500)` |
| 자동 닫힘 후 목록 이동 | `onDismiss` 콜백 → `router.push()` |
| ✕ 버튼으로 즉시 닫기 | `dismiss()` → `setLeaving(true)` → 300ms 후 `onDismiss` |
| slide-down-out 퇴장 애니메이션 | `leaving` state → `animate-slide-down-out` |
| 타이머 시각화 | `animate-timer-drain` 3.5s linear |
| 다크모드 대응 | `dark:` 클래스 전체 적용 |
| 3개 페이지 재사용 | `type` prop으로 페이지 구분 |
| 중복 dismiss 방지 | `dismissed` ref |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
