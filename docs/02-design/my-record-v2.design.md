# my-record-v2 Design (Updated)

> **최초 작성**: 2026-03-09
> **갱신**: 2026-03-10 (Supabase 연동 + 확장 기능 반영)
> **Plan**: `docs/01-plan/my-record-v2.plan.md`

---

## Goal

3가지 유형(일기·지금 이 순간·아이디어)의 기록을 **Supabase(클라우드) + LocalStorage(로컬) 하이브리드**로 저장·관리하는 미니멀 모바일 최적화 Next.js 앱. Supabase Auth 기반 사용자 인증, 멀티디바이스 동기화, 사진 업로드(Storage) 지원.

---

## 아키텍처 개요

```
User Action
  → Custom Hook (useDiary / useMoments / useIdeas)
      ├── LocalStorage 저장 (동기 — 즉시 UI 반영)
      └── Supabase DB 저장 (비동기 await — 클라우드 동기화)

Page Load (로그인 사용자)
  → Supabase fetch → entries 상태 갱신 → LocalStorage 동기화

사진 업로드
  → Supabase Storage (post-images 버킷) → URL 반환 → imageBase64 필드에 URL 저장
```

### 데이터 흐름

```
인증 (/auth) → 로그인 완료
  → AuthContext (user, loading)
      → useDiary / useMoments / useIdeas
          → Supabase DB (diary_entries / moments / ideas)
          → LocalStorage (캐시·오프라인)

미인증 → /auth 리다이렉트 (미들웨어)
```

---

## 데이터 모델 (`src/lib/types.ts`)

```typescript
interface BaseRecord {
  id: string;           // crypto.randomUUID()
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
  imageBase64?: string; // Supabase Storage URL (필드명은 레거시 유지)
}

interface DiaryEntry extends BaseRecord {
  type: 'diary';
  date: string;         // 'YYYY-MM-DD' — user당 유니크 키
  title: string;
  content: string;
  tags?: string[];      // 태그 배열 (Supabase TEXT[] 컬럼)
}

interface Moment extends BaseRecord {
  type: 'moment';
  date: string;         // 'YYYY-MM-DD'
  text: string;         // 본문 + '\n\n#tag1 #tag2' 형식으로 태그 임베딩
}

interface Idea extends BaseRecord {
  type: 'idea';
  date: string;         // 'YYYY-MM-DD'
  title: string;
  content: string;      // 본문 + '\n\n#tag1 #tag2' 형식으로 태그 임베딩
}
```

---

## Supabase 스키마

### `diary_entries` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| date | date | 날짜 (user_id + date UNIQUE) |
| title | text | 제목 |
| content | text | 본문 |
| image_base64 | text | Storage URL (nullable) |
| tags | text[] | 태그 배열 (DEFAULT '{}') |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 수정 시각 |

### `moments` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| date | date | 날짜 |
| text | text | 본문 (#태그 임베딩 포함) |
| image_base64 | text | Storage URL (nullable) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `ideas` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| date | date | 날짜 |
| title | text | 제목 |
| content | text | 본문 (#태그 임베딩 포함) |
| image_base64 | text | Storage URL (nullable) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Storage

| 버킷 | 설명 |
|------|------|
| `post-images` | 일기·순간·아이디어 첨부 사진 |

---

## LocalStorage 구조

| Key | 타입 | 설명 |
|-----|------|------|
| `diary_YYYY-MM-DD` | `DiaryEntry` (JSON) | Supabase 캐시 |
| `moments_list` | `Moment[]` (JSON) | Supabase 캐시 |
| `ideas_list` | `Idea[]` (JSON) | Supabase 캐시 |
| `diary_tags_YYYY-MM-DD` | `string[]` (JSON) | 태그 하위 호환 캐시 |
| `pin_hash` | string | PIN 해시 |
| `app_theme` | string | 테마 설정 |

---

## 태그 저장 방식

| 유형 | 저장 위치 | 방식 |
|------|----------|------|
| 일기 | Supabase `tags TEXT[]` + localStorage `diary_tags_*` | 배열로 분리 저장 |
| 순간 | Supabase `moments.text` | 본문에 `\n\n#tag1 #tag2` 임베딩 |
| 아이디어 | Supabase `ideas.content` | 본문에 `\n\n#tag1 #tag2` 임베딩 |

태그 추출 (순간·아이디어):
```typescript
function extractTags(text: string): string[] {
  return (text.match(/#([^\s#]+)/g) ?? []).map(t => t.slice(1));
}
```

수정 시 태그 파싱 (아이디어):
```typescript
function splitContentAndTags(full: string): { body: string; tags: string[] } {
  const parts = full.split('\n\n');
  const last = parts[parts.length - 1];
  if (parts.length > 1 && last.trim().split(' ').every(w => w.startsWith('#'))) {
    return { body: parts.slice(0, -1).join('\n\n'), tags: last.trim().split(' ').map(t => t.slice(1)) };
  }
  return { body: full, tags: [] };
}
```

---

## 파일 구조

### Pages (16개)

| 파일 | Route | 역할 |
|------|-------|------|
| `src/app/page.tsx` | `/` | 홈 — 최근 기록 + 오늘 통계 |
| `src/app/auth/page.tsx` | `/auth` | 로그인/회원가입 |
| `src/app/diary/page.tsx` | `/diary` | 일기 목록 + 검색 + 태그 필터 |
| `src/app/diary/new/page.tsx` | `/diary/new` | 일기 작성 (날짜·감정·날씨·태그·사진) |
| `src/app/diary/[id]/page.tsx` | `/diary/[id]` | 일기 상세 |
| `src/app/diary/[id]/edit/page.tsx` | `/diary/[id]/edit` | 일기 수정 (기존 태그 로드) |
| `src/app/moments/page.tsx` | `/moments` | 순간 목록 + 검색 + 태그 필터 |
| `src/app/moments/new/page.tsx` | `/moments/new` | 순간 작성 (날짜·태그·사진) |
| `src/app/moments/[id]/page.tsx` | `/moments/[id]` | 순간 상세 |
| `src/app/moments/[id]/edit/page.tsx` | `/moments/[id]/edit` | 순간 수정 |
| `src/app/ideas/page.tsx` | `/ideas` | 아이디어 목록 + 검색 + 태그 필터 |
| `src/app/ideas/new/page.tsx` | `/ideas/new` | 아이디어 작성 (날짜·태그·사진) |
| `src/app/ideas/[id]/page.tsx` | `/ideas/[id]` | 아이디어 상세 |
| `src/app/ideas/[id]/edit/page.tsx` | `/ideas/[id]/edit` | 아이디어 수정 (태그 파싱·편집) |
| `src/app/calendar/page.tsx` | `/calendar` | 월별 캘린더 |
| `src/app/calendar/[date]/page.tsx` | `/calendar/[date]` | 날짜별 기록 모아보기 |
| `src/app/settings/page.tsx` | `/settings` | 설정 (테마·PIN·백업·로그아웃) |

### Components (10개)

| 파일 | 역할 |
|------|------|
| `src/components/BottomTabBar.tsx` | 하단 탭 네비게이션 (홈·일기·순간·아이디어) `z-50` |
| `src/components/DiaryForm.tsx` | 일기 작성/수정 폼 (날짜·태그·사진 포함) |
| `src/components/ImagePicker.tsx` | 사진 선택 → Supabase Storage 업로드 (20MB 제한) |
| `src/components/PinLock.tsx` | PIN 입력 화면 |
| `src/components/PinGate.tsx` | PIN 잠금 게이트 |
| `src/components/Header.tsx` | 공통 헤더 |
| `src/components/RecordTypeCard.tsx` | 랜딩 유형 카드 |
| `src/components/MomentForm.tsx` | 순간 폼 |
| `src/components/IdeaForm.tsx` | 아이디어 폼 |
| `src/components/RecordItem.tsx` | 목록 아이템 |

### Hooks & Lib

| 파일 | 인터페이스 |
|------|-----------|
| `src/lib/useDiary.ts` | `{ entries, getTodayEntry, getByDate, getById, save, remove, isLoading }` |
| `src/lib/useMoments.ts` | `{ moments, getByDate, getById, add, update, remove, isLoading }` |
| `src/lib/useIdeas.ts` | `{ ideas, getById, add, update, remove, isLoading }` |
| `src/lib/supabase.ts` | Supabase 클라이언트 |
| `src/lib/storageUpload.ts` | `uploadImage()` → Storage URL |
| `src/lib/storage.ts` | LocalStorage read/write 헬퍼 |
| `src/lib/types.ts` | 공통 타입 정의 |
| `src/context/AuthContext.tsx` | `useAuth()` → `{ user, loading }` |

---

## Hook 인터페이스 상세

### `useDiary`

```typescript
function useDiary() {
  entries: DiaryEntry[]
  isLoading: boolean
  getTodayEntry(): DiaryEntry | undefined
  getByDate(date: string): DiaryEntry | undefined
  getById(id: string): DiaryEntry | undefined
  save(data: {
    date: string; title: string; content: string;
    imageBase64?: string; tags?: string[]
  }): Promise<void>
  remove(id: string): Promise<void>
}
```

### `useMoments`

```typescript
function useMoments() {
  moments: Moment[]
  isLoading: boolean
  getByDate(date: string): Moment[]
  getById(id: string): Moment | undefined
  add(data: { text: string; date: string; imageBase64?: string }): Promise<void>
  update(id: string, data: Partial<Pick<Moment, 'text' | 'imageBase64' | 'date'>>): Promise<void>
  remove(id: string): Promise<void>
}
```

### `useIdeas`

```typescript
function useIdeas() {
  ideas: Idea[]
  isLoading: boolean
  getById(id: string): Idea | undefined
  add(data: { title: string; content: string; date?: string; imageBase64?: string }): Promise<void>
  update(id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'date' | 'imageBase64'>>): Promise<void>
  remove(id: string): Promise<void>
}
```

---

## 레이아웃 패턴

### 모바일 최적화 (max-w-[430px])

```
┌─────────────────────────┐
│  Header (pt-12)          │  ← 뒤로가기 / 제목 / 설정
├─────────────────────────┤
│                          │
│  Main Content            │  ← flex-1, 스크롤 가능
│                          │
├─────────────────────────┤  ← fixed bottom-16 패널 (z-10)
│  태그 입력 (tagOpen 시)  │
│  태그 칩                 │
│  Toolbar (사진·태그 버튼) │
│  저장 버튼               │
├─────────────────────────┤  ← fixed bottom-0 (z-50)
│  홈 | 일기 | 순간 | 아이 │  ← BottomTabBar
└─────────────────────────┘
```

### 목록 페이지 공통 구조

```
Header (메뉴 + 설정)
→ 타이틀 + 부제목
→ 검색창 (rounded-full)
→ 태그 필터 칩 (수평 스크롤, 전체 버튼 포함)
→ 새 기록 버튼 (bg-[#4A90D9])
→ 목록 (isLoading → SkeletonList, 없음 → 빈 상태 메시지)
```

---

## 날짜·시간 표기

| 위치 | 형식 | 구현 |
|------|------|------|
| 목록 카드 | `YYYY-MM-DD HH:mm` | `formatDateTime(date, createdAt)` |
| 상세 페이지 | `YYYY-MM-DD HH:mm` | `formatDateTime(date, createdAt)` |
| 작성/수정 | `<input type="date" max={today}>` | 날짜 선택기 (미래 불가) |

---

## 로딩 상태

| 상태 | UI |
|------|-----|
| 목록 로딩 중 | `SkeletonList` (animate-pulse, 5행) |
| 저장 중 | 버튼 스피너 (`animate-spin`) + disabled |

---

## DiaryForm 인터페이스

```typescript
interface DiaryFormProps {
  initial?: Partial<DiaryEntry>
  initialTags?: string[]        // 기존 태그 초기값 (수정 시)
  onSubmit: (data: {
    date: string; title: string; content: string;
    imageBase64?: string; tags?: string[]
  }) => void | Promise<void>
}
```

---

## 주요 구현 패턴

### 하이브리드 저장

```typescript
// 1. LocalStorage 즉시 저장 (UI 즉시 반영)
storageSet(key, entry);
setState(loadAll());

// 2. Supabase 비동기 저장 (await 후 navigate)
if (user) {
  await supabase.from('table').upsert({ ... });
}
router.push('/list');
```

### TypeScript Promise 체인

```typescript
// .finally() 미지원 → .then(ok, err) 패턴 사용
.then(({ data }) => {
  // 성공 처리
  setIsLoading(false);
}, () => setIsLoading(false));
```

### 이미지 저장

```typescript
// ImagePicker: 파일 → Supabase Storage 업로드 → URL 반환
const url = await uploadImage(file, user.id);
setImageBase64(url); // 필드명은 imageBase64이나 실제 값은 URL
```

---

## Completion Checklist

- [x] 인증 (로그인·회원가입·비밀번호 찾기)
- [x] Supabase DB 3개 테이블 (diary_entries·moments·ideas)
- [x] Supabase Storage (post-images 버킷, RLS 정책)
- [x] `diary_entries.tags TEXT[]` 컬럼
- [x] 3개 훅 isLoading + Supabase 연동
- [x] 16개 페이지 구현
- [x] 10개 컴포넌트 구현
- [x] 날짜 선택기 (작성·수정 전체)
- [x] 날짜+시간 표기 (YYYY-MM-DD HH:mm)
- [x] 스켈레톤 로딩 + 저장 스피너
- [x] 태그 입력·칩·필터 (전체)
- [x] 수정 페이지 기존 태그 로드 (일기·아이디어)
- [x] 태그 Supabase 동기화 (일기)
- [x] 사진 업로드 20MB, Supabase Storage
- [x] PIN 잠금·설정
- [x] 백업/복원
- [x] 캘린더
- [x] 모바일 최적화 (max-w-[430px])
