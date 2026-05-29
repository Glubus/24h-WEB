import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiPlatformClient } from './client'

const apiBaseUrl = 'https://api.test/api'
const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('ApiPlatformClient', () => {
  it('logs in with JSON credentials and stores the returned token', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl })
    fetchMock.mockResolvedValueOnce(jsonResponse({ token: 'token-123', username: 'admin' }))

    const response = await client.login({ email: 'admin@example.com', password: 'changeme' })
    const [, init] = lastFetchCall()
    const headers = requestHeaders(init)

    expect(response).toEqual({ token: 'token-123', username: 'admin' })
    expect(client.getToken()).toBe('token-123')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({ email: 'admin@example.com', password: 'changeme' }))
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('lists annonces with Api Platform search and range filters', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl })
    fetchMock.mockResolvedValueOnce(jsonResponse({ member: [], totalItems: 0 }))

    await client.listAnnonces({
      title: 'velo',
      description: 'course',
      categories: ['sport', 'home'],
      masked: false,
      sold: true,
      page: 2,
      price: {
        gte: 10,
        lte: 50,
      },
    })

    const [url, init] = lastFetchCall()
    const requestUrl = new URL(String(url))

    expect(init?.method).toBe('GET')
    expect(requestUrl.pathname).toBe('/api/annonces')
    expect(requestUrl.searchParams.get('title')).toBe('velo')
    expect(requestUrl.searchParams.get('description')).toBe('course')
    expect(requestUrl.searchParams.getAll('categories')).toEqual(['sport', 'home'])
    expect(requestUrl.searchParams.get('masked')).toBe('false')
    expect(requestUrl.searchParams.get('sold')).toBe('true')
    expect(requestUrl.searchParams.get('page')).toBe('2')
    expect(requestUrl.searchParams.get('price[gte]')).toBe('10')
    expect(requestUrl.searchParams.get('price[lte]')).toBe('50')
  })

  it('patches annonces with merge-patch JSON and bearer token', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 7, title: 'Nouveau titre' }))

    await client.updateAnnonce(7, { title: 'Nouveau titre', city: 'Montpellier' })
    const [url, init] = lastFetchCall()
    const headers = requestHeaders(init)

    expect(url).toBe(`${apiBaseUrl}/annonces/7`)
    expect(init?.method).toBe('PATCH')
    expect(init?.body).toBe(JSON.stringify({ title: 'Nouveau titre', city: 'Montpellier' }))
    expect(headers.get('Accept')).toBe('application/ld+json')
    expect(headers.get('Content-Type')).toBe('application/merge-patch+json')
    expect(headers.get('Authorization')).toBe('Bearer token-123')
  })

  it('uploads annonce images as multipart form data without forcing a content type', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    const image = new File(['image-content'], 'annonce.png', { type: 'image/png' })
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 7, images: ['/uploads/annonce.png'] }))

    await client.uploadAnnonceImage(7, image)
    const [url, init] = lastFetchCall()
    const headers = requestHeaders(init)

    expect(url).toBe(`${apiBaseUrl}/annonces/7/image`)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)
    expect((init?.body as FormData).get('image')).toBe(image)
    expect(headers.get('Authorization')).toBe('Bearer token-123')
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('uploads user profile pictures through the API pictures route', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    const image = new File(['image-content'], 'profile.png', { type: 'image/png' })
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 3, profileImagePath: '/uploads/users/profile.png' }))

    await client.uploadUserImage(3, image)
    const [url, init] = lastFetchCall()
    const headers = requestHeaders(init)

    expect(url).toBe(`${apiBaseUrl}/users/3/pictures`)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)
    expect((init?.body as FormData).get('image')).toBe(image)
    expect(headers.get('Authorization')).toBe('Bearer token-123')
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('deletes a specific annonce image by index', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(client.deleteAnnonceImage(7, 0)).resolves.toBeUndefined()
    const [url, init] = lastFetchCall()

    expect(url).toBe(`${apiBaseUrl}/annonces/7/images/0`)
    expect(init?.method).toBe('DELETE')
  })

  it('switches masked state through the dedicated annonce route', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: 7, masked: true }))

    await client.switchAnnonceMasked(7)
    const [url, init] = lastFetchCall()

    expect(url).toBe(`${apiBaseUrl}/annonces/7/masked`)
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe(JSON.stringify({}))
  })

  it('gets annonce categories from the documented ApiResource endpoint', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl })
    const categories = {
      member: [
        { name: 'car' },
        { name: 'electronic' },
        { name: 'sport' },
        { name: 'home' },
      ],
      totalItems: 4,
    }

    fetchMock.mockResolvedValueOnce(jsonResponse(categories))

    await expect(client.listAnnonceCategories()).resolves.toEqual(categories)
    expect(lastFetchCall()[0]).toBe(`${apiBaseUrl}/annonces/categories`)
  })

  it('deletes annonces and accepts empty 204 responses', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl, token: 'token-123' })
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(client.deleteAnnonce(7)).resolves.toBeUndefined()

    const [url, init] = lastFetchCall()
    expect(url).toBe(`${apiBaseUrl}/annonces/7`)
    expect(init?.method).toBe('DELETE')
  })

  it('throws ApiError with the server detail when the API returns an error', async () => {
    const client = new ApiPlatformClient({ baseUrl: apiBaseUrl })
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: 'Forbidden' }, 403))

    await expect(client.getAnnonce(7)).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
      message: 'Forbidden',
    })
  })
})

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/ld+json',
    },
  })
}

function lastFetchCall() {
  const call = fetchMock.mock.calls.at(-1)

  if (call === undefined) {
    throw new Error('fetch was not called')
  }

  return call
}

function requestHeaders(init: RequestInit | undefined) {
  return new Headers(init?.headers)
}
