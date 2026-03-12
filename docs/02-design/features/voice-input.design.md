# [Design] Voice Input (음성 입력)

## 1. 컴포넌트 구조

```
DiaryForm / IdeaForm / MomentForm
└── useSpeechInput (커스텀 훅)
└── 내용 레이블 영역
    ├── "내용" 텍스트
    └── MicButton (마이크 버튼)
        └── 녹음 중: 파동 애니메이션
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/lib/useSpeechInput.ts` | 신규 | SpeechRecognition 토글 훅 |
| `src/components/MicButton.tsx` | 신규 | 마이크 버튼 UI 컴포넌트 |
| `src/components/DiaryForm.tsx` | 수정 | content 레이블 영역에 MicButton 추가 |
| `src/components/IdeaForm.tsx` | 수정 | content 레이블 영역에 MicButton 추가 |
| `src/components/MomentForm.tsx` | 수정 | text 레이블 영역에 MicButton 추가 |

---

## 3. useSpeechInput 훅 설계

**파일**: `src/lib/useSpeechInput.ts`

```ts
interface UseSpeechInputReturn {
  isRecording: boolean;   // 현재 녹음 중 여부
  isSupported: boolean;   // 브라우저 지원 여부
  error: string | null;   // 권한 거부 등 오류 메시지
  toggle: () => void;     // 녹음 시작/종료 토글
}

function useSpeechInput(onResult: (text: string) => void): UseSpeechInputReturn
```

**동작 흐름**:
1. 컴포넌트 마운트 시 `SpeechRecognition` 지원 여부 확인 → `isSupported` 설정
2. `toggle()` 호출:
   - `isRecording === false` → `recognition.start()`, `isRecording = true`
   - `isRecording === true` → `recognition.stop()`, `isRecording = false`
3. `recognition.onresult` → 누적된 transcript를 `onResult(text)` 콜백으로 전달
4. `recognition.onerror` → `error` 상태 설정, `isRecording = false`
5. `recognition.onend` → `isRecording = false` (자동 종료 케이스 대응)

**SpeechRecognition 설정값**:

| 설정 | 값 | 이유 |
|------|----|------|
| `lang` | `'ko-KR'` | 한국어 앱 |
| `continuous` | `true` | stop() 호출 전까지 계속 인식 |
| `interimResults` | `false` | 최종 결과만 반환 (중간 결과 불필요) |

**오류 메시지 처리**:

| error 코드 | 표시 메시지 |
|------------|------------|
| `not-allowed` | "마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요." |
| `no-speech` | `null` (무음 → 조용히 종료) |
| 기타 | "음성 인식 오류가 발생했습니다." |

---

## 4. MicButton 컴포넌트 설계

**파일**: `src/components/MicButton.tsx`

```ts
interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
}
```

**UI 상태별 스타일**:

| 상태 | 버튼 색상 | 아이콘 | 부가 효과 |
|------|-----------|--------|-----------|
| 대기 | `text-gray-400` | 마이크 아이콘 | 없음 |
| 녹음 중 | `text-red-500` | 마이크 아이콘 | 파동 애니메이션 (ping) |

**파동 애니메이션**: Tailwind `animate-ping` 활용
```jsx
{isRecording && (
  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50 animate-ping" />
)}
```

**레이아웃**: 버튼은 내용 레이블 우측에 배치 (기존 태그 추가 버튼 패턴과 동일)

---

## 5. 폼별 통합 설계

### 5.1 공통 패턴

내용 레이블 row를 `flex justify-between`으로 변경 후 우측에 MicButton 배치:

```jsx
// Before
<label className="block text-xs text-gray-500 mb-1">내용</label>

// After
<div className="flex items-center justify-between mb-1">
  <label className="text-xs text-gray-500">내용</label>
  {isSupported && <MicButton isRecording={isRecording} onClick={toggle} />}
</div>
```

textarea `onChange`에 음성 결과 이어붙이기:

```jsx
// useSpeechInput의 onResult 콜백
onResult={(transcript) =>
  setContent(prev => prev ? prev + ' ' + transcript : transcript)
}
```

### 5.2 DiaryForm

- 대상 필드: `content` (rows=8)
- `onResult`: `setContent(prev => prev ? prev + ' ' + t : t)`

### 5.3 IdeaForm

- 대상 필드: `content` (rows=6)
- `onResult`: `setContent(prev => prev ? prev + ' ' + t : t)`

### 5.4 MomentForm

- 대상 필드: `text` (rows=4)
- `onResult`: `setText(prev => prev ? prev + ' ' + t : t)`

---

## 6. 오류 UI 표시

권한 거부 등 `error`가 있을 때 textarea 하단에 인라인 메시지 표시:

```jsx
{error && (
  <p className="text-xs text-red-400 mt-1">{error}</p>
)}
```

---

## 7. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| Firefox 등 미지원 브라우저 | `isSupported === false` → MicButton 렌더링 안 함 |
| 마이크 권한 거부 | `onerror: not-allowed` → error 메시지 표시, isRecording 초기화 |
| 무음 상태에서 stop | `onresult` 미호출 → 아무 텍스트도 추가 안 함 |
| 페이지 이탈 시 녹음 중 | `useEffect` cleanup에서 `recognition.abort()` 호출 |
| iOS Safari | `window.webkitSpeechRecognition` fallback, 미지원 시 버튼 숨김 |

---

## 8. TypeScript 타입 선언

Web Speech API는 기본 TS 타입에 없으므로 전역 타입 확장:

```ts
// useSpeechInput.ts 상단에 인라인 선언
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
```

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 최초 작성 | Claude |
