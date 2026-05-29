export function apiAssetUrl(path: string) {
  const baseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath.startsWith('/api/') ? normalizedPath.slice(4) : normalizedPath}`
}
