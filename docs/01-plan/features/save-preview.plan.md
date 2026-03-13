# [Plan] Save Preview (저장 완료 미리보기 카드)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Save Preview — 저장 직후 하단에서 올라오는 감성 미리보기 카드 |
| 시작일 | 2026-03-12 |
| 예상 기간 | 1일 |
| 우선순위 | Medium |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 저장 후 바로 목록 페이지로 넘어가버려 "잘 저장됐나?" 하는 불안감이 생기고, 작성한 내용을 한번 더 확인할 수 없음 |
| **Solution** | 저장 직후 하단에서 카드가 슥 올라와 제목·내용 일부를 보여주고, 3~4초 뒤 자동으로 사라짐 |
| **Function UX Effect** | 저장 성공을 시각적으로 확인하는 만족감 + 작성 내용 최종 확인 → 기록 앱 특유의 감성적 마무리 경험 제공 |
| **Core Value** | 기록을 마무리하는 순간의 소소한 뿌듯함과 신뢰감 — 단순 toast가 아닌 내 기록을 되새기는 감성 터치 |

---

## 1. 기능 개요

### 1.1 저장 미리보기 카드 (Save Preview Card)

저장(`handleSubmit`) 성공 직후, 페이지 이동 전에 하단에서 카드가 슥 올라옴.
카드에는 저장된 내용의 요약(제목, 내용 일부, 저장 시각)을 표시.

**흐름**: 저장 완료 → 카드 마운트 (slide-up) → 3.5초 대기 → 카드 사라짐 (slide-down) → 목록 페이지 이동

### 1.2 닫기 버튼

카드 우상단 ✕ 버튼 클릭 시 즉시 dismiss → 목록 페이지 이동.

### 1.3 자동 dismiss

3.5초 타이머 만료 시 slide-down 애니메이션 후 목록 이동.

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 저장 성공 후 하단에서 카드 slide-up 등장 | High |
| FR-02 | 카드에 제목(또는 내용 첫 줄), 내용 일부(최대 60자), 저장 시각 표시 | High |
| FR-03 | 3.5초 후 자동으로 slide-down 후 목록 이동 | High |
| FR-04 | 닫기(✕) 버튼 클릭 시 즉시 dismiss 후 목록 이동 | High |
| FR-05 | 3개 페이지 적용: diary/new, moments/new, ideas/new | High |
| FR-06 | 다크모드 완전 대응 | High |
| FR-07 | 카드 내 아이콘: 페이지 타입별 이모지 (📖 일기 / 💬 메모 / 💡 아이디어) | Medium |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | 공통 컴포넌트 `SavePreviewCard` 분리 — 3개 페이지 재사용 |
| NFR-02 | slide-up / slide-down 애니메이션 모두 구현 (진입/퇴장 대칭) |
| NFR-03 | 카드가 화면에 있는 동안 목록 이동 차단 (dismiss 후 이동) |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 상태 관리 | `useState` (showPreview, previewData) | 외부 라이브러리 불필요 |
| 타이머 | `useEffect` + `setTimeout` | 3.5초 자동 dismiss |
| 애니메이션 | CSS keyframe (slide-up / slide-down) | 기존 globals.css 패턴 일관성 |
| 이동 | `router.push()` — dismiss 콜백 내에서만 호출 | 카드 표시 중 이동 방지 |

---

## 4. 구현 계획

### 4.1 신규 파일

```
src/components/SavePreviewCard.tsx  — 미리보기 카드 컴포넌트
```

### 4.2 수정 파일

```
src/app/globals.css                 — slide-down-out 애니메이션 추가
src/app/diary/new/page.tsx          — SavePreviewCard 연동
src/app/moments/new/page.tsx        — SavePreviewCard 연동
src/app/ideas/new/page.tsx          — SavePreviewCard 연동
```

### 4.3 SavePreviewCard Props

```ts
type SavePreviewCardProps = {
  type: 'diary' | 'moment' | 'idea';
  title?: string;        // 제목 (diary, idea)
  content: string;       // 내용 (최대 60자 truncate)
  savedAt: string;       // 저장 시각 "HH:MM"
  onDismiss: () => void; // 닫기 or 타이머 만료 시 호출
};
```

### 4.4 핵심 로직

```ts
// handleSubmit 내
const [preview, setPreview] = useState<PreviewData | null>(null);

const handleSubmit = async () => {
  // ... 저장 로직 ...
  const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  setPreview({ title, content, savedAt: now }); // 카드 표시 (이동 안 함)
};

const handleDismiss = () => {
  setPreview(null);
  router.push('/diary'); // dismiss 후 이동
};
```

### 4.5 애니메이션 (globals.css 추가)

```css
@keyframes slide-down-out {
  from { transform: translateY(0) scale(1); opacity: 1; }
  to   { transform: translateY(120%) scale(0.95); opacity: 0; }
}
.animate-slide-down-out {
  animation: slide-down-out 0.3s ease-in forwards;
}
```

### 4.6 UI 레이아웃

```
┌──────────────────────────────────────────┐
│  [fixed bottom-24, center, max-w-360px]  │
│ ┌────────────────────────────────────┐   │
│ │ 📖  오늘의 일기            [✕]    │   │
│ │     오늘 하루는 정말 행복했다. 창... │   │
│ │     방금 저장됨 · 14:32           │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
  ↑ backdrop-blur, rounded-2xl, shadow
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 일기 저장 후 카드가 하단에서 올라옴
- [ ] 메모 저장 후 카드가 하단에서 올라옴
- [ ] 아이디어 저장 후 카드가 하단에서 올라옴
- [ ] 카드에 제목/내용 일부/저장시각 표시됨
- [ ] 3.5초 후 자동으로 사라지며 목록 이동
- [ ] ✕ 버튼 클릭 시 즉시 사라지며 목록 이동
- [ ] slide-up / slide-down 애니메이션 모두 동작
- [ ] 다크모드에서 카드 잘 보임
- [ ] `SavePreviewCard` 컴포넌트가 3개 페이지에서 재사용됨

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| 카드 표시 중 뒤로가기로 이탈 | Medium | 카드는 시각적 요소만 — 실제 데이터는 이미 저장됨으로 문제없음 |
| 타이머와 수동 dismiss 중복 호출 | Low | `dismissed` ref로 중복 방지 |
| 긴 내용 레이아웃 깨짐 | Low | content 60자 truncate + line-clamp-2 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
