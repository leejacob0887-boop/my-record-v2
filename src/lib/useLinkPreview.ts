import { useState, useEffect, useRef } from 'react'
import { LinkPreview } from './types'

const URL_REGEX = /https?:\/\/[^\s"'<>]+/i

export function extractURL(text: string): string | null {
  return text.match(URL_REGEX)?.[0] ?? null
}

export function useLinkPreview(text: string) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const fetchedUrlRef = useRef<string>('')

  useEffect(() => {
    const url = extractURL(text)

    if (!url) {
      setPreview(null)
      setLoading(false)
      fetchedUrlRef.current = ''
      return
    }

    // 동일 URL 중복 요청 방지
    if (url === fetchedUrlRef.current) return

    // 즉시 로딩 표시
    setLoading(true)
    fetchedUrlRef.current = url

    let cancelled = false
    const timer = setTimeout(async () => {
      if (cancelled) return
      try {
        const res = await fetch('/api/url/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        if (cancelled) return
        const data = await res.json()
        if (cancelled) return
        setPreview({ url, title: data.title ?? '', thumbnail: data.thumbnail ?? undefined, type: data.type ?? 'link' })
      } catch {
        if (!cancelled) setPreview({ url, title: '', type: 'link' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 600)

    return () => {
      cancelled = true
      clearTimeout(timer)
      // URL이 바뀌면 ref 초기화해서 재시도 가능하게
      if (fetchedUrlRef.current === url) {
        fetchedUrlRef.current = ''
      }
      setLoading(false)
    }
  }, [text])

  function clearPreview() {
    setPreview(null)
    fetchedUrlRef.current = ''
  }

  return { preview, loading, clearPreview }
}
