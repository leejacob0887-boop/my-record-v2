# [Plan] Voice Input (음성 입력)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Voice Input (음성 입력) |
| 시작일 | 2026-03-12 |
| 예상 기간 | 1~2일 |
| 우선순위 | Medium |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 모바일에서 긴 내용을 타이핑하기 불편해 기록 작성이 귀찮아짐 |
| **Solution** | Web Speech API를 활용해 음성으로 텍스트를 입력하는 마이크 버튼 제공 |
| **Function UX Effect** | 일기·아이디어·순간 폼에서 마이크 버튼 탭 → 말하면 텍스트 자동 입력 |
| **Core Value** | 입력 마찰을 줄여 기록 습관을 더 쉽게 유지할 수 있도록 지원 |

---

## 1. 기능 개요

### 1.1 목적
일기, 아이디어, 순간 작성 폼의 텍스트 입력 영역에 음성 입력 기능을 추가한다.
마이크 버튼을 눌러 말하면 텍스트로 변환되어 입력창에 자동으로 채워진다.

### 1.2 범위
- 일기(DiaryForm), 아이디어(IdeaForm), 순간(MomentForm)의 내용 입력 필드에 음성 입력 버튼 추가
- Web Speech API (`SpeechRecognition`) 활용 — 별도 라이브러리 불필요
- 한국어(`ko-KR`) 기본 설정
- 인식 중 시각적 피드백 (버튼 애니메이션, 상태 표시)
- 기존 텍스트에 이어붙이기 지원

### 1.3 제외 범위
- 제목(title) 필드 음성 입력 (내용 필드만 우선 적용)
- 실시간 스트리밍 자막 (결과값만 반영)
- 음성 명령 기능 (텍스트 입력 용도만)
- Safari iOS 지원 (webkit prefix 대응은 선택)

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 내용 textarea 옆에 마이크 버튼 표시 | High |
| FR-02 | 마이크 버튼 1회 클릭 → 녹음 시작, 재클릭 → 녹음 종료 후 텍스트 변환 (토글 방식) | High |
| FR-03 | 변환된 텍스트를 기존 내용에 이어붙이기 | High |
| FR-04 | 녹음 중 버튼에 애니메이션(파동) 효과 표시 | Medium |
| FR-05 | 브라우저 미지원 시 마이크 버튼 숨김 처리 | High |
| FR-06 | 마이크 권한 거부 시 사용자에게 안내 메시지 표시 | Medium |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | Web Speech API만 사용 (외부 라이브러리 없음) |
| NFR-02 | 한국어(`ko-KR`) 기본 언어 설정 |
| NFR-03 | 기존 폼 UI/UX를 최소한으로 변경 |
| NFR-04 | Chrome, Edge에서 정상 동작 (주요 타겟: 모바일 Chrome) |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| Speech API | Web Speech API (브라우저 내장) | 라이브러리 추가 불필요, 한국어 지원 |
| 언어 설정 | `ko-KR` | 한국어 UI 앱 |
| 상태 관리 | React `useState` | 간단한 on/off 상태 |
| 커스텀 훅 | `useSpeechInput` | 폼마다 재사용 가능하도록 분리 |

---

## 4. 구현 계획

### 4.1 구현 순서

```
1. useSpeechInput 커스텀 훅 작성 (src/lib/useSpeechInput.ts)
2. MicButton 컴포넌트 작성 (src/components/MicButton.tsx)
3. DiaryForm에 마이크 버튼 통합
4. IdeaForm에 마이크 버튼 통합
5. MomentForm에 마이크 버튼 통합
6. 브라우저 미지원/권한 거부 엣지 케이스 처리
```

### 4.2 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/useSpeechInput.ts` | 신규 — SpeechRecognition 커스텀 훅 |
| `src/components/MicButton.tsx` | 신규 — 마이크 버튼 컴포넌트 |
| `src/components/DiaryForm.tsx` | 내용 textarea에 마이크 버튼 추가 |
| `src/components/IdeaForm.tsx` | 내용 textarea에 마이크 버튼 추가 |
| `src/components/MomentForm.tsx` | 내용 textarea에 마이크 버튼 추가 |

### 4.3 핵심 구현 로직

```ts
// useSpeechInput.ts 핵심 구조
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'ko-KR';
recognition.continuous = true;   // 버튼을 다시 누를 때까지 계속 인식
recognition.interimResults = false;

// 토글: start() / stop() 으로 녹음 시작·종료
// stop() 호출 시 onresult가 최종 결과를 반환
recognition.onresult = (e) => {
  const transcript = Array.from(e.results)
    .map(r => r[0].transcript)
    .join('');
  onResult(transcript); // 기존 텍스트에 이어붙이기
};
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 일기/아이디어/순간 내용 필드 우측에 마이크 버튼이 표시됨
- [ ] 마이크 버튼 1회 클릭 → 녹음 시작, 재클릭 → 녹음 종료 후 텍스트 변환됨
- [ ] 변환된 텍스트가 기존 내용 뒤에 이어붙여짐
- [ ] 녹음 중 버튼에 파동 애니메이션이 표시됨
- [ ] 녹음 종료 시 버튼이 일반 상태로 돌아옴
- [ ] 미지원 브라우저(Firefox 등)에서 버튼이 보이지 않음
- [ ] 마이크 권한 거부 시 안내 메시지가 표시됨

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Firefox 미지원 | High | `'SpeechRecognition' in window` 체크 후 버튼 숨김 |
| iOS Safari 부분 지원 | Medium | webkit prefix 시도, 실패 시 graceful degradation |
| HTTPS 필수 (권한) | Low | 프로덕션 배포 환경은 이미 HTTPS |
| 인식 오류/타임아웃 | Medium | `onerror` 핸들링으로 상태 초기화 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 최초 작성 | Claude |
