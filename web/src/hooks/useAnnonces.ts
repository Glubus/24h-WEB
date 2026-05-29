import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { AnnonceFilters, AnnonceListItem } from '../services/api'

export function useAnnonces(filters: AnnonceFilters = {}) {
  const [annonces, setAnnonces] = useState<AnnonceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const filtersKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    const activeFilters = JSON.parse(filtersKey) as AnnonceFilters
import { useState, useEffect } from "react";
import { api } from "../services/api";
import type { AnnonceListItem } from "../services/api";

export function useAnnonces(category?: string) {
  const [annonces, setAnnonces] = useState<AnnonceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.listAnnonces(activeFilters)
        if (!cancelled) setAnnonces(result.member)
        const result = await api.listAnnonces(
          category ? { categories: category as never } : {},
        );
        if (!cancelled) setAnnonces(result.member);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true
    }
  }, [filtersKey])
      cancelled = true;
    };
  }, [category]);

  return { annonces, loading, error };
}
