# [Plan] AI Voice Chat (AI 채팅 음성 입출력)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | AI Voice Chat (음성 입력 + TTS 출력) |
| 시작일 | 2026-03-12 |
| 예상 기간 | 1일 |
| 우선순위 | High |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | AI 채팅이 텍스트 입력만 지원해 모바일에서 대화 흐름이 끊기고, 답변을 눈으로만 읽어야 함 |
| **Solution** | 음성 입력(STT) + 대화 모드(TTS) 두 기능으로 완전한 음성 대화 경험 제공 |
| **Function UX Effect** | 말하면 전송, AI 답변을 음성으로 들을 수 있어 핸즈프리 대화 가능 |
| **Core Value** | 기록 앱을 넘어 일상 속 AI 음성 비서처럼 자연스럽게 활용 |

---

## 1. 기능 개요

### 1.1 기능 1 — 마이크 버튼 (STT)

채팅 입력창 옆 마이크 버튼을 토글하면 음성 인식 → 텍스트 변환 → 자동 전송.

**흐름**: 마이크 버튼 탭 → 녹음 시작 → 다시 탭 → 녹음 종료 → 텍스트 변환 → 입력창 채움 → **자동 전송**

> 기존 form 폼의 음성 입력과 차이점: 채팅은 변환 후 **자동 전송**까지 처리 (대화 흐름 유지)

### 1.2 기능 2 — 대화 모드 버튼 (TTS)

헤더에 대화 모드 토글 버튼. 활성화 시 AI 답변 텍스트를 Web Speech API `SpeechSynthesis`로 음성 출력.

**흐름**: 대화 모드 ON → AI 답변 스트리밍 완료 → `speechSynthesis.speak()` 호출 → 음성 재생

### 1.3 기존 완료 항목
- [x] 홈 화면 Sparkles 버튼 (`/chat` 진입) — 2026-03-12 완료

---

## 2. 요구사항

### 2.1 기능 요구사항 — 마이크 버튼 (STT)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 입력창 전송 버튼 왼쪽에 마이크 버튼 배치 | High |
| FR-02 | 토글: 1회 탭 → 녹음 시작, 재탭 → 종료 후 텍스트 변환 | High |
| FR-03 | 변환된 텍스트를 입력창에 채운 뒤 자동 전송 | High |
| FR-04 | 녹음 중 파동 애니메이션 표시 | Medium |
| FR-05 | AI 응답 로딩 중(`isLoading`) 마이크 버튼 비활성화 | Medium |
| FR-06 | 미지원 브라우저에서 마이크 버튼 숨김 | High |

### 2.2 기능 요구사항 — 대화 모드 (TTS)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-07 | 헤더에 대화 모드 토글 버튼 배치 (🔊 / 🔇 아이콘) | High |
| FR-08 | 대화 모드 ON 상태에서 AI 답변 완료 시 자동 음성 출력 | High |
| FR-09 | 음성 출력 중 다음 메시지 전송 시 이전 음성 중단 | Medium |
| FR-10 | 대화 모드 OFF 전환 시 진행 중인 음성 즉시 중단 | Medium |
| FR-11 | 미지원 브라우저에서 대화 모드 버튼 숨김 | High |

### 2.3 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | Web Speech API만 사용 (STT: SpeechRecognition, TTS: SpeechSynthesis) |
| NFR-02 | 기존 `useSpeechInput` 훅 재사용 (STT) |
| NFR-03 | 한국어(`ko-KR`) 기본 설정 |
| NFR-04 | 수정 파일: `src/app/chat/page.tsx` 1개 |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| STT | Web Speech API `SpeechRecognition` | 기존 `useSpeechInput` 재사용 |
| TTS | Web Speech API `SpeechSynthesis` | 외부 라이브러리 없음, 브라우저 내장 |
| 언어 | `ko-KR` | 한국어 앱 |
| TTS 음성 | `SpeechSynthesisUtterance` | 기본 설정 (rate: 1.0, pitch: 1.0) |

---

## 4. 구현 계획

### 4.1 구현 순서

```
1. useSpeechInput 훅 + MicButton 재사용 (STT)
   - onResult 콜백에서 setInput → handleSend() 자동 호출
2. useTTS 로컬 로직 추가 (chat/page.tsx 내)
   - isTTSMode state
   - speak(text) 함수: speechSynthesis.cancel() → speak()
   - AI 답변 완료 시점(setMessages 후)에 speak() 호출
3. 헤더에 대화 모드 토글 버튼 추가
4. 입력창에 마이크 버튼 추가
```

### 4.2 UI 레이아웃

```
헤더:
[ ← ] [ AI와 대화  "저장해줘"로 기록 ] [ 🔊 대화모드 ]

입력창:
[ textarea                    ] [ 🎤 ] [ → 전송 ]
```

### 4.3 핵심 로직

```ts
// STT: 변환 후 자동 전송
const handleVoiceResult = useCallback((text: string) => {
  setInput(text);
  // 다음 렌더 사이클에서 전송
  setTimeout(() => handleSend(), 0);
}, []);

// TTS: AI 답변 완료 후 음성 출력
function speak(text: string) {
  if (!isTTSMode || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // 이전 음성 중단
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  window.speechSynthesis.speak(utterance);
}
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [x] 홈 화면 Sparkles 버튼 표시 및 `/chat` 이동
- [x] 마이크 버튼 탭 → 녹음 → 재탭 → 텍스트 변환 → 자동 전송
- [x] 녹음 중 파동 애니메이션 표시
- [x] AI 로딩 중 마이크 버튼 비활성화
- [x] 헤더에 대화 모드 토글 버튼 표시 (스피커 ON/OFF 아이콘)
- [x] 대화 모드 ON 상태에서 AI 답변이 음성으로 출력됨 (`ko-KR`, rate 1.0)
- [x] 대화 모드 OFF 전환 시 음성 즉시 중단
- [x] 미지원 브라우저에서 각 버튼 숨김 처리
- [x] 다음 메시지 전송 시 이전 TTS 자동 중단
- [x] 페이지 이탈 시 `useEffect` cleanup으로 TTS 중단

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| STT 자동 전송 타이밍 오류 | Low | `setTimeout(() => handleSend(), 0)` 으로 state 반영 후 전송 |
| TTS 스트리밍 중간 값 읽기 | Medium | 스트리밍 완료(`setMessages` 직후)에만 speak() 호출 |
| iOS Safari SpeechSynthesis 제한 | Medium | 사용자 인터랙션 후에만 speak() 가능 → 토글 버튼 탭이 트리거 역할 |
| 음성 출력 중 페이지 이탈 | Low | `useEffect` cleanup에서 `speechSynthesis.cancel()` |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 (음성 입력만) | Claude |
| 2026-03-12 | 전면 재작성 — STT 자동 전송 + TTS 대화 모드 추가 | Claude |
| 2026-03-12 | 구현 완료 — 수용 기준 전체 달성, 플랜 업데이트 | Claude |
