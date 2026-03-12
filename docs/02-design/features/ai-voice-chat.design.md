# [Design] AI Voice Chat (AI 채팅 음성 입출력)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | AI Voice Chat (STT 자동 전송 + TTS 대화 모드) |
| 수정 파일 | `src/app/chat/page.tsx` 1개 |
| 의존성 | 기존 `useSpeechInput` 훅 재사용, Web Speech API |

---

## 1. 컴포넌트 구조

```
chat/page.tsx
├── Header
│   ├── ← 뒤로가기 버튼
│   ├── 제목 영역 ("AI와 대화" + 설명)
│   └── [신규] 대화 모드 토글 버튼 (🔊 / 🔇)
├── 메시지 목록 (기존 유지)
└── 입력창 영역
    ├── textarea (기존 유지)
    ├── [신규] 마이크 버튼 (🎤)
    │   └── 녹음 중: animate-ping 파동 애니메이션
    └── 전송 버튼 (기존 유지)
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/app/chat/page.tsx` | 수정 | STT 마이크 버튼 + TTS 대화 모드 추가 |
| `src/lib/useSpeechInput.ts` | 재사용 | 기존 훅 그대로 사용 |

---

## 3. 상태 설계

```ts
// 기존 상태 (유지)
const [messages, setMessages] = useState<Message[]>([...]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [streamingContent, setStreamingContent] = useState('');

// 신규 상태
const [isTTSMode, setIsTTSMode] = useState(false);

// useSpeechInput 훅
const handleVoiceResult = useCallback((text: string) => {
  setInput(text);
  setTimeout(() => handleSend(), 0); // 다음 렌더 사이클에서 전송
}, [handleSend]);

const { isRecording, isSupported: isSpeechSupported, toggle: toggleMic } =
  useSpeechInput(handleVoiceResult);

// TTS 지원 여부
const isTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
```

---

## 4. TTS speak() 함수 설계

```ts
function speak(text: string) {
  if (!isTTSMode || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();           // 이전 음성 중단
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
```

**호출 위치**: `handleChat()` 내 스트리밍 완료 직후 (`setMessages` 이후)

```ts
// handleChat 내부 (스트리밍 완료 후)
setMessages((prev) => [
  ...prev,
  { id: newId(), role: 'assistant', content: accumulated },
]);
speak(accumulated);  // ← 여기서 호출
```

---

## 5. useEffect cleanup

```ts
useEffect(() => {
  return () => {
    window.speechSynthesis?.cancel(); // 페이지 이탈 시 음성 중단
  };
}, []);
```

---

## 6. UI 레이아웃 상세

### 6.1 헤더 (수정)

```
[ ← ] [ AI와 대화 / "저장해줘"로 기록 ] [flex-1] [ 🔊/🔇 대화모드 버튼 ]
```

- 대화 모드 버튼: `isTTSSupported`일 때만 렌더링
- 활성화: 볼드 파란색 (`text-[#4A90D9]`)
- 비활성화: 회색 (`text-gray-400`)
- `aria-label`: "대화 모드 켜기" / "대화 모드 끄기"

```tsx
{isTTSSupported && (
  <button
    onClick={() => {
      if (isTTSMode) window.speechSynthesis.cancel();
      setIsTTSMode(prev => !prev);
    }}
    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
      isTTSMode
        ? 'text-[#4A90D9] bg-blue-50'
        : 'text-gray-400 hover:bg-black/5'
    }`}
    aria-label={isTTSMode ? '대화 모드 끄기' : '대화 모드 켜기'}
  >
    {/* 스피커 SVG 아이콘 */}
  </button>
)}
```

### 6.2 입력창 (수정)

```
[ textarea                    ] [ 🎤 마이크 ] [ → 전송 ]
```

- 마이크 버튼: `isSpeechSupported`일 때만 렌더링
- `isLoading` 중 비활성화 (`disabled`)
- 녹음 중: 빨간색 stroke + `animate-ping` 원형 파동
- 유휴: 회색 stroke

```tsx
{isSpeechSupported && (
  <button
    type="button"
    onClick={toggleMic}
    disabled={isLoading}
    className="relative flex items-center justify-center w-8 h-8 flex-shrink-0 disabled:opacity-40"
    aria-label={isRecording ? '녹음 중지' : '음성 입력'}
  >
    {isRecording && (
      <span className="absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-50 animate-ping" />
    )}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={isRecording ? '#ef4444' : '#9ca3af'}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="relative z-10">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  </button>
)}
```

---

## 7. handleSend 의존성 처리

`handleVoiceResult`에서 `handleSend`를 `useCallback` 의존성으로 참조하면 순환 의존이 발생할 수 있음.

**해결책**: `useRef`로 handleSend 최신 참조 유지

```ts
const handleSendRef = useRef(handleSend);
useEffect(() => { handleSendRef.current = handleSend; }, [handleSend]);

const handleVoiceResult = useCallback((text: string) => {
  setInput(text);
  setTimeout(() => handleSendRef.current(), 0);
}, []); // deps 없이 안정적 참조
```

---

## 8. 구현 순서

```
1. isTTSMode 상태 + isTTSSupported 체크 추가
2. speak() 함수 구현
3. useEffect cleanup 추가
4. handleChat() 내 speak() 호출 추가
5. handleSendRef 패턴으로 handleVoiceResult 구현
6. useSpeechInput 훅 연결
7. 헤더에 대화 모드 토글 버튼 추가
8. 입력창에 마이크 버튼 추가
```

---

## 9. 수용 기준 확인

| 기준 | 설계 반영 |
|------|-----------|
| 마이크 버튼 탭 → 녹음 → 재탭 → 변환 → 자동 전송 | `useSpeechInput` + `handleSendRef` |
| 녹음 중 파동 애니메이션 | `animate-ping` + 조건부 렌더링 |
| AI 로딩 중 마이크 비활성화 | `disabled={isLoading}` |
| 헤더에 대화 모드 토글 버튼 | `isTTSSupported` 조건부 렌더링 |
| AI 답변 완료 후 자동 음성 출력 | `speak(accumulated)` in `handleChat` |
| 대화 모드 OFF 시 음성 즉시 중단 | `speechSynthesis.cancel()` in toggle |
| 미지원 브라우저에서 버튼 숨김 | `isSpeechSupported` / `isTTSSupported` 조건 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 | Claude |
