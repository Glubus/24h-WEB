import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { ApiId, ApiIri, User } from '../services/api'

function extractId(source: ApiId | ApiIri | null | undefined): ApiId | null {
  if (source === null || source === undefined) return null
  if (typeof source === 'number') return source
  const parts = source.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  return last ?? null
}

export function useUser(source: ApiId | ApiIri | User | null | undefined) {
  const initial = source !== null && typeof source === 'object' ? (source as User) : null
  const [user, setUser] = useState<User | null>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const id = source !== null && typeof source === 'object'
    ? null
    : extractId(source as ApiId | ApiIri | null | undefined)

  useEffect(() => {
    if (source !== null && typeof source === 'object') {
      setUser(source as User)
      return
    }
    if (id === null) {
      setUser(null)
      return
    }

    setLoading(true)
    setError(null)
    api.getUser(id)
      .then(result => setUser(result))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [id, source])

  return { user, loading, error }
}
