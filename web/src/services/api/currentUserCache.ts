import type { User } from './types'

const CURRENT_USER_CACHE_KEY = 'current_user_cache'

type CachedCurrentUser = {
  token: string
  user: User
}

export function readCachedCurrentUser(token: string) {
  try {
    const rawCache = localStorage.getItem(CURRENT_USER_CACHE_KEY)

    if (rawCache === null) {
      return null
    }

    const cached = JSON.parse(rawCache) as Partial<CachedCurrentUser>

    if (cached.token !== token || !isCachedUser(cached.user)) {
      return null
    }

    return cached.user
  } catch {
    return null
  }
}

export function writeCachedCurrentUser(token: string, user: User) {
  localStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify({ token, user }))
}

export function clearCachedCurrentUser() {
  localStorage.removeItem(CURRENT_USER_CACHE_KEY)
}

function isCachedUser(value: unknown): value is User {
  return typeof value === 'object'
    && value !== null
    && 'username' in value
    && typeof (value as { username?: unknown }).username === 'string'
}
