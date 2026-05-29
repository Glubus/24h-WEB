import type { AnnonceListItem } from '../services/api'

type SmallCardAnnonceProps = Pick<AnnonceListItem, 'title' | 'price' | 'imagePath' | 'city'> & {
    onClick?: () => void
}

export function SmallCardAnnonce({ title, price, imagePath, city, onClick }: SmallCardAnnonceProps) {
    return (
        <div
            className="card bg-base-200 w-[220px] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
        >
            <figure>
                <div className={"relative"}>
                    <img
                        src={imagePath ?? 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'}
                        alt={title}
                    />
                    <div className={"badge absolute top-2 left-2 badge-ghost badge-lg"}>{price}€</div>
                </div>
            </figure>
            <div className="card-body p-2 text-left mb-4">
                <h2 className="card-title card-sm">{title}</h2>
                {city && <p>{city}</p>}
            </div>
        </div>
    )
}