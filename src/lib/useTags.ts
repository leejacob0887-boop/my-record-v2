import { useState } from 'react'

type RecordType = 'diary' | 'moment' | 'idea' | 'todo'

export function useTags(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [loading, setLoading] = useState(false)

  async function generateTags(content: string, type: RecordType, existingTags: string[] = []): Promise<string[]> {
    if (!content.trim()) return []
    setLoading(true)
    try {
      const res = await fetch('/api/tags/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, existingTags }),
      })
      const data = await res.json()
      const generated: string[] = data.tags ?? []
      if (generated.length) {
        setTags(generated)
      }
      return generated
    } catch {
      return []
    } finally {
      setLoading(false)
    }
  }

  return { tags, setTags, loading, generateTags }
}
