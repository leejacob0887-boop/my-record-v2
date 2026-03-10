# ui-improvements Plan

> **작성일**: 2026-03-10
> **프로젝트**: my-record-v2
> **레벨**: Starter

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | '지금 이 순간' 이름이 길어 네비게이션에서 잘리고, 캘린더에서 날짜 클릭 시 바로 기록 작성 불가, 홈 아이콘이 인라인 SVG로 관리 어려움 |
| **Solution** | 텍스트를 '메모'로 통일 변경, 캘린더 날짜 클릭 시 기록 유형 선택 바텀시트 추가, lucide-react 아이콘으로 교체 |
| **Function/UX Effect** | 더 짧고 명확한 레이블로 탭바 가독성 향상, 캘린더에서 직접 기록 작성 가능, 아이콘 일관성 및 유지보수성 향상 |
| **Core Value** | 앱 전반 UX 개선 + 코드 품질 향상 (인라인 SVG → lucide-react 아이콘 패키지) |

---

## 1. 개요

### 1.1 배경
- 현재 '지금 이 순간'이라는 레이블이 BottomTabBar에서 텍스트가 길어 UI적으로 불편
- 캘린더에서 날짜를 클릭하면 해당 날짜의 기록 목록 페이지만 볼 수 있고, 바로 새 기록 작성이 불가능
- 홈 카드 아이콘이 커스텀 인라인 SVG로 구현되어 있어 유지보수 불편

### 1.2 목표
1. '지금 이 순간' → '메모' 텍스트 전체 변경
2. 캘린더 날짜 클릭 → 기록 유형 선택 바텀시트 → 해당 날짜로 작성 페이지 이동
3. 홈 카드 아이콘을 lucide-react로 교체 (BookOpen, Zap, Lightbulb, Calendar)

---

## 2. 기능 상세

### FR-01: '메모'로 텍스트 변경

**변경 파일 목록:**

| 파일 | 현재 텍스트 | 변경 텍스트 |
|------|------------|------------|
| `src/components/BottomTabBar.tsx:29` | `label: '지금 이 순간'` | `label: '메모'` |
| `src/app/page.tsx:146` | `label="지금 이 순간"` | `label="메모"` |
| `src/app/page.tsx:147` | `description="짧은 순간의 기억"` | `description="짧은 메모 기록"` |
| `src/app/calendar/[date]/page.tsx:122` | `지금 이 순간 ({moments.length})` | `메모 ({moments.length})` |
| `src/app/moments/page.tsx:131` | `지금 이 순간` (h1) | `메모` |
| `src/app/moments/page.tsx:175` | `+ 지금 이 순간 기록` (버튼) | `+ 메모 기록` |
| `src/app/moments/page.tsx:184` | `지금 이 순간을 기록해보세요` | `메모를 기록해보세요` |
| `src/app/moments/new/page.tsx:66` | `지금 이 순간` (헤더) | `메모` |
| `src/app/moments/[id]/page.tsx:64` | `지금 이 순간` (헤더) | `메모` |
| `src/app/moments/[id]/edit/page.tsx:45` | `지금 이 순간` (label) | `메모` |
| `src/components/MomentForm.tsx:25` | `지금 이 순간` (label) | `메모` |

> `src/app/auth/signup.tsx`의 샘플 데이터 텍스트는 변경하지 않음 (사용자 데이터, UX 무관)

---

### FR-02: 캘린더 날짜 클릭 → 기록 유형 선택

**현재 동작:**
- 날짜 클릭 → `/calendar/{date}` (기록 목록 상세 페이지)

**변경 동작:**
- 날짜 클릭 → 바텀시트(모달) 표시
  - 선택지: 📖 일기 쓰기 | ⚡ 메모 쓰기 | 💡 아이디어 쓰기 | 📅 날짜 기록 보기
  - 선택 후 이동:
    - 일기: `/diary/new?date={date}`
    - 메모: `/moments/new?date={date}`
    - 아이디어: `/ideas/new?date={date}`
    - 날짜 보기: `/calendar/{date}` (기존)

**구현 방식:**
- `src/app/calendar/page.tsx`에 `selectedDate` state 추가
- 날짜 버튼 클릭 시 `router.push` 대신 `setSelectedDate(dateStr)` 호출
- 바텀시트 컴포넌트를 페이지 내 인라인으로 구현 (별도 컴포넌트 불필요)
- 바텀시트 외부 클릭 시 닫힘 (배경 overlay)

**각 작성 페이지에서 date 파라미터 처리:**
- `src/app/diary/new/page.tsx`: `useSearchParams`로 `date` 파라미터 읽어서 날짜 초기값 설정
- `src/app/moments/new/page.tsx`: 동일
- `src/app/ideas/new/page.tsx`: 동일

---

### FR-03: lucide-react 아이콘 교체

**설치:**
```bash
npm install lucide-react
```

**변경 파일: `src/app/page.tsx`**

| 현재 아이콘 컴포넌트 | lucide-react 아이콘 | 사용처 |
|---------------------|---------------------|--------|
| `<BookIcon />` | `<BookOpen />` | 일기 카드, 최근 기록 |
| `<BoltIcon />` | `<Zap />` | 메모 카드, 최근 기록 |
| `<BulbIcon />` | `<Lightbulb />` | 아이디어 카드, 최근 기록 |
| `<CalendarIcon />` | `<Calendar />` | 캘린더 카드 |

**변경 방법:**
- 기존 `BookIcon`, `BoltIcon`, `BulbIcon`, `CalendarIcon` 인라인 SVG 컴포넌트 삭제
- `import { BookOpen, Zap, Lightbulb, Calendar } from 'lucide-react'` 추가
- `color="#4A90D9"` `size={28}` props 적용

---

## 3. 구현 순서

1. `npm install lucide-react`
2. FR-01: 텍스트 변경 (파일 11개)
3. FR-03: `src/app/page.tsx` 아이콘 교체
4. FR-02: 캘린더 바텀시트 구현 (calendar/page.tsx)
5. FR-02: 각 new 페이지에서 date 파라미터 처리 (diary/new, moments/new, ideas/new)

---

## 4. 영향 범위

- 영향 파일: 14개
- 신규 파일: 없음 (기존 파일 수정만)
- 데이터/DB 변경: 없음
- Breaking Change: 없음

---

## 5. 완료 기준

- [ ] BottomTabBar '메모' 레이블 표시
- [ ] 모든 moments 관련 페이지에서 '지금 이 순간' 텍스트 제거
- [ ] 홈 카드에 lucide-react 아이콘 표시
- [ ] 캘린더 날짜 클릭 시 바텀시트 표시
- [ ] 바텀시트에서 선택 후 해당 날짜로 작성 페이지 이동
- [ ] 작성 페이지에서 date 파라미터로 날짜 자동 설정
