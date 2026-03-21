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

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ title: '', thumbnail: null, type: 'link' })

    const ytId = extractYouTubeId(url)

    if (ytId) {
      // YouTube oEmbed — 무료, API 키 불필요
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json({
          title: data.title ?? '',
          thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          type: 'youtube',
        })
      }
      // oEmbed 실패 시 썸네일만
      return NextResponse.json({
        title: '',
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        type: 'youtube',
      })
    }

    // 일반 URL — 서버사이드 fetch로 CORS 우회
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Notia/1.0)' },
    })
    if (!res.ok) return NextResponse.json({ title: '', thumbnail: null, type: 'link' })

    const html = await res.text()

    // og:title 우선, 없으면 <title>
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
    const title = (ogTitle ?? titleTag ?? '').trim().slice(0, 100)

    return NextResponse.json({ title, thumbnail: null, type: 'link' })
  } catch {
    return NextResponse.json({ title: '', thumbnail: null, type: 'link' })
  }
}
