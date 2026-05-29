import { userPictureUrl } from '../services/api/assets'
import { formatUsername } from '../utils/formatUsername'

type SmallCardAccountProps = {
    favoriteCount?: number | null
    successfulSaleCount?: number | null
    userId?: number | null
    username?: string | null
    rating?: number | null
    loading?: boolean
}

export function SmallCardAccount({ favoriteCount, successfulSaleCount, userId, username, rating, loading }: SmallCardAccountProps) {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)))
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
                    <div className="rating rating-sm pointer-events-none">
                        {[1, 2, 3, 4, 5].map(value => (
                            <div
                                key={value}
                                className={`mask mask-star-2 ${value <= normalizedRating ? 'bg-orange-400' : 'bg-base-300'}`}
                            />
                        ))}
                    </div>
                    <p className="mt-1 text-xs text-base-content/60">{successfulSaleCount ?? 0} ventes réussies</p>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-2xl font-bold">{favoriteCount ?? 0}</p>
                    <p className="text-xs text-base-content/60">favoris</p>
                </div>
            </div>
        </div>
    )
}
