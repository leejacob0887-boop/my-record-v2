# [Plan] Voice Input — 홈 화면 음성 빠른 저장

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | voice-input (홈 화면 마이크 버튼) |
| 시작일 | 2026-03-16 |
| 예상 기간 | 1일 |
| 우선순위 | High |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 기록하고 싶은 순간에 앱을 열고, 탭을 선택하고, 폼을 채우는 단계가 너무 많아 기록 의욕이 떨어짐 |
| **Solution** | 홈 화면 마이크 버튼 하나로 말하면 AI가 일기/메모/아이디어를 자동 분류해 즉시 저장 |
| **Function UX Effect** | 마이크 클릭 → 말하기 → 자동 저장까지 3단계, 토스트로 실시간 상태 피드백 |
| **Core Value** | 기록의 마찰을 최소화해 "생각날 때 바로 저장"하는 습관 형성 지원 |

---

## 1. 기능 개요

### 1.1 목적
홈 화면에서 마이크 버튼 하나로 음성을 텍스트로 변환하고,
기존 `/api/chat` AI 채팅 API를 통해 자동 분류(일기/메모/아이디어) 후 Supabase에 저장한다.

### 1.2 범위
- 홈 화면(`page.tsx`) 마이크 버튼에 기능 연결
- Web Speech API (`SpeechRecognition`) 사용 — 외부 라이브러리 없음
- 한국어(`ko-KR`) 기본 설정
- 기존 `/api/chat` route 재사용 (저장 로직 동일)
- 토스트 컴포넌트: 3단계 상태 ("듣고 있어요..." → "자동 저장 중..." → "저장됐어요! 🎉")
- 에러 처리 (권한 거부, 브라우저 미지원, API 오류)

### 1.3 제외 범위
- 폼 내 텍스트 필드 마이크 버튼 (별도 feature)
- 카메라 버튼 기능
- 실시간 스트리밍 자막

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 홈 마이크 버튼 클릭 시 SpeechRecognition 시작 | High |
| FR-02 | 녹음 중 "듣고 있어요..." 토스트 표시 | High |
| FR-03 | 음성 인식 완료 시 자동 텍스트 변환 | High |
| FR-04 | 변환된 텍스트를 `/api/chat`으로 POST 전송 | High |
| FR-05 | API 처리 중 "자동 저장 중..." 토스트 표시 | High |
| FR-06 | 저장 완료 후 "저장됐어요! 🎉" 토스트 표시 | High |
| FR-07 | 토스트 — 배경 #111, 흰 텍스트, rounded-full, 하단 중앙 | High |
| FR-08 | 브라우저 미지원 시 조용히 무시 (버튼은 유지) | Medium |
| FR-09 | 마이크 권한 거부 / 오류 시 "마이크 권한이 필요해요" 토스트 | Medium |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | 기존 `/api/chat` route 수정 없이 재사용 |
| NFR-02 | 토스트는 페이지 이동 없이 홈 화면에서만 표시 |
| NFR-03 | 저장 완료 후 자동으로 토스트 3초 후 숨김 |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| Speech API | Web Speech API (브라우저 내장) | 라이브러리 불필요, 한국어 지원 |
| 언어 | `ko-KR` | 한국어 앱 |
| AI 분류 | 기존 `/api/chat` route | 저장 로직 동일하게 재사용 |
| 상태 | React `useState` | 토스트 메시지 상태 관리 |
| 구현 위치 | `src/app/page.tsx` 내 훅 | 컴포넌트 분리 불필요 |

---

## 4. 구현 계획

### 4.1 기능 플로우

```
마이크 클릭
  └─ SpeechRecognition.start()
       └─ 토스트: "듣고 있어요..."
            └─ onresult: transcript 획득
                 └─ 토스트: "자동 저장 중..."
                      └─ POST /api/chat { message: transcript }
                           └─ 토스트: "저장됐어요! 🎉" (3초 후 자동 닫힘)
```

### 4.2 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/page.tsx` | 마이크 버튼 onClick 핸들러 + 토스트 상태 추가 |

### 4.3 핵심 구현 로직

```ts
// page.tsx 내 핸들러
const handleMicClick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  const recognition = new SR();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;

  setToast('듣고 있어요...');

  recognition.onresult = async (e) => {
    const text = e.results[0][0].transcript;
    setToast('자동 저장 중...');
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    setToast('저장됐어요! 🎉');
    setTimeout(() => setToast(null), 3000);
  };

  recognition.onerror = () => {
    setToast('마이크 권한이 필요해요');
    setTimeout(() => setToast(null), 3000);
  };

  recognition.start();
};
```

### 4.4 토스트 UI

```tsx
// 하단 중앙 고정 토스트
{toast && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                  px-5 py-2.5 bg-[#111] text-white text-sm
                  rounded-full shadow-lg whitespace-nowrap">
    {toast}
  </div>
)}
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 마이크 버튼 클릭 시 브라우저 마이크 권한 요청이 뜸
- [ ] 권한 허용 후 "듣고 있어요..." 토스트가 하단 중앙에 표시됨
- [ ] 말이 끝나면 자동으로 텍스트 변환 후 "자동 저장 중..." 토스트 표시
- [ ] `/api/chat` 응답 완료 후 "저장됐어요! 🎉" 토스트 표시
- [ ] 토스트가 3초 후 자동으로 사라짐
- [ ] 마이크 권한 거부 시 "마이크 권한이 필요해요" 토스트 표시
- [ ] 토스트 스타일: 배경 #111, 흰 텍스트, rounded-full, 하단 중앙

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Firefox 미지원 | High | `SR` 존재 여부 체크 후 early return |
| iOS Safari 부분 지원 | Medium | webkitSpeechRecognition fallback |
| HTTPS 필수 | Low | 프로덕션 환경은 이미 HTTPS |
| `/api/chat` 응답 지연 | Medium | 토스트로 처리 중 상태 표시 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 최초 작성 (폼 내 입력 방식) | Claude |
| 2026-03-16 | 홈 화면 AI 자동 분류 저장 방식으로 전면 개편 | Claude |
