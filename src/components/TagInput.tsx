'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  loading?: boolean
}

export default function TagInput({ tags, onChange, loading = false }: Props) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) {
      setInput('')
      return
    }
    onChange([...tags, tag])
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[32px]">
      {loading && (
        <span className="text-xs text-gray-400 animate-pulse">태그 생성 중…</span>
      )}
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E6F2EF] text-[#0F6E56] text-xs font-medium rounded-full"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="flex items-center justify-center w-3 h-3 rounded-full hover:bg-[#0F6E56]/20 transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="태그 추가"
          className="text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 bg-transparent outline-none w-16 min-w-0"
        />
        {input && (
          <button
            type="button"
            onClick={() => addTag(input)}
            className="flex items-center justify-center w-4 h-4 text-[#0F6E56]"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
