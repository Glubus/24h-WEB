import type { Page } from '../types/page'
import {SmallCardAnnonce} from "../components/SmallCardAnnonce.tsx";

type HomePageProps = {
  onNavigate: (page: Page) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="hero min-h-[calc(100vh-65px)] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold">Bienvenue sur 24h Web</h1>
          <p className="py-6">
            Une base simple en React avec DaisyUI, prête à être développée
            proprement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-primary">
              Découvrir
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigate('login')}
            >
              Login
            </button>
            <SmallCardAnnonce />
          </div>
        </div>
      </div>
    </main>
  )
}
