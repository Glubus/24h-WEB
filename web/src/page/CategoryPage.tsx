import type { Page } from '../types/page'
import { SmallCardAnnonce } from '../components/SmallCardAnnonce.tsx'

type CategoryPageProps = {
    onNavigate: (page: Page) => void
    category: string
}

export function CategoryPage({ category }: CategoryPageProps) {
    return (
        <div className="mt-6">
            <h1 className="text-3xl font-bold mb-6">{category}</h1>
            <div className="flex flex-wrap gap-4">
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
            </div>
        </div>
    )
}
