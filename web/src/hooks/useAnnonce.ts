import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Annonce, ApiId } from '../services/api'

export function useAnnonce(id: ApiId | null) {
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (id === null) {
        setAnnonce(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await api.getAnnonce(id)
        if (!cancelled) setAnnonce(result)
      } catch (err) {
        if (!cancelled) setError(err as Error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  return { annonce, loading, error }
}
