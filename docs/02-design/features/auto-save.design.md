# [Design] Auto Save (임시저장 Draft)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Auto Save — 폼 이탈 시 localStorage 임시저장 + 복원 토스트 |
| 신규 파일 | `src/hooks/useDraft.ts`, `src/components/DraftToast.tsx` |
| 수정 파일 | `diary/new/page.tsx`, `moments/new/page.tsx`, `ideas/new/page.tsx` |

---

## 1. 컴포넌트 구조

```
각 폼 페이지 (diary/new, moments/new, ideas/new)
├── [신규] DraftToast (조건부 표시)
│   ├── "📝 이전 작성 내용이 있어요"
│   ├── [이어쓰기] 버튼
│   └── [새로쓰기] 버튼
├── 기존 폼 UI (유지)
└── useDraft 훅 연결
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/hooks/useDraft.ts` | 신규 | localStorage save/load/clear 훅 |
| `src/components/DraftToast.tsx` | 신규 | 슬라이드 토스트 UI 컴포넌트 |
| `src/app/diary/new/page.tsx` | 수정 | draft 저장 필드: title, content, weatherIndex, emotionIndex, tags |
| `src/app/moments/new/page.tsx` | 수정 | draft 저장 필드: text, tags |
| `src/app/ideas/new/page.tsx` | 수정 | draft 저장 필드: title, content, tags |

---

## 3. useDraft 훅 설계

**파일**: `src/hooks/useDraft.ts`

```ts
export function useDraft<T>(key: string) {
  const load = (): T | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const save = (data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const clear = () => {
    localStorage.removeItem(key);
  };

  return { load, save, clear };
}
```

**Draft Key 규칙**:
| 페이지 | key |
|--------|-----|
| 일기 | `'draft:diary'` |
| 메모 | `'draft:moment'` |
| 아이디어 | `'draft:idea'` |

---

## 4. DraftToast 컴포넌트 설계

**파일**: `src/components/DraftToast.tsx`

```tsx
type Props = {
  onResume: () => void;
  onDiscard: () => void;
};

export default function DraftToast({ onResume, onDiscard }: Props) {
  return (
    <div className="
      fixed top-0 left-0 right-0 z-50
      flex items-center justify-between
      px-4 py-3
      bg-white dark:bg-gray-800
      border-b border-gray-100 dark:border-gray-700
      shadow-md
      animate-slide-down
    ">
      <span className="text-sm text-gray-700 dark:text-gray-200">
        📝 이전 작성 내용이 있어요
      </span>
      <div className="flex gap-2">
        <button
          onClick={onResume}
          className="text-sm font-semibold text-[#4A90D9] hover:text-[#3A7FC9] transition-colors"
        >
          이어쓰기
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={onDiscard}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          새로쓰기
        </button>
      </div>
    </div>
  );
}
```

**애니메이션**: `globals.css`에 추가

```css
@keyframes slide-down {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}
.animate-slide-down {
  animation: slide-down 0.25s ease-out;
}
```

---

## 5. 페이지별 연동 설계

### 5.1 공통 패턴

```ts
// 1. 훅 초기화
const { load, save, clear } = useDraft<DraftType>('draft:xxx');

// 2. 마운트 시 draft 확인
const [showDraft, setShowDraft] = useState(false);
useEffect(() => {
  const draft = load();
  if (draft && hasContent(draft)) setShowDraft(true);
}, []); // eslint-disable-line

// 3. debounce 저장 (내용이 있을 때만)
useEffect(() => {
  if (!hasContent()) return; // 빈 폼은 저장 안 함
  const id = setTimeout(() => save({ ...fields }), 500);
  return () => clearTimeout(id);
}, [relevantFields]);

// 4. 이어쓰기
const handleResume = () => {
  const draft = load();
  if (!draft) return;
  setField1(draft.field1);
  setField2(draft.field2);
  // ...
  clear();
  setShowDraft(false);
};

// 5. 새로쓰기
const handleDiscard = () => {
  clear();
  setShowDraft(false);
};

// 6. 저장 완료 시 draft 삭제
const handleSubmit = async () => {
  // ... 기존 저장 로직 ...
  clear(); // 저장 성공 후
  router.push('...');
};
```

### 5.2 diary/new — Draft 필드

```ts
type DiaryDraft = {
  title: string;
  content: string;
  weatherIndex: number;
  emotionIndex: number | null;
  tags: string[];
  dateStr: string;
};
// hasContent: title.trim() || content.trim()
```

### 5.3 moments/new — Draft 필드

```ts
type MomentDraft = {
  text: string;
  tags: string[];
};
// hasContent: text.trim()
```

### 5.4 ideas/new — Draft 필드

```ts
type IdeaDraft = {
  title: string;
  content: string;
  tags: string[];
};
// hasContent: title.trim() || content.trim()
```

---

## 6. UI 배치

```
┌─────────────────────────────────────────────────────┐
│ [fixed top] 📝 이전 작성 내용이 있어요  이어쓰기 | 새로쓰기 │  ← DraftToast (z-50)
├─────────────────────────────────────────────────────┤
│  ← 뒤로가기          일기 쓰기                        │  ← 헤더
│                                                     │
│  (기존 폼 내용)                                       │
└─────────────────────────────────────────────────────┘
```

토스트가 fixed이므로 기존 레이아웃과 겹치지만 `pt-12` 헤더 위에 덮어씌워지는 구조. 토스트 높이(~48px)만큼 본문이 밀리지 않아도 충분히 인지 가능.

---

## 7. globals.css 추가 위치

`src/app/globals.css` 하단에 추가:

```css
@keyframes slide-down {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
.animate-slide-down {
  animation: slide-down 0.25s ease-out forwards;
}
```

---

## 8. 구현 순서

```
1. src/hooks/useDraft.ts 생성
2. globals.css에 slide-down 애니메이션 추가
3. src/components/DraftToast.tsx 생성
4. moments/new/page.tsx — draft 연동 (가장 단순, 첫 번째)
5. ideas/new/page.tsx — draft 연동
6. diary/new/page.tsx — draft 연동 (필드 가장 많음, 마지막)
```

---

## 9. 수용 기준 확인

| 기준 | 설계 반영 |
|------|-----------|
| 입력 변경 → 500ms debounce → localStorage 저장 | `useEffect` + `setTimeout` |
| 재진입 시 draft 감지 → 토스트 표시 | `useEffect([], [])` + `setShowDraft` |
| 위에서 슥 내려오는 애니메이션 | `animate-slide-down` (CSS keyframe) |
| 이어쓰기 → 폼 채움 + draft 삭제 | `handleResume()` |
| 새로쓰기 → draft 삭제 + 빈 폼 | `handleDiscard()` |
| 저장 완료 시 draft 삭제 | `handleSubmit` 내 `clear()` |
| 빈 폼은 저장 안 함 | `hasContent()` 체크 |
| 3개 페이지 재사용 | `useDraft<T>(key)` 제네릭 훅 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
