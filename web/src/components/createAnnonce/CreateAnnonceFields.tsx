import type { ChangeEvent } from 'react'
import type { AnnonceCategory } from '../../services/api'
import { LocationIcon, PriceIcon, TitleIcon } from './CreateAnnonceIcons'
import { ImagePicker, type ImagePreview } from './ImagePicker'
import { annonceCategories } from './createAnnonceOptions'

type CreateAnnonceFieldsProps = {
  address: string
  category: AnnonceCategory
  city: string
  description: string
  imagePreviews: ImagePreview[]
  imagePickerLabel?: string
  onAddressChange: (value: string) => void
  onCategoryChange: (value: AnnonceCategory) => void
  onCityChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImagesChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDeleteImage?: (image: ImagePreview) => void
  onPriceChange: (value: string) => void
  onTitleChange: (value: string) => void
  price: string
  title: string
}

export function CreateAnnonceFields({
  address,
  category,
  city,
  description,
  imagePreviews,
  imagePickerLabel,
  onAddressChange,
  onCategoryChange,
  onCityChange,
  onDescriptionChange,
  onImagesChange,
  onDeleteImage,
  onPriceChange,
  onTitleChange,
  price,
  title,
}: CreateAnnonceFieldsProps) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100 md:col-span-2">
        <TitleIcon />
        <input
          className="grow"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Titre"
          required
          type="text"
          value={title}
        />
      </label>

      <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
        <PriceIcon />
        <input
          className="grow"
          min="0"
          onChange={(event) => onPriceChange(event.target.value)}
          placeholder="Prix"
          required
          step="1"
          type="number"
          value={price}
        />
      </label>

      <select
        className="select select-bordered h-12 w-full bg-base-200/60"
        onChange={(event) => onCategoryChange(event.target.value as AnnonceCategory)}
        value={category}
      >
        {annonceCategories.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <LocationField onChange={onCityChange} placeholder="Ville" value={city} />
      <LocationField onChange={onAddressChange} placeholder="Adresse" value={address} />

      <textarea
        className="textarea textarea-bordered col-span-full min-h-36 w-full bg-base-200/60"
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Description"
        required
        value={description}
      />

      <ImagePicker
        imagePreviews={imagePreviews}
        label={imagePickerLabel}
        onDeleteImage={onDeleteImage}
        onImagesChange={onImagesChange}
      />
    </div>
  )
}

function LocationField({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="input input-bordered flex h-12 w-full items-center gap-3 bg-base-200/60 focus-within:bg-base-100">
      <LocationIcon />
      <input
        className="grow"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  )
}
