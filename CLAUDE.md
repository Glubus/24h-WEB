# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Full-stack project with two independent parts:

- **`web/`** — React 19 + Vite + TypeScript frontend (TailwindCSS v4 + DaisyUI v5)
- **`sfapi/`** — Symfony 6.4 backend exposing a REST/JSON API via API Platform v4

The whole stack runs via Docker Compose. Nginx (port 8000) proxies API calls to the Symfony container; the Vite dev server runs on port 5173.

## Commands

All Docker-based commands are in `web/justfile` (requires `just`):

```sh
just dev           # Start full stack (docker compose up)
just dev-detached  # Start in background
just stop          # Stop containers
just logs          # Tail frontend logs
just build         # Build frontend assets
just lint          # Run ESLint inside container
```

Frontend-only (inside `web/`, requires local Node):
```sh
npm run dev        # Vite dev server
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint
npm run lint:css   # Stylelint on CSS files
npm run fix:css    # Stylelint auto-fix
```

Symfony (inside `sfapi/`):
```sh
php bin/console doctrine:migrations:migrate
php bin/console doctrine:migrations:diff
php bin/console hautelook:fixtures:load   # load fixtures via Foundry
```

## Frontend routing

Navigation is a simple state machine in `web/src/App.tsx`. The active page is a `Page` union type (`web/src/types/page.ts`). To add a new page:

1. Add the page name to the `Page` type in `src/types/page.ts`
2. Create the component in `src/page/`
3. Add the case to the conditional render in `App.tsx`

## Frontend conventions

- **Pages** live in `src/page/`, **reusable components** in `src/components/`
- Components receive `onNavigate: (page: Page) => void` as prop when they need to trigger navigation
- Styling: Tailwind utility classes directly in `className`. DaisyUI semantic color tokens (`text-primary`, `bg-base-100`…) are preferred over raw Tailwind colors for theme consistency
- Global horizontal padding is applied in `App.tsx` (`px-6 md:px-12 lg:px-24`) — do not add lateral padding individually to page components

## Backend

Symfony API Platform exposes entities as JSON API resources. Entities are in `sfapi/src/Entity/`, API resource configuration in `sfapi/src/ApiResource/`. Fixtures use Zenstruck Foundry (`sfapi/src/Factory/`, `sfapi/src/DataFixtures/`). Database is MySQL 8 (credentials in `compose.yml`).
