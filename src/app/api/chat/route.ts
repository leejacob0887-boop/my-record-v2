import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { CHAT_SYSTEM_PROMPT, SAVE_ANALYSIS_PROMPT } from '@/lib/ai-persona';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type RequestBody = {
  messages: ChatMessage[];
  mode: 'chat' | 'save';
};

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { messages, mode }: RequestBody = await req.json();

  // ── 저장 모드: 대화 분석 후 JSON 반환 ──────────────────
  if (mode === 'save') {
    const conversationText = messages
      .map((m) => `${m.role === 'user' ? '사용자' : 'AI'}: ${m.content}`)
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SAVE_ANALYSIS_PROMPT,
      messages: [
        {
          role: 'user',
          content: `오늘 날짜: ${new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)}\n\n${conversationText}`,
        },
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
    // 마크다운 코드블록 제거
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return Response.json(JSON.parse(stripped));
    } catch {
      // JSON 블록만 추출 재시도
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return Response.json(JSON.parse(match[0]));
        } catch { /* fall through */ }
      }
      console.error('[save] JSON parse failed. raw:', raw);
      return Response.json({ error: '분류 중 오류가 발생했습니다.' }, { status: 500 });
    }
  }

  // ── 채팅 모드: 스트리밍 응답 ────────────────────────────
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (e: unknown) {
        const err = e as { status?: number; message?: string; error?: unknown };
        console.error('[chat/stream error] status:', err?.status, 'message:', err?.message, 'error:', JSON.stringify(err?.error));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
