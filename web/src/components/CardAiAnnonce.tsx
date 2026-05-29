import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Annonce } from '../services/api'
import { annonceImageUrl } from '../services/api/assets'

type CardAiAnnonceProps = {
  annonceId: number
  onClick?: () => void
}

const DEFAULT_IMAGE = 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'

export function CardAiAnnonce({ annonceId, onClick }: CardAiAnnonceProps) {
  const [annonce, setAnnonce] = useState<Annonce | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setLoading(true)
      setFailed(false)

      try {
        const result = await api.getAnnonce(annonceId)
        if (!cancelled) setAnnonce(result)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [annonceId])

  if (loading) {
    return (
      <div className="w-44 shrink-0">
        <div className="skeleton h-28 w-full rounded-box" />
        <div className="skeleton mt-2 h-4 w-3/4" />
        <div className="skeleton mt-1 h-3 w-1/2" />
      </div>
    )
  }

  if (failed || annonce === null) {
    return null
  }

  const imageUrl = annonce.images.length > 0 ? annonceImageUrl(annonce.id) : DEFAULT_IMAGE

  return (
    <div
      className="card bg-base-100 border border-base-300 w-44 shrink-0 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <figure className="relative">
        <img src={imageUrl} alt={annonce.title} className="h-28 w-full object-cover" />
        <div className="badge badge-ghost badge-sm absolute left-2 top-2">{annonce.price}€</div>
      </figure>
      <div className="card-body p-2 text-left">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{annonce.title}</h3>
        {annonce.city && <p className="text-xs text-base-content/70">{annonce.city}</p>}
      </div>
    </div>
  )
}
