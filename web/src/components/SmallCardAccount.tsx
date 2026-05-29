type SmallCardAccountProps = {
    username?: string | null
    rating?: number | null
    loading?: boolean
}

const DEFAULT_AVATAR = 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'

export function SmallCardAccount({ username, rating, loading }: SmallCardAccountProps) {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(rating ?? 0)))

    return (
        <div className="card bg-base-200 w-[300px]">
            <div className="card-body flex flex-row items-center gap-4">
                <div className="avatar">
                    <div className="w-16 rounded-full">
                        <img src={DEFAULT_AVATAR} alt={username ?? 'avatar'} />
                    </div>
                </div>
                <div>
                    <h2 className="card-title">
                        {loading ? <span className="loading loading-spinner loading-xs" /> : username ?? 'Utilisateur inconnu'}
                    </h2>
                    <div className="rating rating-sm pointer-events-none">
                        {[1, 2, 3, 4, 5].map(value => (
                            <div
                                key={value}
                                className={`mask mask-star-2 ${value <= normalizedRating ? 'bg-orange-400' : 'bg-base-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}