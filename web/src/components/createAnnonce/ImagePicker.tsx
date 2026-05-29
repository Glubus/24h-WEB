import type { ChangeEvent } from "react";

export type ImagePreview = {
  name: string;
  url: string;
};

type ImagePickerProps = {
  imagePreviews: ImagePreview[];
  onImagesChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ImagePicker({
  imagePreviews,
  onImagesChange,
}: ImagePickerProps) {
  return (
    <div className="md:col-span-2">
      <label className="btn btn-outline w-full">
        Choisir des images
        <input
          accept="image/*"
          className="hidden"
          multiple
          onChange={onImagesChange}
          type="file"
        />
      </label>

      {imagePreviews.length === 0 ? null : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {imagePreviews.map((image) => (
            <div
              className="overflow-hidden rounded-lg border border-base-300 bg-base-100"
              key={image.url}
            >
              <img
                className="h-28 w-full object-cover"
                src={image.url}
                alt={image.name}
              />
              <p className="truncate px-3 py-2 text-xs text-base-content/60">
                {image.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
