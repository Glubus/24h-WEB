export function apiAssetUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath.startsWith('/api/') ? normalizedPath.slice(4) : normalizedPath}`
}

export function annonceImageUrl(annonceId: number | string, imageIndex = 0) {
  return apiAssetUrl(`/annonces/${annonceId}/images/${imageIndex}`)
}

export function userPictureUrl(userId: number | string) {
  return apiAssetUrl(`/users/${userId}/pictures`)
}
