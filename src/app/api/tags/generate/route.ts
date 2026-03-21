import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TAG_GENERATION_PROMPT } from '@/lib/ai-persona'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { content, type, existingTags = [] } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 })
    }

    const existingTagsText = existingTags.length > 0
      ? `\n기존 태그 목록: ${existingTags.join(', ')}`
      : ''

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      system: TAG_GENERATION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `타입: ${type || '기록'}\n내용: ${content}${existingTagsText}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    const tags: string[] = parsed.tags ?? []

    return NextResponse.json({ tags })
  } catch {
    return NextResponse.json({ tags: [] }, { status: 200 })
  }
}
