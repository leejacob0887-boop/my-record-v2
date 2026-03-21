import { useState, useEffect, useRef } from 'react'
import { LinkPreview } from './types'

const URL_REGEX = /https?:\/\/[^\s"'<>]+/i

export function extractURL(text: string): string | null {
  return text.match(URL_REGEX)?.[0] ?? null
}

export function useLinkPreview(text: string) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [loading, setLoading] = useState(false)
  const lastUrlRef = useRef<string>('')

  useEffect(() => {
    const url = extractURL(text)

    if (!url) {
      setPreview(null)
      lastUrlRef.current = ''
      return
    }

    // 같은 URL 재요청 방지
    if (url === lastUrlRef.current) return
    lastUrlRef.current = url

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/url/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        setPreview({ url, title: data.title, thumbnail: data.thumbnail ?? undefined, type: data.type })
      } catch {
        setPreview({ url, title: '', type: 'link' })
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [text])

  function clearPreview() {
    setPreview(null)
    lastUrlRef.current = ''
  }

  return { preview, loading, clearPreview }
}
