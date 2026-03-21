'use client'

import { ExternalLink, Youtube, Link } from 'lucide-react'
import { LinkPreview } from '@/lib/types'

interface Props {
  preview: LinkPreview
  loading?: boolean
}

export default function LinkPreviewCard({ preview, loading = false }: Props) {
  const isYoutube = preview.type === 'youtube'
  const displayUrl = (() => {
    try { return new URL(preview.url).hostname.replace('www.', '') }
    catch { return preview.url.slice(0, 40) }
  })()

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 animate-pulse">
        <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-600" />
      </div>
    )
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors group"
    >
      {preview.thumbnail ? (
        <img
          src={preview.thumbnail}
          alt=""
          className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
          {isYoutube
            ? <Youtube size={18} className="text-red-500" />
            : <Link size={18} className="text-gray-400" />
          }
        </div>
      )}
      <div className="flex-1 min-w-0">
        {preview.title ? (
          <p className="text-xs font-medium text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">
            {preview.title}
          </p>
        ) : (
          <p className="text-xs text-gray-400 line-clamp-1">{preview.url}</p>
        )}
        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
          {isYoutube && <span className="text-red-400 font-medium">YouTube</span>}
          {!isYoutube && displayUrl}
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </p>
      </div>
    </a>
  )
}
