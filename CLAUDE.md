# US BSL Database

A breed-specific legislation (BSL) tracking application for the United States. Legislation data is maintained by the project owner (not community-submitted).

## Tech Stack

- **Frontend**: TypeScript, React 18, Vite
- **Styling**: Tailwind CSS, Radix UI primitives (shadcn/ui)
- **Data**: Supabase (database, RLS), React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet / React Leaflet
- **Charts**: D3, Observable Plot
- **Monitoring**: Sentry (error tracking), Vercel Analytics
- **Hosting**: Vercel

## Commands

```bash
yarn dev        # Start dev server (port 8080)
yarn build      # Production build
yarn build:dev  # Development build
yarn lint       # ESLint
yarn preview    # Preview production build
```

## Project Structure

```
src/
  components/
    ui/           # shadcn/ui primitives (button, dialog, etc.)
    contact/      # Contact page components
  hooks/          # Custom hooks (data fetching, tracking)
  pages/          # Route page components
  types/          # TypeScript type definitions
sql/
  migrations/     # Supabase database migrations
  monitoring/     # Performance monitoring SQL scripts
docs/             # Project documentation
```

## Key Architecture

- **No auth**: Authentication has been removed. The app is a public data viewer with no login or user accounts.
- **RLS**: All tables use Row Level Security. Use `(select auth.uid())` (subquery form) in policies for performance.
- **Data fetching**: React Query hooks in `src/hooks/`, named `use[Entity][Action]`.
- **Path alias**: `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig`).

## Conventions

- Use existing shadcn/ui components from `src/components/ui/` before adding new ones.
- Database changes go in `sql/migrations/` with RLS policies included.
- TypeScript types for DB entities live in `src/types/`.
- Keep RLS policies simple and direct; avoid circular dependencies.
