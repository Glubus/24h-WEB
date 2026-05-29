
export function SmallCardAnnonce() {
    return (
        <div className="card bg-base-200 w-[220px]">
            <figure>
                <div className={"relative"}>
                    <img
                        src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                        alt="Shoes"/>
                    <div className={"badge absolute top-2 left-2 badge-ghost badge-lg"}>20€</div>
                </div>
            </figure>
            <div className="card-body p-2 text-left mb-4">
                <h2 className="card-title card-sm">
                    Cafetière Italienne
                </h2>
                <p>Gesté</p>
            </div>
        </div>
    )
}