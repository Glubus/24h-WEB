import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Annonce, ApiId } from '../services/api'

export function useAnnonce(id: ApiId | null) {
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (id === null) {
      setAnnonce(null)
      return
    }

    setLoading(true)
    setError(null)
    api.getAnnonce(id)
      .then(result => setAnnonce(result))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [id])

  return { annonce, loading, error }
}
