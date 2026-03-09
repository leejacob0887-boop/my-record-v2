# my-record-v2 Design

> **Created**: 2026-03-09
> **Plan**: `docs/01-plan/features/my-record-v2.plan.md`

---

## Goal

3가지 유형(일기·지금 이 순간·아이디어)의 기록을 LocalStorage로 저장·관리하는 미니멀 모바일 최적화 Next.js 앱을 구현한다.

---

## How It Works

```
랜딩 (/) → 3개 유형 카드 선택
    ├── /diary         → 일기 목록 → 상세/작성/수정/삭제
    ├── /moments       → 순간 목록 → 상세/작성/수정/삭제
    └── /ideas         → 아이디어 목록 → 상세/작성/수정/삭제

모든 데이터 흐름:
    User Action → Custom Hook (CRUD) → LocalStorage → Re-render
```

---

## 데이터 모델 (`src/lib/types.ts`)

```typescript
// 공통 베이스
interface BaseRecord {
  id: string;          // uuid (crypto.randomUUID())
  createdAt: string;   // ISO 8601
  updatedAt: string;
  imageBase64?: string; // 선택 사진 (base64)
}

// 일기 (하루 1개)
interface DiaryEntry extends BaseRecord {
  type: 'diary';
  date: string;   // 'YYYY-MM-DD' — 유니크 키
  title: string;
  content: string;
}

// 지금 이 순간 (하루 여러 개)
interface Moment extends BaseRecord {
  type: 'moment';
  date: string;   // 'YYYY-MM-DD'
  text: string;   // 짧은 글 (max 200자 권장)
}

// 아이디어 (무제한)
interface Idea extends BaseRecord {
  type: 'idea';
  title: string;
  content: string;
}
```

---

## LocalStorage 구조

| Key | 타입 | 설명 |
|-----|------|------|
| `diary_YYYY-MM-DD` | `DiaryEntry` (JSON) | 날짜당 1개, 날짜가 키 |
| `moments_list` | `Moment[]` (JSON array) | 전체 목록 |
| `ideas_list` | `Idea[]` (JSON array) | 전체 목록 |

---

## 파일 구조 & 역할

### Pages

| 파일 | Route | 역할 |
|------|-------|------|
| `src/app/page.tsx` | `/` | 랜딩 — 3개 유형 카드 |
| `src/app/diary/page.tsx` | `/diary` | 일기 목록 |
| `src/app/diary/new/page.tsx` | `/diary/new` | 일기 작성 |
| `src/app/diary/[id]/page.tsx` | `/diary/[id]` | 일기 상세 |
| `src/app/diary/[id]/edit/page.tsx` | `/diary/[id]/edit` | 일기 수정 |
| `src/app/moments/page.tsx` | `/moments` | 순간 목록 |
| `src/app/moments/new/page.tsx` | `/moments/new` | 순간 작성 |
| `src/app/moments/[id]/page.tsx` | `/moments/[id]` | 순간 상세 |
| `src/app/moments/[id]/edit/page.tsx` | `/moments/[id]/edit` | 순간 수정 |
| `src/app/ideas/page.tsx` | `/ideas` | 아이디어 목록 |
| `src/app/ideas/new/page.tsx` | `/ideas/new` | 아이디어 작성 |
| `src/app/ideas/[id]/page.tsx` | `/ideas/[id]` | 아이디어 상세 |
| `src/app/ideas/[id]/edit/page.tsx` | `/ideas/[id]/edit` | 아이디어 수정 |

### Components

| 파일 | 역할 |
|------|------|
| `src/components/Header.tsx` | 공통 헤더 (제목 + 뒤로가기) |
| `src/components/RecordTypeCard.tsx` | 랜딩 유형 카드 (아이콘+이름+기록수) |
| `src/components/DiaryForm.tsx` | 일기 작성/수정 폼 |
| `src/components/MomentForm.tsx` | 순간 작성/수정 폼 |
| `src/components/IdeaForm.tsx` | 아이디어 작성/수정 폼 |
| `src/components/ImagePicker.tsx` | 공통 사진 선택 (file → base64) |
| `src/components/RecordItem.tsx` | 목록 아이템 카드 (공통) |

### Hooks (lib)

| 파일 | 인터페이스 |
|------|-----------|
| `src/lib/useDiary.ts` | `useDiary()` → `{ entries, getTodayEntry, save, remove }` |
| `src/lib/useMoments.ts` | `useMoments()` → `{ moments, add, update, remove }` |
| `src/lib/useIdeas.ts` | `useIdeas()` → `{ ideas, add, update, remove }` |
| `src/lib/types.ts` | 공통 타입 정의 |
| `src/lib/storage.ts` | LocalStorage read/write 헬퍼 |

---

## Hook 인터페이스 상세

### `useDiary`

```typescript
function useDiary() {
  entries: DiaryEntry[]          // 전체 일기 목록 (최신순)
  getTodayEntry(): DiaryEntry | undefined
  getByDate(date: string): DiaryEntry | undefined
  getById(id: string): DiaryEntry | undefined
  save(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): void
  // date 중복이면 update, 없으면 create
  remove(id: string): void
}
```

### `useMoments`

```typescript
function useMoments() {
  moments: Moment[]              // 전체 순간 목록 (최신순)
  getByDate(date: string): Moment[]
  getById(id: string): Moment | undefined
  add(data: { text: string; date: string; imageBase64?: string }): void
  update(id: string, data: Partial<Pick<Moment, 'text' | 'imageBase64'>>): void
  remove(id: string): void
}
```

### `useIdeas`

```typescript
function useIdeas() {
  ideas: Idea[]                  // 전체 아이디어 목록 (최신순)
  getById(id: string): Idea | undefined
  add(data: { title: string; content: string; imageBase64?: string }): void
  update(id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'imageBase64'>>): void
  remove(id: string): void
}
```

---

## 화면 레이아웃

### 랜딩 (`/`)

```
┌─────────────────────────┐
│  나의 기록               │  ← Header (로고)
├─────────────────────────┤
│  ┌───────┐ ┌───────┐   │
│  │  일기  │ │지금이  │   │  ← RecordTypeCard × 2
│  │  📖   │ │순간 ⚡ │   │
│  │  3개  │ │  12개  │   │
│  └───────┘ └───────┘   │
│  ┌───────┐              │
│  │아이디어│              │  ← RecordTypeCard × 1
│  │  💡   │              │
│  │  7개  │              │
│  └───────┘              │
└─────────────────────────┘
```

### 목록 페이지 (공통)

```
┌─────────────────────────┐
│  ← 일기                  │  ← Header (뒤로가기 + 제목)
├─────────────────────────┤
│  + 새 기록 작성           │  ← 버튼
├─────────────────────────┤
│  ┌─────────────────────┐│
│  │ 2026-03-09          ││  ← RecordItem
│  │ 오늘의 생각...       ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 2026-03-08          ││
│  │ ...                 ││
│  └─────────────────────┘│
└─────────────────────────┘
```

### 폼 페이지 (작성/수정)

```
┌─────────────────────────┐
│  ← 새 일기               │  ← Header
├─────────────────────────┤
│  [제목 입력]             │  ← input
│  [본문 입력...]          │  ← textarea
│  [사진 선택 버튼 📷]     │  ← ImagePicker
│  [사진 미리보기]         │
├─────────────────────────┤
│        [저장]            │  ← 저장 버튼
└─────────────────────────┘
```

---

## Component 인터페이스

```typescript
// RecordTypeCard
interface RecordTypeCardProps {
  type: 'diary' | 'moment' | 'idea'
  label: string
  icon: string
  count: number
  href: string
}

// Header
interface HeaderProps {
  title: string
  backHref?: string   // 없으면 뒤로가기 버튼 미표시
}

// ImagePicker
interface ImagePickerProps {
  value?: string        // base64
  onChange: (base64: string | undefined) => void
}

// RecordItem
interface RecordItemProps {
  id: string
  title: string         // 일기/아이디어: title, 순간: text 앞부분
  date: string
  imageBase64?: string
  href: string          // 상세 페이지 링크
}

// DiaryForm
interface DiaryFormProps {
  initial?: Partial<DiaryEntry>
  onSubmit: (data: { date: string; title: string; content: string; imageBase64?: string }) => void
}

// MomentForm
interface MomentFormProps {
  initial?: Partial<Moment>
  onSubmit: (data: { text: string; imageBase64?: string }) => void
}

// IdeaForm
interface IdeaFormProps {
  initial?: Partial<Idea>
  onSubmit: (data: { title: string; content: string; imageBase64?: string }) => void
}
```

---

## 구현 순서 (Do Phase)

1. **`src/lib/types.ts`** — 타입 정의
2. **`src/lib/storage.ts`** — LocalStorage 헬퍼
3. **`src/lib/useDiary.ts`** — 일기 훅
4. **`src/lib/useMoments.ts`** — 순간 훅
5. **`src/lib/useIdeas.ts`** — 아이디어 훅
6. **`src/components/Header.tsx`** — 공통 헤더
7. **`src/components/ImagePicker.tsx`** — 사진 선택
8. **`src/components/RecordTypeCard.tsx`** — 랜딩 카드
9. **`src/components/RecordItem.tsx`** — 목록 아이템
10. **`src/components/DiaryForm.tsx`** — 일기 폼
11. **`src/components/MomentForm.tsx`** — 순간 폼
12. **`src/components/IdeaForm.tsx`** — 아이디어 폼
13. **`src/app/page.tsx`** — 랜딩 (카드 연결)
14. **일기 페이지 4개** (`/diary`, `/diary/new`, `/diary/[id]`, `/diary/[id]/edit`)
15. **순간 페이지 4개** (`/moments`, `/moments/new`, `/moments/[id]`, `/moments/[id]/edit`)
16. **아이디어 페이지 4개** (`/ideas`, `/ideas/new`, `/ideas/[id]`, `/ideas/[id]/edit`)

---

## Completion Checklist

- [ ] `types.ts` 타입 정의 완료
- [ ] 3개 훅 (`useDiary`, `useMoments`, `useIdeas`) 구현 완료
- [ ] 모든 컴포넌트 구현 완료
- [ ] 13개 페이지 구현 완료
- [ ] 일기 하루 1개 제한 로직 동작 확인
- [ ] LocalStorage 저장·복원 확인
- [ ] 모바일(375px) 레이아웃 정상
- [ ] 사진 선택 → base64 저장 동작 확인

---

## Notes

- `'use client'` 지시어: LocalStorage 접근하는 모든 컴포넌트/훅에 필요
- `crypto.randomUUID()` 사용 (Node 19+ / 브라우저 기본 지원)
- 사진 크기 경고: base64 이미지가 너무 크면 LocalStorage 5MB 한도 초과 가능 → 저장 전 크기 확인 후 경고 토스트
- SSR 이슈 방지: `typeof window !== 'undefined'` 체크 후 LocalStorage 접근
