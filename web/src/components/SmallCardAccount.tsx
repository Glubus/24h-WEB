import { useState } from 'react'
import { userPictureUrl } from '../services/api/assets'
import { formatUsername } from '../utils/formatUsername'

type SmallCardAccountProps = {
    annonceCreatedAt?: string | null
    favoriteCount?: number | null
    successfulSaleCount?: number | null
    userId?: number | null
    username?: string | null
    rating?: number | null
    loading?: boolean
    canRate?: boolean
    isRating?: boolean
    onRate?: (rating: number) => void
}

export function SmallCardAccount({
    annonceCreatedAt,
    canRate = false,
    favoriteCount,
    isRating = false,
    loading,
    onRate,
    rating,
    successfulSaleCount,
    userId,
    username,
}: SmallCardAccountProps) {
    const normalizedRating = Math.max(0, Math.min(5, rating ?? 0))
    const displayUsername = formatUsername(username)
    const initial = username?.charAt(0).toUpperCase() ?? '?'
    const profileImageUrl = userId === null || userId === undefined ? null : userPictureUrl(userId)

    return (
        <div className="card bg-base-200 w-full">
            <div className="card-body flex flex-row items-center gap-4">
                <div className={`avatar ${profileImageUrl === null ? 'placeholder' : ''}`}>
                    <div className="w-16 rounded-full bg-primary text-xl text-primary-content">
                        {profileImageUrl === null ? <span>{initial}</span> : <img src={profileImageUrl} alt={displayUsername || 'avatar'} />}
                    </div>
                </div>
                <div>
                    <h2 className="card-title">
                        {loading ? <span className="loading loading-spinner loading-xs" /> : displayUsername || 'Utilisateur inconnu'}
                    </h2>
                    <RatingStars
                        canRate={canRate}
                        isRating={isRating}
                        onRate={onRate}
                        value={normalizedRating}
                    />
                    {annonceCreatedAt ? (
                        <p className="mt-1 text-xs text-base-content/60">{formatDate(annonceCreatedAt)}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-base-content/60">{successfulSaleCount ?? 0} ventes réussies</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-2xl font-bold">{favoriteCount ?? 0}</p>
                    <p className="text-xs text-base-content/60">favoris</p>
                </div>
            </div>
import { userPictureUrl } from "../services/api/assets";
import { formatUsername } from "../utils/formatUsername";

type SmallCardAccountProps = {
  favoriteCount?: number | null;
  successfulSaleCount?: number | null;
  userId?: number | null;
  username?: string | null;
  rating?: number | null;
  loading?: boolean;
};

export function SmallCardAccount({
  favoriteCount,
  successfulSaleCount,
  userId,
  username,
  rating,
  loading,
}: SmallCardAccountProps) {
  const normalizedRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  const displayUsername = formatUsername(username);
  const initial = username?.charAt(0).toUpperCase() ?? "?";
  const profileImageUrl =
    userId === null || userId === undefined ? null : userPictureUrl(userId);

  return (
    <div className="card bg-base-200 w-full">
      <div className="card-body flex flex-row items-center gap-4">
        <div
          className={`avatar ${profileImageUrl === null ? "placeholder" : ""}`}
        >
          <div className="w-16 rounded-full bg-primary text-xl text-primary-content">
            {profileImageUrl === null ? (
              <span>{initial}</span>
            ) : (
              <img src={profileImageUrl} alt={displayUsername || "avatar"} />
            )}
          </div>
        </div>
        <div>
          <h2 className="card-title">
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              displayUsername || "Utilisateur inconnu"
            )}
          </h2>
          <div className="rating rating-sm pointer-events-none">
            {[1, 2, 3, 4, 5].map((value) => (
              <div
                key={value}
                className={`mask mask-star-2 ${value <= normalizedRating ? "bg-orange-400" : "bg-base-300"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-base-content/60">
            {successfulSaleCount ?? 0} ventes réussies
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold">{favoriteCount ?? 0}</p>
          <p className="text-xs text-base-content/60">favoris</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
    const date = new Date(value)
    const today = new Date()

    if (
        date.getDate() === today.getDate()
        && date.getMonth() === today.getMonth()
        && date.getFullYear() === today.getFullYear()
    ) {
        return `Aujourd'hui ${new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)}`
    }

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

function RatingStars({
    canRate,
    isRating,
    onRate,
    value,
}: {
    canRate: boolean
    isRating: boolean
    onRate?: (rating: number) => void
    value: number
}) {
    const [hoveredValue, setHoveredValue] = useState<number | null>(null)
    const stars = [1, 2, 3, 4, 5]
    const displayValue = hoveredValue ?? value

    return (
        <div
            className={`relative mt-1 inline-flex text-base leading-none ${canRate ? 'cursor-pointer transition hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]' : ''}`}
            aria-label={`Note ${value.toFixed(1)} sur 5`}
            onMouseLeave={() => setHoveredValue(null)}
        >
            <div className="text-base-300" aria-hidden="true">
                {stars.map((star) => (
                    <span key={star}>★</span>
                ))}
            </div>
            <div
                className={`absolute left-0 top-0 overflow-hidden text-orange-400 ${hoveredValue !== null ? 'brightness-125' : ''}`}
                style={{ width: `${(displayValue / 5) * 100}%` }}
                aria-hidden="true"
            >
                <div className="w-max">
                    {stars.map((star) => (
                        <span key={star}>★</span>
                    ))}
                </div>
            </div>
            {canRate ? (
                <div className="absolute inset-0 grid grid-cols-5" role="radiogroup" aria-label="Noter le vendeur">
                    {stars.map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="h-full min-h-5 cursor-pointer opacity-0"
                            disabled={isRating}
                            onClick={() => onRate?.(star)}
                            onMouseEnter={() => setHoveredValue(star)}
                            role="radio"
                            aria-checked={Math.round(value) === star}
                            aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}
