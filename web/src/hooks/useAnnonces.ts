import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { AnnonceListItem } from '../services/api'

export function useAnnonces(category?: string) {
  const [annonces, setAnnonces] = useState<AnnonceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.listAnnonces(category ? { categories: category as never } : {})
      .then(result => setAnnonces(result.member))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [category])

  return { annonces, loading, error }
}
