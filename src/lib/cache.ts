const PREFIX = 'sungju-study:v1:'

interface CacheEntry<T> {
  savedAt: number
  data: T
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  const store = storage()
  if (!store) return null
  try {
    const raw = store.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (!parsed || typeof parsed.savedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  const store = storage()
  if (!store) return
  try {
    store.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage can be full or blocked. The app still works without it.
  }
}
