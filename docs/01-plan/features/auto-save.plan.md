# [Plan] Auto Save (임시저장 Draft)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Auto Save — 폼 이탈 시 localStorage 임시저장 + 복원 토스트 |
| 시작일 | 2026-03-12 |
| 예상 기간 | 1일 |
| 우선순위 | High |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 일기/메모/아이디어 작성 중 실수로 뒤로가면 내용이 모두 사라져 재작성해야 함 |
| **Solution** | 작성 중 내용을 localStorage에 자동 임시저장하고, 재진입 시 토스트로 복원 제안 |
| **Function UX Effect** | 위에서 슥 내려오는 토스트 배너 + "이어쓰기/새로쓰기" 선택으로 데이터 손실 없는 경험 제공 |
| **Core Value** | 작성 흐름 끊김 없이 언제든 안심하고 기록 가능한 앱으로 신뢰도 향상 |

---

## 1. 기능 개요

### 1.1 임시저장 (Draft Save)

폼에서 텍스트를 입력하면 `localStorage`에 자동 저장. 페이지 이탈(뒤로가기, 탭 전환 등) 시에도 유지.

**흐름**: 입력 변경 → debounce(500ms) → `localStorage.setItem(draftKey, JSON)` 저장

### 1.2 복원 토스트 (Draft Restore Toast)

페이지 재진입 시 draft가 있으면 상단에서 토스트 배너가 슥 내려옴.

**흐름**: 마운트 → `localStorage.getItem(draftKey)` 확인 → draft 있으면 토스트 표시 →
- **이어쓰기**: draft 내용으로 폼 채움 + draft 삭제
- **새로쓰기**: draft 삭제 + 빈 폼 유지

### 1.3 draft 자동 삭제 시점

| 시점 | 동작 |
|------|------|
| 저장 완료 (`handleSubmit` 성공) | draft 삭제 |
| "새로쓰기" 선택 | draft 삭제 |
| "이어쓰기" 선택 | draft 삭제 (폼에 반영 후) |

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 입력 변경 시 debounce 500ms 후 localStorage 자동저장 | High |
| FR-02 | 재진입 시 draft 감지 → 상단 토스트 배너 표시 | High |
| FR-03 | 토스트: 위에서 슥 내려오는 slide-down 애니메이션 | High |
| FR-04 | "이어쓰기" 버튼 → draft 폼에 반영 + draft 삭제 | High |
| FR-05 | "새로쓰기" 버튼 → draft 삭제 + 빈 폼 유지 | High |
| FR-06 | 저장 완료 시 draft 자동 삭제 | High |
| FR-07 | 적용 대상: 일기(`diary/new`), 메모(`moments/new`), 아이디어(`ideas/new`) | High |
| FR-08 | draft key는 페이지별로 구분 (`draft:diary`, `draft:moment`, `draft:idea`) | High |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | 공통 훅 `useDraft(key)` 로 3개 페이지에서 재사용 |
| NFR-02 | 공통 토스트 컴포넌트 `DraftToast` 분리 |
| NFR-03 | draft 저장 필드: 페이지별 필요 필드만 (content/text, date 등) |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 저장소 | `localStorage` | 기존 데이터 저장 방식과 일치, 서버 불필요 |
| debounce | `useEffect` + `setTimeout` | 외부 라이브러리 없음 |
| 애니메이션 | Tailwind `translate-y` + `transition` | 기존 스타일 일관성 |
| 훅 | `useDraft(key, defaultValue)` | 3개 페이지 재사용 |

---

## 4. 구현 계획

### 4.1 신규 파일

```
src/hooks/useDraft.ts          — draft 저장/복원 훅
src/components/DraftToast.tsx  — 토스트 배너 컴포넌트
```

### 4.2 수정 파일

```
src/app/diary/new/page.tsx     — useDraft + DraftToast 추가
src/app/moments/new/page.tsx   — useDraft + DraftToast 추가
src/app/ideas/new/page.tsx     — useDraft + DraftToast 추가
```

### 4.3 핵심 로직

```ts
// useDraft 훅
function useDraft<T>(key: string) {
  const load = (): T | null => {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null'); }
    catch { return null; }
  };
  const save = (data: T) => localStorage.setItem(key, JSON.stringify(data));
  const clear = () => localStorage.removeItem(key);
  return { load, save, clear };
}

// 폼 페이지에서 사용
const { load, save, clear } = useDraft<DraftData>('draft:diary');

// debounce 저장
useEffect(() => {
  const id = setTimeout(() => save({ content, emotion, date }), 500);
  return () => clearTimeout(id);
}, [content, emotion, date]);

// 마운트 시 draft 확인
useEffect(() => {
  const draft = load();
  if (draft) setShowDraftToast(true);
}, []);
```

### 4.4 DraftToast UI

```
┌─────────────────────────────────────────────┐
│ 📝 이전 작성 내용이 있어요           [이어쓰기] [새로쓰기] │
└─────────────────────────────────────────────┘
  ↑ 위에서 slide-down, 배경 white/shadow, z-50
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 일기 폼에서 내용 입력 후 뒤로가기 → 재진입 시 토스트 표시
- [ ] 메모 폼에서 내용 입력 후 뒤로가기 → 재진입 시 토스트 표시
- [ ] 아이디어 폼에서 내용 입력 후 뒤로가기 → 재진입 시 토스트 표시
- [ ] 토스트가 위에서 슥 내려오는 애니메이션으로 표시됨
- [ ] "이어쓰기" 클릭 → 이전 내용이 폼에 채워짐
- [ ] "새로쓰기" 클릭 → 빈 폼 유지, toast 닫힘
- [ ] 저장 완료 후 재진입 시 toast 미표시 (draft 삭제됨)
- [ ] `useDraft` 훅이 3개 페이지에서 재사용됨
- [ ] `DraftToast` 컴포넌트가 분리되어 재사용됨

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| localStorage 파싱 오류 | Low | try/catch로 null 반환 |
| draft 필드 불일치 (스키마 변경) | Low | load 시 필드 유효성 확인 후 null 처리 |
| 토스트와 기존 UI 겹침 | Medium | `position: fixed` + `z-50`, 상단 safe-area 고려 |
| 빈 draft 저장 방지 | Low | 내용이 비어있으면 save 호출 안 함 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
