import { useState } from 'react'

type SearchBarProps = {
    onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [query, setQuery] = useState('')

    function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault()

        const trimmedQuery = query.trim()

        if (trimmedQuery.length === 0) {
            return
        }

        onSearch(trimmedQuery)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <label className="input w-full flex items-center gap-2">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input
                    type="search"
                    className="grow"
                    placeholder="Rechercher une annonce"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-primary">
                    Rechercher
                </button>
            </label>
        </form>
    )
}
