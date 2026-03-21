# URL/유튜브 링크 자동 처리 Completion Report

> **Project**: Notia (my-record-v2)
> **Feature**: URL/유튜브 링크 자동 처리
> **Completion Date**: 2026-03-21
> **Match Rate**: 97%
> **Status**: ✅ Approved

---

## Executive Summary

### Problem
사용자가 메모에 URL만 붙여넣으면 나중에 어떤 내용이었는지 기억하지 못함. 여러 링크가 텍스트 나열로만 남아 맥락을 잃는 문제.

### Solution
URL 감지 시 즉시 제목, 썸네일을 자동으로 가져와 카드 형태로 표시. YouTube는 영상 썸네일 + 제목, 일반 URL은 `og:title` 기반 제목으로 렌더링. 저장 시 linkPreview 메타데이터 함께 저장.

### Function/UX Effect
메모 작성 중 URL 감지 → 실시간 프리뷰 카드 표시 → 저장 시 linkPreview 영속화 → 상세 페이지에서 클릭 가능한 링크로 렌더링. 텍스트 내 URL 자동 감지 및 `renderTextWithLinks()` 함수로 클릭 가능하게 변환. 기존 메모도 실시간 fallback으로 프리뷰 표시.

### Core Value
"기록하면 AI가 정리" 철학 구현 — 링크도 단순 텍스트가 아닌 맥락 있는 카드로 자동 변환. 메모 가독성 향상 + 링크 접근성 개선 + 유튜브 영상 시각적 인식률 증대.

---

## PDCA Cycle Summary

### Plan Phase

**Document**: `docs/01-plan/features/URL링크.plan.md`

**Goal**: 메모 작성 시 URL을 붙여넣으면 자동으로 제목·썸네일을 가져와 카드 형태로 표시하기

**Planned Features**:
- F-01: URL 감지 유틸 (`extractURL`)
- F-02: `/api/url/preview` API Route (YouTube oEmbed + 일반 URL fetch)
- F-03: `useLinkPreview` 훅 (URL 감지 + 프리뷰 상태)
- F-04: `LinkPreviewCard` 컴포넌트 (카드 UI)
- F-05: `moments/new` 통합 (실시간 프리뷰)
- F-06: `moments/[id]` 통합 (저장된 프리뷰 표시)
- F-07: 태그 자동 생성 (#유튜브/#링크)
- F-08: `Moment.linkPreview` 타입 + useMoments 저장 지원

**Estimated Duration**: 2-3 days

### Design Phase

**Status**: ❌ 없음 — Plan 기준으로 직접 구현 진행

**Decision**: Design 문서 생략하고 Plan의 구조를 신뢰하고 구현. 이유: Plan이 매우 상세하고 API/데이터 모델이 명확함. 추후 유사 기능에는 Design 문서 추가 권장.

### Do Phase (Implementation)

**Completion Date**: 2026-03-21

**Implemented Files**:

1. **`src/app/api/url/preview/route.ts`** (77 lines)
   - YouTube ID 추출: 3가지 패턴 (watch?v=, youtu.be/, shorts/)
   - `fetchWithTimeout()`: AbortController 기반 5초 타임아웃
   - YouTube: oEmbed API 호출 → title + hqdefault.jpg 썸네일
   - 일반 URL: HTML fetch → og:title / <title> 파싱 (최대 100자)
   - 에러 시 graceful fallback

2. **`src/lib/useLinkPreview.ts`** (70 lines)
   - `extractURL()`: regex로 URL 감지 (`https?://[^\s"'<>]+`)
   - `useLinkPreview()`:
     - 600ms debounce
     - `fetchedUrlRef`로 동일 URL 중복 요청 방지
     - 언마운트 시 cleanup (cancelled flag)
     - `clearPreview()` 메서드

3. **`src/components/LinkPreviewCard.tsx`** (65 lines)
   - YouTube/Link 아이콘 구분
   - 썸네일 이미지 표시 (w-16 h-12)
   - title line-clamp-2, hostname 표시
   - Hover 시 ExternalLink 아이콘 + 스타일 transition
   - Loading skeleton (animate-pulse)

4. **`src/lib/types.ts`** 수정
   ```ts
   export interface LinkPreview {
     url: string
     title: string
     thumbnail?: string
     type: 'youtube' | 'link'
   }

   export interface Moment {
     // ... 기존 필드
     linkPreview?: LinkPreview
   }
   ```

5. **`src/lib/useMoments.ts`** 수정
   - `add()` 함수: `linkPreview` 파라미터 지원
   - `mapFromDB()`: DB에서 link_preview JSONB → LinkPreview 매핑

6. **`src/app/moments/new/page.tsx`** 수정
   - `useLinkPreview(text)` 훅 연동
   - `onChange` 이벤트에서 URL 감지
   - LinkPreviewCard 렌더링 (`<LinkPreviewCard preview={preview} loading={loading} />`)
   - `add()` 호출 시 linkPreview 파라미터 전달
   - 태그 자동 생성 (YouTube → #유튜브, 일반 URL → #링크)

7. **`src/app/moments/[id]/page.tsx`** 수정
   - `renderTextWithLinks()` 함수: 텍스트 내 URL을 `<a>` 태그로 변환
   - 저장된 linkPreview 있으면 LinkPreviewCard 표시
   - 없으면 `useLinkPreview()` 실시간 fallback으로 프리뷰 생성

**Actual Duration**: 1 day (2026-03-21)

### Check Phase (Gap Analysis)

**Document**: `docs/03-analysis/URL링크.analysis.md`

**Match Rate**: 97% ✅

**Analysis Results**:

| Category | Score | Status |
|----------|:-----:|:------:|
| Plan Match (기능 구현율) | 100% | ✅ |
| Architecture Compliance | 95% | ✅ |
| Convention Compliance | 97% | ✅ |

**Plan Feature Coverage**: 8/8 (100%)
- F-01~F-08 모두 구현됨

**Deductions** (-3%):
- Debounce 600ms vs planned 500ms (-2%)
- URL_REGEX 두 파일에 중복 정의 (-1%)

**Bonus Features** (+5 items):
- `renderTextWithLinks()`: 텍스트 내 URL → 클릭 가능한 `<a>` 태그
- Realtime fallback: 저장된 linkPreview 없어도 useLinkPreview로 실시간 표시
- `fetchWithTimeout()`: AbortController 5초 타임아웃
- 중복 요청 방지: fetchedUrlRef로 동일 URL 재요청 차단
- Loading skeleton: 프리뷰 로드 중 애니메이션 UI

---

## Results

### Completed Items

✅ **Core Features**
- URL 감지 유틸 (`extractURL`)
- `/api/url/preview` API Route — YouTube oEmbed + 일반 URL fetch
- `useLinkPreview` 훅 — 600ms debounce + 중복 방지
- `LinkPreviewCard` 컴포넌트 — 썸네일 + 제목 + 도메인
- `moments/new` 통합 — 실시간 프리뷰 표시
- `moments/[id]` 통합 — 저장된 프리뷰 표시
- 태그 자동 생성 (#유튜브/#링크)
- `Moment.linkPreview` 타입 + useMoments 저장

✅ **추가 구현**
- 텍스트 내 URL을 클릭 가능한 링크로 렌더링 (`renderTextWithLinks`)
- 실시간 fallback preview (저장되지 않은 메모도 프리뷰 표시)
- 안정화: AbortController 기반 5초 타임아웃
- 성능: fetchedUrlRef로 동일 URL 중복 요청 방지
- UX: Loading skeleton 애니메이션

### Incomplete/Deferred Items

⏸️ **계획했으나 제외 범위**:
- Open Graph 이미지 (일반 URL 썸네일) — SSRF 위험으로 제외, 제목만 사용
- 아이디어/일기에서 URL 처리 — 추후 확장
- URL 수동 편집/삭제 UI — 추후

---

## Technical Decisions

### 1. YouTube 처리 전략

**Decision**: oEmbed API 사용 + hqdefault.jpg 썸네일 직접 구성

**Rationale**:
- oEmbed: API 키 불필요, 공개 API
- 썸네일: YouTube ID에서 직접 생성 (`https://i.ytimg.com/vi/{id}/hqdefault.jpg`)
- oEmbed 실패해도 썸네일은 보장 (ID 기반이므로)

### 2. 일반 URL 제목 추출

**Decision**: `og:title` → `<title>` 폴백, 최대 100자 제한

**Rationale**:
- og:title: 소셜 공유용이므로 더 정확한 메타데이터
- title fallback: og:title이 없는 사이트 대응
- 100자 제한: UI 줄바꿈 (line-clamp-2) 안정성

### 3. Debounce 600ms (Plan 500ms vs 실제 600ms)

**Decision**: 600ms 사용

**Rationale**:
- 사용자가 URL 마지막 문자 입력 후 약간 대기 시간 제공
- 네트워크 지연 고려
- UX: 너무 빠르면 중간에 API 요청이 많아짐

### 4. Timeout 5초

**Decision**: AbortController 기반 5초 타임아웃

**Rationale**:
- 느린 네트워크 환경 보호
- 외부 URL fetch 무한 대기 방지
- 5초: 일반적인 HTTP 타임아웃 기준

### 5. 중복 요청 방지 (fetchedUrlRef)

**Decision**: URL 캐싱으로 동일 URL 재요청 차단

**Rationale**:
- 성능: 같은 URL 여러 번 입력해도 1회만 요청
- 서버 부하 감소
- UX: 프리뷰 즉시 표시

### 6. Realtime Fallback Preview

**Decision**: 저장된 linkPreview 없으면 useLinkPreview로 실시간 생성

**Rationale**:
- 기존 메모(linkPreview 없는)도 상세 페이지에서 링크 표시
- 마이그레이션 필요 없음 (하위호환성)
- UX: 모든 URL이 클릭 가능하고 프리뷰 표시

---

## Code Metrics

| Metric | Value |
|--------|-------|
| **Lines of Code (신규)** | 212 lines |
| **Files Created** | 3 (`route.ts`, `useLinkPreview.ts`, `LinkPreviewCard.tsx`) |
| **Files Modified** | 4 (`types.ts`, `useMoments.ts`, `moments/new/page.tsx`, `moments/[id]/page.tsx`) |
| **API Endpoints** | 1 (`POST /api/url/preview`) |
| **Components** | 1 (`LinkPreviewCard`) |
| **Hooks** | 1 (`useLinkPreview`) |
| **Types** | 1 (`LinkPreview` interface) |
| **Dependencies Added** | 0 (기존 deps 사용) |

---

## Design vs Implementation Alignment

### API Specification (100% Match)

| Aspect | Planned | Actual | Status |
|--------|---------|--------|:------:|
| Endpoint | POST /api/url/preview | POST /api/url/preview | ✅ |
| Request | `{ url: string }` | `{ url: string }` | ✅ |
| Response (YouTube) | `{ title, thumbnail, type: 'youtube' }` | `{ title, thumbnail, type: 'youtube' }` | ✅ |
| Response (Link) | `{ title, thumbnail: null, type: 'link' }` | `{ title, thumbnail: null, type: 'link' }` | ✅ |
| YouTube patterns | watch?v=, youtu.be/, shorts/ | watch?v=, youtu.be/, shorts/ | ✅ |

### Data Model (100% Match)

```typescript
// Planned
interface LinkPreview {
  url: string
  title: string
  thumbnail?: string
  type: 'youtube' | 'link'
}

// Actual
interface LinkPreview {
  url: string
  title: string
  thumbnail?: string
  type: 'youtube' | 'link'
}
```

### Architecture Compliance

| Layer | Expected | Implemented | Status |
|-------|----------|-------------|:------:|
| Components | `src/components/` | `LinkPreviewCard.tsx` | ✅ |
| Hooks | `src/lib/` | `useLinkPreview.ts` | ✅ |
| API Route | `src/app/api/` | `src/app/api/url/preview/route.ts` | ✅ |
| Types | `src/lib/types.ts` | `LinkPreview` 추가 | ✅ |

---

## Lessons Learned

### What Went Well

1. **Plan의 명확한 구조**
   - 구체적인 요구사항 덕분에 Design 문서 없이도 구현 가능
   - API 스펙과 데이터 모델이 명확해서 구현 속도 향상

2. **YouTube oEmbed API 선택**
   - API 키 불필요, 공개 API
   - 완벽한 메타데이터 제공
   - 썸네일 구성도 간단

3. **Hook 기반 설계**
   - useLinkPreview 역할 분리로 컴포넌트 깔끔
   - 상세 페이지에서도 재사용 가능

4. **Debounce + 중복 방지**
   - fetchedUrlRef로 불필요한 API 요청 차단
   - 600ms debounce는 사용자 입력 지연 없이 효율적

5. **Realtime Fallback**
   - 기존 메모 마이그레이션 없이 상위호환성 유지
   - 새 기능이 모든 메모에 투명하게 작동

### Areas for Improvement

1. **URL_REGEX 중복 정의**
   - `useLinkPreview.ts`에만 정의하면 좋았을 것
   - 추후 공통 유틸 파일 고려

2. **일반 URL 썸네일**
   - Open Graph 이미지 미지원 (SSRF 위험)
   - 추후 이미지 프록시 또는 안전한 방식 검토 필요

3. **Timeout 설정 하드코딩**
   - 5000ms가 모든 경우에 적절한지 테스트 필요
   - 배포 환경별로 조정 가능하게 환경변수화 고려

4. **에러 처리 UX**
   - URL 파싱 실패 시 빈 카드 표시 (title: '')
   - 사용자에게 "이 URL을 가져올 수 없음" 메시지 추가 고려

### To Apply Next Time

1. **Plan-to-Code 빠른 경로**
   - 요구사항이 명확하고 기술 결정이 낮으면 Design 문서 스킵 가능
   - 단, 이전에 충분한 architectural review 필요

2. **공통 유틸 사전 정의**
   - 여러 파일에 쓸 법한 함수/정규식은 별도 파일에서 export
   - extractURL, renderTextWithLinks 같은 재사용 함수 먼저 구현

3. **Realtime vs Stored 모두 지원**
   - 새 기능 추가 시 "저장된 데이터 없으면 실시간으로 생성" 패턴 유용
   - 하위호환성 + 마이그레이션 비용 제거

4. **타임아웃을 환경변수화**
   - 배포 환경별로 조정 가능하도록 from 시작부터

---

## Future Improvements

### Short Term (v1.1)

1. **일반 URL Open Graph 이미지**
   - 이미지 프록시 또는 안전한 썸네일 추출
   - 링크 카드 완성도 향상

2. **에러 메시지 개선**
   - "이 링크를 가져올 수 없음" 명시
   - 사용자에게 더 명확한 피드백

3. **URL_REGEX 공통 유틸화**
   - `src/lib/urlUtils.ts`에 `extractURL`, `renderTextWithLinks` 통합

### Medium Term (v1.2)

1. **아이디어/일기에도 URL 처리 지원**
   - Moment뿐 아니라 모든 기록 타입에 linkPreview 추가
   - 일관된 UX

2. **URL 수동 편집/삭제 UI**
   - 메모 상세에서 LinkPreviewCard 우측에 X 버튼
   - 스스로 생성된 프리뷰 수정 기능

3. **링크 프리뷰 캐싱**
   - 서버 사이드 Redis 캐싱 (동일 URL 여러 사용자)
   - API 호출 감소

### Long Term (v2.0)

1. **링크 통계**
   - 가장 많이 저장된 URL, 도메인별 통계
   - "당신이 자주 방문하는 사이트" 대시보드

2. **링크 클러스터링**
   - 같은 도메인의 링크들을 자동으로 그룹화
   - 도메인별 관심사 시각화

3. **Semantic 링크 분석**
   - 링크 제목 + 메모 텍스트로 자동 태그 생성 고도화
   - AI 기반 "관련 링크" 추천

---

## Next Steps

1. **Supabase Migration 확인**
   - `alter table moments add column link_preview jsonb default null` 실행 확인

2. **E2E 테스트**
   - YouTube URL 3가지 패턴 모두 테스트
   - 일반 URL (og:title, title tag 모두 있는 경우)
   - 느린 네트워크 타임아웃 확인

3. **UX 폴리싱**
   - 로딩 skeleton 애니메이션 속도 조정
   - 다크 모드 색상 재확인

4. **에러 케이스 문서화**
   - "이 URL을 가져올 수 없는 경우" 사례 정리
   - 사용자 가이드에 추가

5. **성능 모니터링**
   - Vercel Analytics에서 `/api/url/preview` 응답 시간 추적
   - 평균 응답 시간 목표: < 2초

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-21 | Initial completion report | Report Generator |

---

## Related Documents

- **Plan**: `docs/01-plan/features/URL링크.plan.md`
- **Analysis**: `docs/03-analysis/URL링크.analysis.md`
- **Implementation**:
  - `src/app/api/url/preview/route.ts`
  - `src/lib/useLinkPreview.ts`
  - `src/components/LinkPreviewCard.tsx`
  - `src/lib/types.ts` (modified)
  - `src/lib/useMoments.ts` (modified)
  - `src/app/moments/new/page.tsx` (modified)
  - `src/app/moments/[id]/page.tsx` (modified)
