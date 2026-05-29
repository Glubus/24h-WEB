import { useEffect, useState } from 'react'
import type { AnnonceListItem } from '../services/api'
import { annonceImageUrl, userPictureUrl } from '../services/api/assets'
import { formatUsername } from '../utils/formatUsername'

type SmallCardAnnonceProps = Pick<
    AnnonceListItem,
    'author' | 'createdAt' | 'favorites' | 'id' | 'title' | 'price' | 'images' | 'city' | 'masked' | 'sold'
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
    masked,
    onClick,
    price,
    sold,
    title,
}: SmallCardAnnonceProps) {
    const imageUrl = images.length > 0 ? annonceImageUrl(id) : DEFAULT_IMAGE
    const [loadedImage, setLoadedImage] = useState<{ ready: boolean; url: string }>(() => ({
        ready: false,
        url: imageUrl,
    }))
    const sellerName = typeof author === 'string' ? 'Vendeur' : formatUsername(author.username)
    const sellerRating = typeof author === 'string' ? null : author.rating
    const sellerId = typeof author === 'string' ? idFromIri(author) : author.id
    const sellerImageUrl = sellerId === undefined ? null : userPictureUrl(sellerId)
    const sellerInitial = sellerName.charAt(0).toUpperCase()
    const createdAtLabel = formatDate(createdAt)
    const isFavorite = currentUserId === undefined ? false : relationContainsUser(favorites, currentUserId)

    useEffect(() => {
        let isCurrent = true
        const image = new Image()

        image.onload = () => {
            if (isCurrent) {
                setLoadedImage({ ready: true, url: imageUrl })
            }
        }
        image.onerror = () => {
            if (isCurrent) {
                setLoadedImage({ ready: true, url: imageUrl })
            }
        }
        image.src = imageUrl

        return () => {
            isCurrent = false
        }
    }, [imageUrl])

    const imageReady = loadedImage.ready && loadedImage.url === imageUrl

    if (!imageReady) {
        return (
            <div className="card w-[240px] bg-base-200">
                <div className="skeleton h-40 w-full rounded-b-none" />
                <div className="card-body p-3">
                    <div className="skeleton h-5 w-4/5" />
                    <div className="skeleton h-4 w-2/5" />
                    <div className="flex items-center gap-2">
                        <div className="skeleton h-6 w-6 rounded-full" />
                        <div className="skeleton h-4 w-1/2" />
                    </div>
                    <div className="skeleton h-4 w-1/3" />
                </div>
            </div>
        )
    }

    return (
        <div
            className="card bg-base-200 w-[240px] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            <figure className="h-40 max-h-40 w-full overflow-hidden">
                <div className="relative h-full w-full">
                    <img
                        className="h-full max-h-40 w-full object-cover"
                        decoding="async"
                        loading="lazy"
                        src={imageUrl}
                        alt={title}
                    />
	                    <div className={"badge absolute top-2 left-2 badge-ghost badge-lg"}>{price}€</div>
	                        {isFavorite ? (
	                            <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-base-100/90 text-secondary shadow" aria-label="Favori">
	                                <HeartIcon />
	                            </div>
	                        ) : null}
                        <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
                            {sold ? <span className="badge badge-error">Déjà vendu</span> : null}
                            {masked ? <span className="badge badge-warning">Masquée</span> : null}
                        </div>
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

function HeartIcon() {
    return (
        <svg aria-hidden="true" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    )
}
