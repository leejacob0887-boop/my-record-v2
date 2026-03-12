# [Plan] AI Chat

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | AI Chat (자유 대화 + 기록 자동 저장) |
| 시작일 | 2026-03-11 |
| 예상 기간 | 3~4일 |
| 우선순위 | High |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 기록을 남기려면 매번 앱을 열고 타입(일기/메모/아이디어)을 직접 골라야 해서 마찰이 큼 |
| **Solution** | AI와 자유롭게 대화하다가 "저장해줘" 한 마디로 AI가 자동 분류 후 Supabase에 저장 |
| **Function UX Effect** | 대화하듯 기록하고, 분류는 AI가 알아서 — 기록의 마찰을 최소화 |
| **Core Value** | 생각을 자연스럽게 말하면 기록이 되는 경험, AI가 나의 기록 비서가 됨 |

---

## 1. 기능 개요

### 1.1 목적
AI와 자유롭게 대화하면서, "저장해줘" 명령 한 마디로 대화 내용을 AI가 분석해 일기·메모·아이디어 중 적절한 타입으로 자동 분류하여 Supabase에 저장한다.

### 1.2 핵심 기능 (이번 범위)

| # | 기능 | 설명 |
|---|------|------|
| 1 | **자유 대화 채팅 UI** | AI와 멀티턴 대화. 세션 내 히스토리 유지 |
| 2 | **"저장해줘" → 자동 분류 저장** | AI가 대화 내용 분석 → diary/moment/idea 분류 → Supabase 저장 |
| 3 | **AI 페르소나 분리** | 시스템 프롬프트를 별도 파일로 분리해 쉽게 수정 가능 |
| 4 | **홈 화면 AI 버튼** | "오늘 N개의 기록을 남겼어요" 옆 작은 버튼 → `/chat` 이동 |

### 1.3 제외 범위
- 기존 기록 컨텍스트 주입 (이번 버전 제외, 추후 확장)
- 대화 히스토리 영구 저장 (세션 한정)
- Push Notification

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | `/api/chat` API Route — Claude API 스트리밍 응답 | High |
| FR-02 | 채팅 UI — 메시지 입력, 전송, 스트리밍 응답 표시 | High |
| FR-03 | "저장해줘" 감지 → AI가 대화 분석 → diary/moment/idea 분류 | High |
| FR-04 | 분류된 기록을 Supabase에 저장 + 저장 완료 피드백 메시지 | High |
| FR-05 | AI 페르소나 — `src/lib/ai-persona.ts`에 시스템 프롬프트 분리 | High |
| FR-06 | 홈 화면 AI 버튼 (뇌/스파클 아이콘, `/chat` 링크) | High |
| FR-07 | 대화 중 이전 메시지 컨텍스트 유지 (멀티턴) | Medium |
| FR-08 | 로딩 상태 표시 (타이핑 인디케이터) | Medium |
| FR-09 | 저장 성공 시 저장된 기록 타입·제목 알림 메시지 | Medium |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | API 키는 서버 사이드에서만 사용 (환경변수, 클라이언트 노출 금지) |
| NFR-02 | 스트리밍 응답으로 체감 속도 개선 |
| NFR-03 | 저장 실패 시 사용자에게 명확한 에러 피드백 |

---

## 3. 핵심 플로우

### 3.1 일반 대화 플로우
```
사용자 입력 → /api/chat → Claude (system: 페르소나) → 스트리밍 응답 → UI 표시
```

### 3.2 "저장해줘" 플로우
```
사용자: "저장해줘"
  → /api/chat (save mode)
  → Claude: 대화 내용 분석
      → type: "diary" | "moment" | "idea"
      → title (diary/idea의 경우)
      → content / text
      → date: 오늘 날짜
  → 클라이언트: Supabase에 해당 타입으로 저장
  → AI: "✅ [일기]로 저장했어요! 제목: {title}"
```

### 3.3 저장 판단 기준 (AI 프롬프트)
| 기록 타입 | 조건 |
|-----------|------|
| `diary` | 하루 경험, 감정, 성찰 등 — 긴 이야기 |
| `moment` | 짧은 메모, 한 줄 생각, 순간적 느낌 |
| `idea` | 아이디어, 계획, 제안, 프로젝트 구상 |

---

## 4. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| AI 모델 | `claude-haiku-4-5-20251001` | 빠른 응답, 비용 효율 |
| SDK | `@anthropic-ai/sdk` | Anthropic 공식 SDK |
| 저장 | Supabase (기존 인프라) | 기존 diary/moment/idea 테이블 재사용 |
| 스트리밍 | Next.js API Route + ReadableStream | 서버 사이드 키 보호 |
| 페르소나 | `src/lib/ai-persona.ts` 별도 파일 | 수정 편의성 |

---

## 5. 구현 계획

### 5.1 파일 변경 목록

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/lib/ai-persona.ts` | 신규 | AI 시스템 프롬프트 정의 |
| `src/app/api/chat/route.ts` | 신규 | Claude API Route (스트리밍) |
| `src/app/chat/page.tsx` | 신규 | 채팅 페이지 |
| `src/components/ChatMessage.tsx` | 신규 | 메시지 버블 컴포넌트 |
| `src/app/page.tsx` | 수정 | 홈 화면 AI 버튼 추가 |
| `.env.local` | 수정 | `ANTHROPIC_API_KEY` 추가 |

### 5.2 의존성

```bash
npm install @anthropic-ai/sdk
```

### 5.3 구현 순서

```
Step 1: .env.local에 ANTHROPIC_API_KEY 추가
Step 2: @anthropic-ai/sdk 설치
Step 3: src/lib/ai-persona.ts — 페르소나 시스템 프롬프트 작성
Step 4: /api/chat route.ts — 일반 대화 + 저장 모드 분기
Step 5: ChatMessage.tsx — 메시지 버블 (user / assistant / system)
Step 6: /chat/page.tsx — 채팅 UI 전체
Step 7: src/app/page.tsx — 홈 화면 AI 버튼 추가
```

---

## 6. 수용 기준 (Acceptance Criteria)

- [ ] AI와 멀티턴 대화 가능 (이전 메시지 컨텍스트 유지)
- [ ] "저장해줘" 입력 시 AI가 대화를 분석해 적절한 타입으로 분류
- [ ] 분류된 기록이 Supabase에 실제로 저장됨
- [ ] 저장 후 AI가 "✅ [일기]로 저장했어요!" 형태의 피드백 제공
- [ ] 홈 화면에서 AI 버튼 클릭 시 `/chat` 페이지 이동
- [ ] API 키가 클라이언트 번들에 노출되지 않음
- [ ] `src/lib/ai-persona.ts`에서 시스템 프롬프트 쉽게 수정 가능

---

## 7. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| 저장 타입 분류 오류 | Medium | 저장 전 AI 답변에 타입 표시 → 사용자 확인 후 저장 (선택사항) |
| Supabase 저장 실패 | Low | try/catch + 에러 피드백 메시지 |
| 스트리밍 중 "저장해줘" 처리 | Low | 저장 요청은 별도 non-streaming 엔드포인트로 분리 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-11 | 초안 작성 (기록 컨텍스트 주입 포함) | Claude |
| 2026-03-11 | 재설계 — 자유 대화 + 저장 자동 분류 + 페르소나 분리 + 홈 AI 버튼 | Claude |
