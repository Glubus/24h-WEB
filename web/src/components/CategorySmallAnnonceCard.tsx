import { SmallCardAnnonce } from "./SmallCardAnnonce.tsx";

export function CategorySmallAnnonceCard() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Technologie</h2>
            <div className="flex flex-wrap gap-4">
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
                <SmallCardAnnonce />
            </div>
        </div>
    )
}