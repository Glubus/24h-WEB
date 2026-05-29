import type { AnnonceCategory } from '../../services/api'
import type { ImagePreview } from './ImagePicker'
import { CategoryDisplay } from '../CategoryDisplay'

type AnnoncePreviewProps = {
  category: AnnonceCategory
  city: string
  description: string
  imagePreviews: ImagePreview[]
  price: string
  title: string
}

export function AnnoncePreview({ category, city, description, imagePreviews, price, title }: AnnoncePreviewProps) {
  return (
    <div className="mt-8 border-t border-base-300 pt-6">
      <h2 className="text-lg font-semibold">Prévisualisation</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-base-300 bg-base-100">
        {imagePreviews[0] === undefined ? (
          <div className="flex h-56 items-center justify-center bg-base-200 text-sm text-base-content/50">
            Aucune image sélectionnée
          </div>
        ) : (
          <img className="h-56 w-full object-cover" src={imagePreviews[0].url} alt={imagePreviews[0].name} />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">{title.length > 0 ? title : 'Titre de l’annonce'}</h3>
              <p className="mt-1 text-sm text-base-content/60">{city.length > 0 ? city : 'Ville'}</p>
            </div>
            <p className="text-xl font-bold">{price.length > 0 ? `${Number.parseInt(price, 10)}€` : '0€'}</p>
          </div>
          <p className="mt-3 line-clamp-3 text-sm text-base-content/70">
            {description.length > 0 ? description : 'La description de votre annonce apparaîtra ici.'}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="badge badge-outline">
              <CategoryDisplay category={category} iconClassName="h-3.5 w-3.5" />
            </span>
            <span className="text-xs text-base-content/50">{imagePreviews.length} image(s)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
