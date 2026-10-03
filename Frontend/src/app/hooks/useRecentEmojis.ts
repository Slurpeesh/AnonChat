import { useCallback, useState } from 'react'

const STORAGE_KEY = 'emoji-recent'
const MAX_RECENT = 6

function readFromStorage(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []

  return parsed
}

function writeToStorage(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useRecentEmojis() {
  const [recent, setRecent] = useState<string[]>(() => readFromStorage())

  const addRecent = useCallback((emojiId: string) => {
    setRecent((prev) => {
      const next = [emojiId, ...prev.filter((id) => id !== emojiId)].slice(
        0,
        MAX_RECENT,
      )
      writeToStorage(next)
      return next
    })
  }, [])

  return { recent, addRecent }
}
