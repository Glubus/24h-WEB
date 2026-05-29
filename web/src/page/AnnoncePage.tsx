import type { Page } from '../types/page'
import {SmallCardAccount} from "../components/SmallCardAccount.tsx";

type AnnoncePageProps = {
  onNavigate: (page: Page) => void
}

export function AnnoncePage({ onNavigate }: AnnoncePageProps) {
  return (
      <div className="mt-1">
          <div className="breadcrumbs text-sm">
              <ul>
                  <li><a>Home</a></li>
                  <li><a>Documents</a></li>
                  <li>Add Document</li>
              </ul>
          </div>
          <div className="flex gap-6 mt-10">
              <div className="flex-1">
                  <img
                      className="rounded-2xl w-full h-full object-cover"
                      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                      alt="Shoes"
                  />
              </div>
              <div className="w-[500px] shrink-0">
                  <SmallCardAccount />
                  <h2 className="text-2xl font-bold mt-10">Cafetière Italienne</h2>
                  <p>Description</p>
                  <p>ICI METTRE LOCALISATION</p>
              </div>
          </div>

          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-base-200 flex items-center gap-5 pt-3 pb-3 pl-7 pr-7 rounded-lg shadow">
              <h2 className="text-2xl font-bold">25€</h2>
              <button className="btn btn-primary">Acheter</button>
          </div>
      </div>

  )
}