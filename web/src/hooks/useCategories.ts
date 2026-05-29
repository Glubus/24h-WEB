import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listAnnonceCategories()
      .then((result) =>
        setCategories(
          result.member.map((c) => (c as unknown as { value: string }).value),
        ),
      )
      .catch((err) => console.error("Erreur chargement catégories", err))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
