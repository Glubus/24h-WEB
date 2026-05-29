import type { AnnonceListItem } from '../services/api'
import { annonceImageUrl, userPictureUrl } from '../services/api/assets'
import { formatUsername } from '../utils/formatUsername'

type SmallCardAnnonceProps = Pick<
    AnnonceListItem,
    'author' | 'createdAt' | 'favorites' | 'id' | 'title' | 'price' | 'images' | 'city'
> & {
    currentUserId?: number
    onClick?: () => void
}

const DEFAULT_IMAGE = 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'

export function SmallCardAnnonce({
    author,
    city,
    createdAt,
    currentUserId,
    favorites,
    id,
    images,
    onClick,
    price,
    title,
}: SmallCardAnnonceProps) {
    const imageUrl = images.length > 0 ? annonceImageUrl(id) : DEFAULT_IMAGE
    const sellerName = typeof author === 'string' ? 'Vendeur' : formatUsername(author.username)
    const sellerRating = typeof author === 'string' ? null : author.rating
    const sellerId = typeof author === 'string' ? idFromIri(author) : author.id
    const sellerImageUrl = sellerId === undefined ? null : userPictureUrl(sellerId)
    const sellerInitial = sellerName.charAt(0).toUpperCase()
    const createdAtLabel = formatDate(createdAt)
    const isFavorite = currentUserId === undefined ? false : relationContainsUser(favorites, currentUserId)

    return (
        <div
            className="card bg-base-200 w-[240px] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            <figure>
                <div className={"relative"}>
                    <img
                        src={imageUrl}
                        alt={title}
                    />
	                    <div className={"badge absolute top-2 left-2 badge-ghost badge-lg"}>{price}€</div>
                        {isFavorite ? (
                            <div className="badge badge-secondary absolute right-2 top-2">Favori</div>
                        ) : null}
                </div>
            </figure>
            <div className="card-body p-3 text-left">
                <h2 className="card-title card-sm">{title}</h2>
                <div className="mt-1 flex flex-col gap-1 text-sm text-base-content/70">
                    {city && <p>{city}</p>}
                    <p className="flex items-center gap-2">
                        <span className={`avatar ${sellerImageUrl === null ? 'placeholder' : ''}`}>
                            <div className="h-6 w-6 rounded-full bg-primary text-xs text-primary-content">
                                {sellerImageUrl === null ? <span>{sellerInitial}</span> : <img src={sellerImageUrl} alt={sellerName} />}
                            </div>
                        </span>
                        <span>{sellerName}</span>
                        {sellerRating !== null && sellerRating !== undefined ? (
                            <span className="badge badge-sm gap-1">
                                ★ {sellerRating.toFixed(1)}
                            </span>
                        ) : null}
                    </p>
                    <p>{createdAtLabel}</p>
                </div>
            </div>
        </div>
    )
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

function idFromIri(value: string) {
    const match = value.match(/\/(\d+)$/)

    return match ? Number(match[1]) : undefined
}

function relationContainsUser(users: AnnonceListItem['favorites'], userId: number) {
    return users?.some((user) => {
        if (typeof user === 'string') {
            return user.endsWith(`/users/${userId}`)
        }

        return user.id === userId
    }) ?? false
}
