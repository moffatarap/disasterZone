// Thin localStorage wrapper - access can throw (private browsing, quota,
// disabled storage), and losing a "remember this for next time" convenience
// isn't worth surfacing an error for, so every call swallows failures.

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // See module comment.
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // See module comment.
  }
}
