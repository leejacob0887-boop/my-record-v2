import { NextRequest, NextResponse } from 'next/server'

const YT_PATTERNS = [
  /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
]

function extractYouTubeId(url: string): string | null {
  for (const pattern of YT_PATTERNS) {
    const m = url.match(pattern)
    if (m) return m[1]
  }
  return null
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ title: '', thumbnail: null, type: 'link' })

    const ytId = extractYouTubeId(url)

    if (ytId) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        const res = await fetchWithTimeout(oembedUrl, {}, 5000)
        if (res.ok) {
          const data = await res.json()
          return NextResponse.json({
            title: data.title ?? '',
            thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            type: 'youtube',
          })
        }
      } catch {
        // oEmbed 실패 → 썸네일만 반환
      }
      return NextResponse.json({
        title: '',
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        type: 'youtube',
      })
    }

    // 일반 URL
    try {
      const res = await fetchWithTimeout(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Notia/1.0)' },
      }, 5000)
      if (!res.ok) return NextResponse.json({ title: '', thumbnail: null, type: 'link' })

      const html = await res.text()
      const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
        ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
      const title = (ogTitle ?? titleTag ?? '').trim().slice(0, 100)

      return NextResponse.json({ title, thumbnail: null, type: 'link' })
    } catch {
      return NextResponse.json({ title: '', thumbnail: null, type: 'link' })
    }
  } catch {
    return NextResponse.json({ title: '', thumbnail: null, type: 'link' })
  }
}
