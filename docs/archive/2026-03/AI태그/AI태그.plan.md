## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | AI 태그 자동생성 |
| 시작일 | 2026-03-21 |
| 목표 | 기록 저장 시 AI가 태그 2~3개 자동 생성, 사용자 직접 편집 가능 |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| Problem | 기록이 쌓일수록 나중에 찾기 어렵고 분류가 안 됨 |
| Solution | AI가 저장 즉시 태그 2~3개 자동 생성 — 사용자는 아무것도 안 해도 됨 |
| Function UX Effect | 일기/메모/아이디어/투두 저장 시 자동 태그 칩 표시, 직접 추가/삭제 가능 |
| Core Value | "기록하면 AI가 정리" — Notia 핵심 철학의 태그 버전 실현 |

---

# AI 태그 자동생성 Plan

## 1. 개요

일기/메모/아이디어/투두를 저장할 때 Anthropic API가 내용을 분석해 2~3개의 짧은 한국어 태그를 자동 생성한다.
기존 태그 목록에서 재사용하고, 없으면 신규 생성. 사용자가 직접 추가/삭제도 가능.

## 2. 현황 파악

| 항목 | 현재 상태 |
|------|---------|
| `DiaryEntry.tags` | ✅ 이미 `tags?: string[]` 존재 |
| `useDiary.save()` | ✅ 이미 `tags?: string[]` 파라미터 지원 |
| `diary_entries.tags` (Supabase) | ✅ 이미 컬럼 존재 (tags text[]) |
| `Idea.tags` | ❌ 없음 → 추가 필요 |
| `Moment.tags` | ❌ 없음 → 추가 필요 |
| `Todo.tags` | ❌ 없음 → 추가 필요 |
| `ai-persona.ts` TAG_GENERATION_PROMPT | ❌ 없음 → 추가 필요 |

## 3. 요구사항

### 3.1 기능 목록

| ID | 기능 | 우선순위 |
|----|------|---------|
| F-01 | AI 태그 자동 생성 API (`/api/tags/generate`) | P0 |
| F-02 | `ai-persona.ts`에 `TAG_GENERATION_PROMPT` 추가 | P0 |
| F-03 | 일기 저장 시 자동 태그 생성 및 표시 | P0 |
| F-04 | 메모(Moment) 저장 시 자동 태그 생성 | P1 |
| F-05 | 아이디어 저장 시 자동 태그 생성 | P1 |
| F-06 | 투두 저장 시 자동 태그 생성 | P2 |
| F-07 | `TagInput` 컴포넌트 — 태그 칩 표시 + 추가/삭제 | P0 |
| F-08 | 기존 태그 목록 조회 및 재사용 (`useTags` hook) | P1 |
| F-09 | 음성/카메라 저장 시도 자동 태그 생성 | P1 |

### 3.2 태그 생성 규칙

```
- 2~4글자 한국어 태그 2~3개
- 명사 또는 짧은 형용사
- 예: "운동", "기분좋음", "업무", "가족", "독서", "회의"
- 기존 태그 목록과 겹치면 동일 태그 재사용
- 감정/활동/주제 중심으로 생성
```

### 3.3 데이터 스키마

**Supabase 추가 컬럼**

```sql
-- ideas 테이블에 tags 추가
alter table public.ideas add column if not exists tags text[] default '{}';

-- moments 테이블에 tags 추가
alter table public.moments add column if not exists tags text[] default '{}';

-- todos 테이블에 tags 추가
alter table public.todos add column if not exists tags text[] default '{}';
```

### 3.4 API 설계

**`POST /api/tags/generate`**

```json
// Request
{
  "content": "오늘 헬스장에서 1시간 운동했다. 기분이 너무 좋았다.",
  "type": "diary",
  "existingTags": ["운동", "기분좋음", "일상"]
}

// Response
{
  "tags": ["운동", "기분좋음", "건강"]
}
```

## 4. 기술 스택

| 항목 | 내용 |
|------|------|
| AI 모델 | claude-haiku-4-5-20251001 (빠른 응답, 저비용) |
| Prompt 위치 | `src/lib/ai-persona.ts` — `TAG_GENERATION_PROMPT` 추가 |
| API Route | `src/app/api/tags/generate/route.ts` |
| Hook | `src/lib/useTags.ts` — 기존 태그 조회 + 자동 생성 호출 |
| Component | `src/components/TagInput.tsx` — 칩 형태 태그 편집 UI |

## 5. 구현 전략 (기존 코드 최소 수정)

### 수정 파일 (최소화)
- `src/lib/ai-persona.ts` — `TAG_GENERATION_PROMPT` export 추가 (기존 내용 무변경)
- `src/lib/types.ts` — Idea, Moment에 `tags?: string[]` 추가

### 신규 파일
- `src/app/api/tags/generate/route.ts` — 태그 생성 API
- `src/lib/useTags.ts` — 태그 훅 (전체 태그 목록 + 자동 생성)
- `src/components/TagInput.tsx` — 태그 칩 UI

### 폼 연동 방식
각 폼(DiaryForm, IdeaForm, MomentForm)에 `TagInput` 추가 — 저장 직전 AI 태그 생성 → 사용자 확인/편집 → 최종 저장

## 6. 구현 순서

1. `TAG_GENERATION_PROMPT` 작성 + `ai-persona.ts` 추가
2. `/api/tags/generate` API Route 구현
3. `TagInput.tsx` 컴포넌트
4. `useTags.ts` 훅 (기존 태그 목록, 자동 생성 호출)
5. `DiaryForm.tsx` — TagInput 연동
6. `IdeaForm.tsx` — TagInput 연동
7. `MomentForm.tsx` — TagInput 연동
8. types.ts — Idea, Moment에 tags 추가
9. Supabase SQL 적용

## 7. 제외 범위

- 태그 기반 검색/필터 UI — 추후 기능
- 태그 관리 페이지 (전체 태그 목록) — 추후 기능
- 태그 통계/분석 — 추후 기능
