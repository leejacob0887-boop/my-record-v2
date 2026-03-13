# [Plan] Share Feature (기록 공유하기)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Share Feature — 일기/메모/아이디어를 감성 카드 이미지로 만들어 공유하는 기능 |
| 시작일 | 2026-03-12 |
| 예상 기간 | 1일 |
| 우선순위 | Medium |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 기록한 내용을 지인과 공유하려면 직접 스크린샷을 찍어야 해서 불편하고, UI 요소가 함께 찍혀 감성이 떨어짐 |
| **Solution** | 버튼 하나로 기록을 감성 카드 이미지로 렌더링 → 카카오톡/문자 등 기본 공유 시트로 즉시 공유 |
| **Function UX Effect** | 공유 버튼 클릭 → 카드 이미지 생성(Canvas) → Web Share API 공유 시트 → 미지원 시 이미지 자동 다운로드 |
| **Core Value** | 기록의 감성적 가치를 외부로 확장 — "내가 쓴 글이 예쁜 카드가 된다"는 경험으로 기록 앱 바이럴 유도 |

---

## 1. 기능 개요

### 1.1 공유 버튼

일기/메모/아이디어 상세 페이지 헤더 우측에 공유 아이콘 버튼 추가.
(편집·삭제 버튼과 같은 영역)

### 1.2 감성 카드 이미지 생성

Canvas API (외부 라이브러리 없음)로 오프스크린 캔버스에 카드를 그린 후 PNG blob 생성.

**카드 사양**
- 크기: 900 × 560 px (2:1.25 비율, SNS 공유 최적)
- 배경: 타입별 파스텔 그라디언트
  - 일기: `#EEF2FF → #E0E7FF` (인디고 계열)
  - 메모: `#F0F9FF → #E0F2FE` (하늘 계열)
  - 아이디어: `#FEFCE8 → #FEF9C3` (노란 계열)
- 레이아웃:
  ```
  ┌──────────────────────────────────────────────────────┐
  │  [타입 이모지]  [날짜]                    나의 기록   │
  │                                                      │
  │  [제목 — bold 28px]                                  │
  │                                                      │
  │  [내용 미리보기 — 최대 120자, regular 18px]          │
  │                                                      │
  │  ───────────────────────────────────────             │
  │  나의 기록 · my-record                               │
  └──────────────────────────────────────────────────────┘
  ```
- 폰트: 시스템 폰트 스택 (`-apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR'`)
- 다크모드 시: 카드 배경 어둡게 (`#1F2937 → #111827`), 텍스트 흰색 계열

### 1.3 공유 실행

```
navigator.share 지원 여부 확인
  ├── 지원: navigator.share({ files: [imageFile], title, text })
  └── 미지원: <a href=dataURL download="my-record-card.png"> 클릭
```

### 1.4 로딩 상태

카드 생성 중(~100ms) 버튼에 스피너 표시. 에러 시 토스트 메시지.

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 일기/메모/아이디어 상세 페이지 헤더에 공유 버튼 추가 | High |
| FR-02 | 공유 버튼 클릭 → Canvas로 감성 카드 이미지 생성 | High |
| FR-03 | 카드에 타입 이모지, 날짜, 제목, 내용 미리보기, 앱 로고 표시 | High |
| FR-04 | 타입별 파스텔 그라디언트 배경 | High |
| FR-05 | Web Share API 지원 시 기본 공유 시트 사용 | High |
| FR-06 | Web Share API 미지원 시 PNG 자동 다운로드 fallback | High |
| FR-07 | 다크모드 대응 (카드 배경·텍스트 색상) | High |
| FR-08 | 카드 생성 중 버튼 로딩 상태 표시 | Medium |
| FR-09 | 에러 발생 시 사용자에게 간략한 알림 | Medium |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | 외부 라이브러리 추가 없이 Canvas API만 사용 |
| NFR-02 | 카드 생성 시간 200ms 이하 |
| NFR-03 | 공유 유틸 함수는 `src/lib/shareCard.ts`로 분리 |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 이미지 생성 | Canvas API (브라우저 내장) | 외부 패키지 없이 경량, 충분한 표현력 |
| 공유 | Web Share API (`navigator.share`) | iOS/Android 기본 공유 시트 지원 |
| fallback | `<a download>` | 데스크톱·미지원 브라우저 대응 |
| 폰트 | 시스템 폰트 | Canvas에서 웹폰트 로딩 복잡성 제거 |

---

## 4. 구현 계획

### 4.1 신규 파일

```
src/lib/shareCard.ts     — Canvas 카드 생성 + 공유 유틸 함수
```

### 4.2 수정 파일

```
src/app/diary/[id]/page.tsx      — 공유 버튼 + shareCard 호출
src/app/moments/[id]/page.tsx    — 공유 버튼 + shareCard 호출
src/app/ideas/[id]/page.tsx      — 공유 버튼 + shareCard 호출
```

### 4.3 shareCard.ts API 설계

```ts
export type ShareCardData = {
  type: 'diary' | 'moment' | 'idea';
  title: string;
  content: string;
  date: string;
  isDark: boolean;
};

// Canvas로 카드 이미지 생성 → Blob 반환
export async function generateShareCard(data: ShareCardData): Promise<Blob>;

// Web Share API 또는 다운로드 fallback으로 공유
export async function shareCard(data: ShareCardData): Promise<void>;
```

### 4.4 Canvas 렌더링 순서

```
1. canvas 900×560 생성
2. 배경 그라디언트 fillRect
3. 타입 이모지 (48px, 상단 좌)
4. 날짜 텍스트 (14px, 상단 좌 이모지 옆)
5. 앱 이름 "나의 기록" (14px, 상단 우)
6. 제목 (bold 28px, 중앙 상단 1/3 지점)
7. 내용 줄바꿈 처리 후 표시 (18px, 제목 아래)
8. 구분선 (하단 1/5 지점)
9. 앱 서명 "나의 기록 · my-record" (12px, 구분선 아래)
10. canvas.toBlob('image/png') → resolve
```

### 4.5 UI 레이아웃 (헤더 버튼 배치)

```
[← 뒤로]              [공유↗]  [편집✏]  [삭제🗑]
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 일기/메모/아이디어 상세 페이지 헤더에 공유 버튼 표시
- [ ] 공유 버튼 클릭 시 감성 카드 이미지 생성
- [ ] 타입별 그라디언트 배경 (일기/메모/아이디어 색상 다름)
- [ ] 카드에 이모지, 날짜, 제목, 내용(120자), 앱 이름 표시
- [ ] 모바일: Web Share API → 기본 공유 시트 (카카오톡 등)
- [ ] 데스크톱/미지원: PNG 파일 자동 다운로드
- [ ] 다크모드 시 어두운 배경 + 밝은 텍스트 카드
- [ ] 생성 중 버튼 로딩 스피너
- [ ] 에러 시 간략한 알림

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Canvas 한글 폰트 미렌더링 | Low | 시스템 폰트 우선 + 폴백 체인 |
| Web Share API iOS 파일 공유 제한 | Medium | `navigator.canShare({ files })` 체크 후 텍스트만 공유 fallback |
| 긴 내용 카드 넘침 | Low | 120자 truncate + `…` 처리 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
