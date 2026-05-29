import type { Page } from '../types/page'
import { Map } from '../components/Map'
import { SmallCardAccount } from '../components/SmallCardAccount.tsx'

type AnnoncePageProps = {
  onNavigate: (page: Page) => void
}

const annonceCoordinates = [
  {
    id: 'cafetière-italienne',
    latitude: 43.610769,
    longitude: 3.876716,
    label: 'Cafetière Italienne',
  },
]

export function AnnoncePage({ onNavigate }: AnnoncePageProps) {
  return (
      <div className="mt-1">
          <div className="breadcrumbs text-sm">
              <ul>
                  <li>
                      <button type="button" onClick={() => onNavigate('home')}>
                          Home
                      </button>
                  </li>
                  <li><a>Documents</a></li>
                  <li>Add Document</li>
              </ul>
          </div>
          <div className="flex gap-6 mt-10">
              <div className="h-[650px] flex-1">
                  <img
                      className="rounded-2xl w-full h-full object-cover"
                      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                      alt="Shoes"
                  />
              </div>
              <div className="flex h-[650px] w-[500px] shrink-0 flex-col">
                  <SmallCardAccount />
                  <h2 className="text-2xl font-bold mt-10">Cafetière Italienne</h2>
                  <p>Description</p>
                  <div className="mt-6 min-h-0 flex-1 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                      <Map coordinates={annonceCoordinates} height="100%" />
                  </div>
              </div>
          </div>

          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-base-200 flex items-center gap-5 pt-3 pb-3 pl-7 pr-7 rounded-lg shadow">
              <h2 className="text-2xl font-bold">25€</h2>
              <button className="btn btn-primary">Acheter</button>
          </div>
      </div>

  )
}
