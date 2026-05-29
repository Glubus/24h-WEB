export function SmallCardAccount() {
    return (
        <div className="card bg-base-200 w-[300px]">
            <div className="card-body flex flex-row items-center gap-4">
                <div className="avatar">
                    <div className="w-16 rounded-full">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="avatar" />
                    </div>
                </div>
                <div>
                    <h2 className="card-title">John Doe</h2>
                    <div className="rating rating-sm pointer-events-none">
                        <input type="radio" name="rating" className="mask mask-star-2 bg-orange-400" />
                        <input type="radio" name="rating" className="mask mask-star-2 bg-orange-400" />
                        <input type="radio" name="rating" className="mask mask-star-2 bg-orange-400" defaultChecked />
                        <input type="radio" name="rating" className="mask mask-star-2 bg-orange-400" />
                        <input type="radio" name="rating" className="mask mask-star-2 bg-orange-400" />
                    </div>
                </div>
            </div>
        </div>
    )
}