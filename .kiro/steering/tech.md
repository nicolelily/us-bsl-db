# Technology Stack

## Build System & Framework

- **Vite**: Modern build tool and dev server
- **React 18**: Frontend framework with TypeScript
- **TypeScript**: Type-safe JavaScript with relaxed config (noImplicitAny: false)

## Core Libraries

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom BSL theme colors
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **class-variance-authority (CVA)**: Component variant management

### State Management & Data
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod validation
- **Zod**: Schema validation
- **React Router DOM**: Client-side routing

### Backend & Database
- **Supabase**: Backend-as-a-Service (PostgreSQL, Auth, Storage, Edge Functions)
- **Row Level Security (RLS)**: Database security policies

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **PostCSS**: CSS processing with Autoprefixer

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database (Supabase CLI)
supabase start       # Start local Supabase
supabase db reset    # Reset local database
supabase db push     # Push migrations to remote
```

## Environment Variables

Required environment variables (see `.env.example`):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_FORMSPREE_ENDPOINT`: Contact form endpoint

## Key Patterns

- Path aliases: `@/*` maps to `./src/*`
- Component variants using CVA
- Custom Tailwind theme with BSL brand colors
- Supabase client singleton pattern
- React Query for all server state