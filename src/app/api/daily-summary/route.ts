import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

type RequestBody = {
  date: string;
  diary: { title: string; content: string }[];
  moments: { text: string }[];
  ideas: { title: string; content: string }[];
};

const SUMMARY_SYSTEM_PROMPT = `
당신은 사용자의 하루 기록을 읽고 따뜻하게 요약해주는 감성적인 AI입니다.
일기, 메모, 아이디어를 종합하여 2~4문장으로 오늘 하루를 요약해주세요.
- 사용자를 따뜻하게 격려하는 톤으로 작성하세요.
- 기록된 감정, 생각, 활동을 자연스럽게 엮어 표현하세요.
- 문어체가 아닌 부드러운 구어체 한국어로 작성하세요.
- 마무리에 짧은 응원 한 마디를 포함하세요.
- 이모지 1~2개를 자연스럽게 포함하세요.
요약 텍스트만 반환하세요. JSON이나 제목은 불필요합니다.
`.trim();

const client = new Anthropic();

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
  }

  const { date, diary, moments, ideas }: RequestBody = await req.json();

  const lines: string[] = [`📅 날짜: ${date}`];
  diary.forEach((d, i) => {
    lines.push(`\n[일기 ${i + 1}] ${d.title}`);
    lines.push(d.content.slice(0, 200));
  });
  moments.forEach((m, i) => {
    lines.push(`\n[메모 ${i + 1}] ${m.text.slice(0, 200)}`);
  });
  ideas.forEach((d, i) => {
    lines.push(`\n[아이디어 ${i + 1}] ${d.title}`);
    lines.push(d.content.slice(0, 200));
  });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: lines.join('\n') }],
  });

  const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
  return Response.json({ summary });
}
