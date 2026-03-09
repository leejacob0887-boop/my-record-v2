# my-record-v2 Planning Document

> **Summary**: 3가지 유형의 개인 기록(일기, 지금 이 순간, 아이디어)을 관리하는 미니멀 모바일 최적화 웹앱
>
> **Project**: my-record-v2
> **Version**: 0.1.0
> **Author**: jacob
> **Date**: 2026-03-09
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 일기·순간·아이디어를 하나의 앱에서 유형별로 구분해 기록할 수 있는 도구가 없음 |
| **Solution** | 3가지 기록 유형(일기/지금 이 순간/아이디어)을 카드 UI로 분리하고, LocalStorage로 데이터 저장 |
| **Function/UX Effect** | 랜딩에서 유형별 카드를 선택해 진입, 각 유형마다 최적화된 CRUD 폼 제공, 모바일 최적화 미니멀 UI |
| **Core Value** | 설치·가입 없이 바로 쓰는 개인 기록 공간 — 3가지 기록 유형을 하나의 앱에서 관리 |

---

## 1. Overview

### 1.1 Purpose

사용자가 일상의 기록을 3가지 유형으로 구분하여 저장·관리할 수 있도록 한다.
- **일기**: 하루 하나씩 깊게 쓰는 글
- **지금 이 순간**: 하루 여러 번 남기는 짧은 순간 기록
- **아이디어**: 언제든 떠오르는 생각을 무제한으로 저장

### 1.2 Background

기존 일기 앱들은 단일 유형만 지원하거나 복잡한 구조를 가진다.
이 앱은 백엔드 없이 LocalStorage만 사용해 빠르고 단순하게 동작하며,
모바일 화면에서도 편하게 쓸 수 있는 미니멀 디자인을 목표로 한다.

### 1.3 Related Documents

- 기존 Plan: `docs/01-plan/my-record-v2.plan.md`

---

## 2. Scope

### 2.1 In Scope

- [ ] 랜딩 페이지 — 3가지 기록 유형 카드 표시 (최근 기록 수 / 미리보기)
- [ ] **일기** CRUD (하루 1개 제한, 제목+본문+사진선택)
- [ ] **지금 이 순간** CRUD (하루 여러 개, 짧은 글+사진선택)
- [ ] **아이디어** CRUD (무제한, 제목+내용+사진선택)
- [ ] LocalStorage 데이터 저장·불러오기
- [ ] 사진 선택 (로컬 파일 → base64 저장)
- [ ] 모바일 최적화 미니멀 UI (Tailwind CSS)

### 2.2 Out of Scope

- 서버/백엔드/DB (LocalStorage 전용)
- 회원가입·로그인
- 클라우드 동기화
- 푸시 알림
- 검색 기능 (v2에서 고려)
- 태그/카테고리 (v2에서 고려)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 랜딩 페이지에서 3개 기록 유형을 카드로 표시 | High | Pending |
| FR-02 | 일기: 날짜당 1개만 작성 가능 (중복 시 수정으로 유도) | High | Pending |
| FR-03 | 일기: 제목 + 본문 + 사진 선택 | High | Pending |
| FR-04 | 지금 이 순간: 하루 여러 개 작성 가능 | High | Pending |
| FR-05 | 지금 이 순간: 짧은 글 + 사진 선택 | High | Pending |
| FR-06 | 아이디어: 무제한 작성 | High | Pending |
| FR-07 | 아이디어: 제목 + 내용 + 사진 선택 | High | Pending |
| FR-08 | 각 유형별 목록, 상세, 수정, 삭제 (CRUD 완성) | High | Pending |
| FR-09 | LocalStorage에 데이터 저장 (앱 재시작 시 유지) | High | Pending |
| FR-10 | 사진 선택: 로컬 파일 → base64 저장 | Medium | Pending |
| FR-11 | 카드에 최근 기록 수 또는 최신 내용 미리보기 표시 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 모바일 최적화 | 375px 이상 모든 화면에서 정상 동작 | 브라우저 DevTools |
| 성능 | 페이지 로드 2초 이내 | Lighthouse |
| 접근성 | 버튼/입력 요소에 적절한 레이블 | 시각적 확인 |
| 미니멀 디자인 | 외부 UI 라이브러리 미사용 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 3가지 유형 모두 CRUD 동작 확인
- [ ] LocalStorage 저장·복원 확인
- [ ] 모바일(375px) 레이아웃 정상
- [ ] 일기 하루 1개 제한 로직 동작

### 4.2 Quality Criteria

- [ ] TypeScript 타입 오류 없음
- [ ] Zero lint errors
- [ ] Tailwind CSS만 사용 (외부 UI 라이브러리 없음)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 사진 base64 저장 시 LocalStorage 용량 초과 (5MB 제한) | High | Medium | 사진 크기 압축 또는 저장 개수 제한 안내 |
| 일기 하루 1개 제한 로직 복잡도 | Low | Low | 날짜 키(YYYY-MM-DD)로 조회 후 분기 처리 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ✅ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☐ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | Next.js 15 | 기존 프로젝트 기반 |
| State Management | Context / useState / Zustand | useState + Custom Hook | 단순 앱, 외부 라이브러리 불필요 |
| 데이터 저장 | LocalStorage / IndexedDB | LocalStorage | 백엔드 없는 정적 앱 |
| 사진 저장 | base64 / File URL | base64 (LocalStorage) | 외부 서버 불필요 |
| Styling | Tailwind / CSS Modules | Tailwind CSS | 기존 컨벤션 |
| Backend | BaaS / Custom / 없음 | 없음 (LocalStorage) | Starter 레벨 |

### 6.3 Folder Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 랜딩 (3개 유형 카드)
│   ├── diary/
│   │   ├── page.tsx               # 일기 목록
│   │   ├── new/page.tsx           # 일기 작성
│   │   └── [id]/
│   │       ├── page.tsx           # 일기 상세
│   │       └── edit/page.tsx      # 일기 수정
│   ├── moments/
│   │   ├── page.tsx               # 지금 이 순간 목록
│   │   ├── new/page.tsx           # 새 순간 기록
│   │   └── [id]/
│   │       ├── page.tsx           # 상세
│   │       └── edit/page.tsx      # 수정
│   └── ideas/
│       ├── page.tsx               # 아이디어 목록
│       ├── new/page.tsx           # 아이디어 작성
│       └── [id]/
│           ├── page.tsx           # 상세
│           └── edit/page.tsx      # 수정
├── components/
│   ├── Header.tsx
│   ├── RecordTypeCard.tsx         # 랜딩 카드 (유형별)
│   ├── DiaryForm.tsx
│   ├── MomentForm.tsx
│   ├── IdeaForm.tsx
│   └── ImagePicker.tsx            # 공통 사진 선택
└── lib/
    ├── useDiary.ts                # 일기 LocalStorage 훅
    ├── useMoments.ts              # 순간 LocalStorage 훅
    ├── useIdeas.ts                # 아이디어 LocalStorage 훅
    └── types.ts                   # 공통 타입 정의
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md`에 코딩 컨벤션 정의됨
- [ ] ESLint configuration 확인 필요
- [x] TypeScript strict mode

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | CLAUDE.md 존재 | PascalCase(컴포넌트), camelCase(훅/함수) | High |
| **Folder structure** | CLAUDE.md 존재 | 위 6.3 구조 따름 | High |
| **LocalStorage 키** | 미정 | `diary:`, `moments:`, `ideas:` prefix | High |
| **타입 정의** | 미정 | `lib/types.ts` 중앙화 | Medium |

### 7.3 LocalStorage Key Convention

| Key Pattern | 용도 |
|-------------|------|
| `diary_YYYY-MM-DD` | 일기 (날짜당 1개) |
| `moments_list` | 지금 이 순간 전체 목록 (JSON array) |
| `ideas_list` | 아이디어 전체 목록 (JSON array) |

---

## 8. Next Steps

1. [ ] `/pdca design my-record-v2` — 상세 설계 (컴포넌트·훅 인터페이스 정의)
2. [ ] `lib/types.ts` 작성 (Record 공통 타입)
3. [ ] 각 훅 구현 (`useDiary`, `useMoments`, `useIdeas`)
4. [ ] 컴포넌트 구현 (Form, Card, Header)
5. [ ] 페이지 구현 (랜딩 → 각 유형 CRUD)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-09 | Initial draft — 3가지 기록 유형 정의 | jacob |
