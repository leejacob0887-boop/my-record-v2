# [Design] AI Chat

> Plan 참조: `docs/01-plan/features/ai-chat.plan.md`

---

## 1. 아키텍처 개요

```
클라이언트 (채팅 UI)
  │
  ├── [일반 대화]  → POST /api/chat (mode: "chat")
  │                    → Claude 스트리밍 응답
  │                    → ReadableStream → UI 표시
  │
  └── ["저장해줘"] → POST /api/chat (mode: "save")
                       → Claude: 대화 분석 → JSON 반환
                       → 클라이언트: Supabase 직접 저장 (기존 훅 사용)
                       → AI 확인 메시지 표시
```

**핵심 결정**: 저장은 클라이언트에서 기존 `useDiary`, `useMoments`, `useIdeas` 훅으로 직접 처리.
API Route는 AI 호출만 담당 → Supabase 인증 토큰 전달 불필요, 코드 재사용 극대화.

---

## 2. 파일 설계

### 2.1 `src/lib/ai-persona.ts` (신규)

```typescript
// AI 페르소나와 프롬프트를 한 곳에서 관리 — 쉽게 수정 가능

export const CHAT_SYSTEM_PROMPT = `
당신은 사용자의 친근한 기록 친구입니다.
사용자가 하루 이야기, 생각, 아이디어를 편하게 털어놓을 수 있도록 공감하며 대화하세요.
짧고 따뜻하게 반응하고, 필요하면 질문으로 더 끌어내세요.
한국어로 대화하세요.
`.trim();

export const SAVE_ANALYSIS_PROMPT = `
다음 대화를 분석해서 저장할 기록 정보를 JSON으로 반환하세요.

분류 기준:
- diary: 하루 경험, 감정, 성찰 등 긴 이야기
- moment: 짧은 메모, 한 줄 생각, 순간적 느낌
- idea: 아이디어, 계획, 제안, 프로젝트 구상

반드시 아래 JSON 형식만 반환하세요 (다른 텍스트 없이):
{
  "type": "diary" | "moment" | "idea",
  "title": "제목 (diary/idea의 경우, 20자 이내)",
  "content": "내용 (diary/idea의 경우)",
  "text": "내용 (moment의 경우)",
  "date": "YYYY-MM-DD",
  "confirmMessage": "✅ [일기]로 저장했어요! 제목: 제목명"
}
`.trim();
```

---

### 2.2 `src/app/api/chat/route.ts` (신규)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { CHAT_SYSTEM_PROMPT, SAVE_ANALYSIS_PROMPT } from '@/lib/ai-persona';

const client = new Anthropic();

// ── 요청 타입 ──────────────────────────────────────────────
type ChatMessage = { role: 'user' | 'assistant'; content: string };
type RequestBody = {
  messages: ChatMessage[];
  mode: 'chat' | 'save';
};

export async function POST(req: NextRequest) {
  const { messages, mode }: RequestBody = await req.json();

  // ── 저장 모드: 비스트리밍 JSON 반환 ──────────────────────
  if (mode === 'save') {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SAVE_ANALYSIS_PROMPT,
      messages: [{ role: 'user', content: conversationText }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return Response.json(JSON.parse(text));
  }

  // ── 채팅 모드: 스트리밍 ──────────────────────────────────
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
```

---

### 2.3 `src/components/ChatMessage.tsx` (신규)

```typescript
interface ChatMessageProps {
  role: 'user' | 'assistant' | 'info';
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === 'info') {
    // 저장 확인, 에러 등 시스템 메시지
    return (
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl mx-4">
        {content}
      </div>
    );
  }

  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-[#4A90D9] text-white rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm border border-gray-100 dark:border-gray-700'
          }`}
      >
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse rounded-sm" />
        )}
      </div>
    </div>
  );
}
```

---

### 2.4 `src/app/chat/page.tsx` (신규)

#### State 구조

```typescript
type Message = {
  id: string;
  role: 'user' | 'assistant' | 'info';
  content: string;
};

const [messages, setMessages] = useState<Message[]>([
  { id: '0', role: 'assistant', content: '안녕하세요! 오늘 어떤 이야기를 나눠볼까요? 😊' }
]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [streamingContent, setStreamingContent] = useState('');
```

#### 전송 핸들러 로직

```typescript
// "저장해줘" 감지
const SAVE_TRIGGERS = ['저장해줘', '저장해', '저장', 'save'];
const isSaveRequest = (text: string) =>
  SAVE_TRIGGERS.some(t => text.trim().toLowerCase().includes(t));

async function handleSend() {
  if (!input.trim() || isLoading) return;
  const userMessage = input.trim();
  setInput('');

  const newMessages = [...messages, { id: uuid(), role: 'user', content: userMessage }];
  setMessages(newMessages);

  if (isSaveRequest(userMessage)) {
    await handleSave(newMessages);
  } else {
    await handleChat(newMessages);
  }
}
```

#### 채팅 핸들러 (스트리밍)

```typescript
async function handleChat(msgs: Message[]) {
  setIsLoading(true);
  setStreamingContent('');

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      messages: msgs
        .filter(m => m.role !== 'info')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    setStreamingContent(accumulated);
  }

  setMessages(prev => [
    ...prev,
    { id: uuid(), role: 'assistant', content: accumulated }
  ]);
  setStreamingContent('');
  setIsLoading(false);
}
```

#### 저장 핸들러

```typescript
async function handleSave(msgs: Message[]) {
  setIsLoading(true);

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'save', messages: msgs.filter(m => m.role !== 'info') }),
  });
  const data = await res.json();

  // 타입별 Supabase 저장 (기존 훅 함수 직접 호출)
  const today = new Date().toISOString().slice(0, 10);
  if (data.type === 'diary') {
    await saveDiary({ date: data.date ?? today, title: data.title, content: data.content });
  } else if (data.type === 'moment') {
    await addMoment({ text: data.text, date: data.date ?? today });
  } else if (data.type === 'idea') {
    await addIdea({ title: data.title, content: data.content, date: data.date ?? today });
  }

  setMessages(prev => [
    ...prev,
    { id: uuid(), role: 'info', content: data.confirmMessage }
  ]);
  setIsLoading(false);
}
```

#### 채팅 페이지 UI 구조

```
┌─────────────────────────────────┐
│  Header: "AI와 대화"  [뒤로가기]  │
├─────────────────────────────────┤
│                                 │
│  [assistant] 안녕하세요! 😊      │
│                                 │
│      [user] 오늘 발표가 있었는데  │
│                                 │
│  [assistant] 긴장되셨겠어요!...  │
│                                 │
│  ─── ✅ [일기]로 저장했어요! ─── │
│                                 │
├─────────────────────────────────┤
│ [입력창] [전송 버튼]             │
└─────────────────────────────────┘
```

---

### 2.5 `src/app/page.tsx` 수정 (홈 AI 버튼)

**변경 전 (기존):**
```tsx
<div className={`text-center mb-6 text-sm font-medium ${todayCount > 0 ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
  {todayCount > 0
    ? `오늘 ${todayCount}개의 기록을 남겼어요 ✨`
    : '오늘 첫 기록을 남겨볼까요?'}
</div>
```

**변경 후:**
```tsx
<div className="flex items-center justify-center gap-2 mb-6">
  <span className={`text-sm font-medium ${todayCount > 0 ? 'text-[#4A90D9]' : 'text-gray-400'}`}>
    {todayCount > 0
      ? `오늘 ${todayCount}개의 기록을 남겼어요 ✨`
      : '오늘 첫 기록을 남겨볼까요?'}
  </span>
  <Link
    href="/chat"
    className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
    aria-label="AI와 대화하기"
  >
    <Sparkles size={14} color="#6366F1" />
  </Link>
</div>
```

> `Sparkles` — lucide-react에서 import (기존 사용 중인 라이브러리)

---

## 3. 데이터 흐름

### 저장 타입별 Supabase 호출

| 분류 타입 | 사용할 훅 함수 | Supabase 테이블 |
|-----------|--------------|----------------|
| `diary` | `useDiary().save({ date, title, content })` | `diary_entries` |
| `moment` | `useMoments().add({ text, date })` | `moments` |
| `idea` | `useIdeas().add({ title, content, date })` | `ideas` |

**구현 방법**: `chat/page.tsx`에서 세 훅을 모두 import하고, 저장 시 타입에 따라 분기 호출.

---

## 4. 의존성

```bash
npm install @anthropic-ai/sdk
```

| 패키지 | 용도 |
|--------|------|
| `@anthropic-ai/sdk` | Claude API 호출 |

**환경변수** (`.env.local`):
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 5. 구현 순서

```
Step 1: npm install @anthropic-ai/sdk
Step 2: .env.local에 ANTHROPIC_API_KEY 추가
Step 3: src/lib/ai-persona.ts 생성
Step 4: src/app/api/chat/route.ts 생성
Step 5: src/components/ChatMessage.tsx 생성
Step 6: src/app/chat/page.tsx 생성
Step 7: src/app/page.tsx — Sparkles 아이콘 + Link 추가
```

---

## 6. 검증 기준

| 항목 | 검증 방법 | 기준 |
|------|----------|------|
| 스트리밍 응답 | 텍스트가 타이핑되듯 순차 표시 | 첫 글자 1초 내 표시 |
| 저장 분류 정확도 | 일기/메모/아이디어 각 3개씩 테스트 | 9/9 정확 분류 |
| Supabase 저장 | 저장 후 해당 섹션에서 기록 확인 | 정상 표시 |
| API 키 보안 | 브라우저 Network 탭 확인 | 키 미노출 |
| 홈 버튼 | 클릭 후 `/chat` 이동 | 정상 이동 |

---

## 7. 주의 사항

1. **저장 모드 JSON 파싱 오류**: Claude가 JSON 외 텍스트 반환 시 try/catch로 처리, 에러 info 메시지 표시
2. **스트리밍 중 저장 요청**: 스트리밍 완료 후에만 저장 버튼/입력 활성화 (`isLoading` 상태)
3. **미로그인 상태**: `useAuth()` user가 null이면 Supabase 저장 스킵 (기존 훅 동작과 동일)
4. **diary는 날짜 당 1개 제한**: `diary_entries` upsert는 `user_id, date` 충돌 처리 — AI가 같은 날 두 번 저장 시 덮어씀

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-11 | 최초 작성 | Claude |
