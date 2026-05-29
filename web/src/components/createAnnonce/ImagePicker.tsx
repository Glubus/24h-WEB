import type { ChangeEvent } from 'react'

export type ImagePreview = {
  index: number
  kind: 'existing' | 'local'
  name: string
  url: string
}

type ImagePickerProps = {
  imagePreviews: ImagePreview[]
  label?: string
  onDeleteImage?: (image: ImagePreview) => void
  onImagesChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function ImagePicker({ imagePreviews, label = 'Choisir des images', onDeleteImage, onImagesChange }: ImagePickerProps) {
  return (
    <div className="md:col-span-2">
      <label className="btn btn-outline w-full">
        {label}
        <input accept="image/*" className="hidden" multiple onChange={onImagesChange} type="file" />
      </label>

      {imagePreviews.length === 0 ? null : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {imagePreviews.map((image) => (
            <div className="relative overflow-hidden rounded-lg border border-base-300 bg-base-100" key={image.url}>
              {onDeleteImage === undefined ? null : (
                <button
                  type="button"
                  className="btn btn-circle btn-error btn-xs absolute right-2 top-2 z-10"
                  onClick={() => onDeleteImage(image)}
                  aria-label={`Supprimer ${image.name}`}
                >
                  ×
                </button>
              )}
              <img className="h-28 w-full object-cover" src={image.url} alt={image.name} />
              <p className="truncate px-3 py-2 text-xs text-base-content/60">{image.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
