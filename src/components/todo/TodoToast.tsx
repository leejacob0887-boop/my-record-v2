'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  key: number
}

export default function TodoToast({ message, key: triggerKey }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 2800)
    return () => clearTimeout(t)
  }, [triggerKey, message])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-fade-in-up whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
