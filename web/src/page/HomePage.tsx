import type { Page } from '../types/page'
import {CategorySmallAnnonceCard} from "../components/CategorySmallAnnonceCard.tsx";

type HomePageProps = {
  onNavigate: (page: Page) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      <main className="hero min-h-[calc(100vh-65px)] bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold">Bienvenue sur 24h Web</h1>
            <p className="py-6">
              Une base simple en React avec DaisyUI, prête à être développée
              proprement.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onNavigate('annonce')}
              >
                Annonce test
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => onNavigate('login')}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
      <section className="bg-base-100 py-10 px-6">
        <div className={"flex-row flex-wrap gap-10 flex"}>
          <CategorySmallAnnonceCard />
          <CategorySmallAnnonceCard />
          <CategorySmallAnnonceCard />
          <CategorySmallAnnonceCard />
        </div>


      </section>
    </div>
  )
}
