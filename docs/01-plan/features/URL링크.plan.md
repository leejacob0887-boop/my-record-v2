## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | URL/유튜브 링크 자동 처리 |
| 시작일 | 2026-03-21 |
| 목표 | 메모에 URL 붙여넣기만 하면 제목·썸네일 자동 표시, 태그 자동 생성 |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| Problem | URL만 붙여넣으면 어떤 내용인지 나중에 기억 안 됨 — 맥락 없는 링크 나열 |
| Solution | URL 감지 즉시 제목+썸네일 자동 가져오기, YouTube는 영상 카드로 표시 |
| Function UX Effect | 텍스트 입력 중 URL 감지 → 프리뷰 카드 자동 표시 → 그대로 저장 |
| Core Value | "기록하면 AI가 정리" — 링크도 맥락 있는 카드로 자동 변환 |

---

# URL/유튜브 링크 자동 처리 Plan

## 1. 개요

메모(Moment) 작성 시 URL을 입력하면 자동으로 링크 프리뷰를 가져와 카드 형태로 표시한다.
YouTube URL은 영상 제목 + 썸네일, 일반 URL은 페이지 제목을 가져온다.
저장 시 linkPreview 데이터가 메모와 함께 저장되고, 태그 #유튜브 또는 #링크가 자동 생성된다.

## 2. 현황 파악

| 항목 | 현재 상태 |
|------|---------|
| `Moment.linkPreview` | ❌ 없음 → 추가 필요 |
| `useMoments.add()` | ✅ 이미 tags 지원 (AI태그 구현) |
| `moments` Supabase 테이블 | ✅ 존재, `link_preview` JSONB 컬럼 추가 필요 |
| YouTube oEmbed | ✅ 무료 공개 API — API 키 불필요 |
| URL 감지 로직 | ❌ 없음 → 신규 |

## 3. 요구사항

### 3.1 기능 목록

| ID | 기능 | 우선순위 |
|----|------|---------:|
| F-01 | URL 감지 유틸 (`extractURL`) | P0 |
| F-02 | `/api/url/preview` API Route — YouTube + 일반 URL 처리 | P0 |
| F-03 | `useLinkPreview` 훅 — URL 감지 + 프리뷰 fetch | P0 |
| F-04 | `LinkPreviewCard` 컴포넌트 — 제목 + URL + 썸네일 표시 | P0 |
| F-05 | `moments/new/page.tsx` — URL 감지 + 프리뷰 자동 표시 | P0 |
| F-06 | `moments/[id]/page.tsx` — 저장된 링크 프리뷰 카드 표시 | P1 |
| F-07 | 태그 자동 생성 — #유튜브 / #링크 (useTags 연동) | P1 |
| F-08 | `Moment.linkPreview` 타입 추가 + useMoments 저장 지원 | P0 |

### 3.2 YouTube URL 판별 기준

```
youtube.com/watch?v=...
youtu.be/...
youtube.com/shorts/...
```

### 3.3 데이터 스키마

**types.ts 추가**

```ts
export interface LinkPreview {
  url: string;
  title: string;
  thumbnail?: string;
  type: 'youtube' | 'link';
}

// Moment에 추가
linkPreview?: LinkPreview;
```

**Supabase 추가 컬럼**

```sql
alter table public.moments
  add column if not exists link_preview jsonb default null;
```

### 3.4 API 설계

**`POST /api/url/preview`**

```json
// Request
{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }

// Response (YouTube)
{
  "title": "Rick Astley - Never Gonna Give You Up",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "type": "youtube"
}

// Response (일반 URL)
{
  "title": "Anthropic \\ Claude",
  "thumbnail": null,
  "type": "link"
}

// Response (실패)
{ "title": "", "thumbnail": null, "type": "link" }
```

## 4. 기술 스택

| 항목 | 내용 |
|------|------|
| YouTube | `youtube.com/oembed?url={url}&format=json` — API 키 없음 |
| 일반 URL | 서버사이드 fetch → `<title>` 또는 `og:title` 파싱 |
| API Route | `src/app/api/url/preview/route.ts` |
| Hook | `src/lib/useLinkPreview.ts` |
| Component | `src/components/LinkPreviewCard.tsx` |

## 5. 구현 전략

### 신규 파일
- `src/app/api/url/preview/route.ts` — 서버사이드 URL 프리뷰 fetch
- `src/lib/useLinkPreview.ts` — URL 감지 + 프리뷰 상태 관리
- `src/components/LinkPreviewCard.tsx` — 링크 카드 UI

### 수정 파일 (최소화)
- `src/lib/types.ts` — `LinkPreview` 인터페이스 + `Moment.linkPreview` 추가
- `src/lib/useMoments.ts` — `add()` linkPreview 파라미터 + `mapFromDB` 매핑
- `src/app/moments/new/page.tsx` — useLinkPreview 연동 + LinkPreviewCard 표시
- `src/app/moments/[id]/page.tsx` — 저장된 LinkPreviewCard 표시

### 트리거 방식
- textarea `onChange` → URL 정규식 감지 → debounce 500ms → `/api/url/preview` 호출
- 프리뷰 로드 후 태그 자동 추가 (useTags 연동)

## 6. 구현 순서

1. `types.ts` — LinkPreview 인터페이스 + Moment에 linkPreview 추가
2. `/api/url/preview/route.ts` — YouTube oEmbed + 일반 URL fetch
3. `useLinkPreview.ts` — URL 감지 + 프리뷰 상태
4. `LinkPreviewCard.tsx` — 카드 UI
5. `useMoments.ts` — add() + mapFromDB linkPreview 지원
6. `moments/new/page.tsx` — onChange 연동
7. `moments/[id]/page.tsx` — 저장된 프리뷰 표시
8. Supabase SQL 적용

## 7. 제외 범위

- 아이디어/일기에서 URL 처리 — 추후 확장
- URL 수동 편집/삭제 UI — 추후
- Open Graph 이미지 (일반 URL 썸네일) — 추후 (SSRF 위험, 일단 제목만)
