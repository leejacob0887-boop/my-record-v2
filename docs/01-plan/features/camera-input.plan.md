# [Plan] Camera Input — 홈 화면 카메라 빠른 메모

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | camera-input (홈 화면 카메라 버튼) |
| 시작일 | 2026-03-16 |
| 예상 기간 | 0.5일 |
| 우선순위 | High |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 눈앞의 장면을 메모로 남기려면 직접 타이핑해야 하는 번거로움 |
| **Solution** | 카메라로 사진 찍으면 AI가 내용을 분석해 메모로 자동 저장 |
| **Function UX Effect** | 카메라 클릭 → 촬영 → AI 분석 → 메모 저장, 3단계 토스트 피드백 |
| **Core Value** | 시각 정보를 즉시 텍스트 기록으로 변환해 기록 마찰 최소화 |

---

## 1. 기능 개요

### 1.1 목적
홈 화면 카메라 버튼으로 사진을 찍으면 Claude Haiku vision이 사진을 분석해
텍스트로 설명을 생성하고, 메모(moments)로 Supabase에 자동 저장한다.

### 1.2 범위
- `input[type=file][capture=environment]`로 네이티브 카메라 실행
- 사진 → base64 변환
- `/api/chat` route에 `mode: 'vision'` 추가 (Claude Haiku vision)
- 분석 결과를 `addMoment`로 저장
- 토스트 3단계: "자동 저장 중..." → "메모로 저장됐어요! ⚡"

### 1.3 제외 범위
- 갤러리에서 기존 이미지 선택 (capture=environment로 카메라 전용)
- 이미지 자체 저장 (텍스트 설명만 저장)
- 일기/아이디어로 분류 (항상 메모로 저장)

---

## 2. 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | 카메라 버튼 클릭 → 네이티브 카메라 실행 | High |
| FR-02 | 촬영 후 base64 변환 | High |
| FR-03 | `/api/chat` mode: 'vision'으로 AI 분석 | High |
| FR-04 | 분석 결과를 moments로 저장 | High |
| FR-05 | "자동 저장 중..." → "메모로 저장됐어요! ⚡" 토스트 | High |
| FR-06 | 기존 마이크/채팅 기능 영향 없음 | High |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 카메라 실행 | `input[type=file][capture=environment]` | 별도 권한 없이 네이티브 카메라 |
| 이미지 변환 | `FileReader.readAsDataURL` | base64 변환 |
| AI 분석 | Claude Haiku vision (`image/jpeg`) | 기존 Anthropic client 재사용 |
| API 확장 | `/api/chat` route `mode: 'vision'` 추가 | 기존 route 재사용 |
| 저장 | `addMoment` hook | 기존 저장 로직 동일 |

---

## 4. 구현 계획

### 4.1 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/chat/route.ts` | `mode: 'vision'` 케이스 추가 |
| `src/app/page.tsx` | 카메라 버튼 onClick + hidden input ref 추가 |

### 4.2 API 확장 (`mode: 'vision'`)

```ts
// RequestBody 확장
type RequestBody = {
  messages: ChatMessage[];
  mode: 'chat' | 'save' | 'vision';
  imageBase64?: string; // base64 (data URL 포함)
};

// vision 처리
if (mode === 'vision') {
  const base64 = imageBase64!.split(',')[1]; // data: 접두사 제거
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
        { type: 'text', text: '이 사진을 한국어로 간결하게 설명해줘. 2~3문장으로.' }
      ]
    }]
  });
  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return Response.json({ text });
}
```

### 4.3 홈 화면 카메라 핸들러

```ts
const cameraInputRef = useRef<HTMLInputElement>(null);

const handleCameraClick = () => cameraInputRef.current?.click();

const handleCameraChange = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    showToast('자동 저장 중...');
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ mode: 'vision', imageBase64: reader.result, messages: [] }),
    });
    const data = await res.json();
    await addMoment({ text: data.text, date: today });
    showToast('메모로 저장됐어요! ⚡', true);
  };
  reader.readAsDataURL(file);
};
```

---

## 5. 수용 기준

- [ ] 카메라 버튼 클릭 시 네이티브 카메라가 열림
- [ ] 촬영 후 "자동 저장 중..." 토스트 표시
- [ ] AI 분석 완료 후 메모 저장됨
- [ ] "메모로 저장됐어요! ⚡" 토스트 표시
- [ ] 기존 마이크 기능 정상 동작

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-16 | 최초 작성 | Claude |
