import { EMOJI_MAP } from '@/features/Emoji/emojiMap'
import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'emoji-recent'
const MAX_RECENT = 6

function isValidEmojiId(id: unknown): id is string {
  return typeof id === 'string' && id in EMOJI_MAP
}

function writeToStorage(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

function readFromStorage(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) return []

  const filtered = parsed.filter(isValidEmojiId)

  if (filtered.length !== parsed.length) {
    writeToStorage(filtered)
  }

  return filtered
}

let recent: string[] = readFromStorage()
let listeners: Array<() => void> = []

function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): string[] {
  return recent
}

function setRecent(next: string[]) {
  recent = next
  writeToStorage(next)
  for (const listener of listeners) listener()
}

export function useRecentEmojis() {
  const value = useSyncExternalStore(subscribe, getSnapshot)

  const addRecent = useCallback((emojiId: string) => {
    setRecent(
      [emojiId, ...recent.filter((id) => id !== emojiId)].slice(0, MAX_RECENT),
    )
  }, [])

  return { recent: value, addRecent }
}
