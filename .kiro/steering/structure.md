# Project Structure

## Root Level Organization

```
├── src/                    # Main application source
├── supabase/              # Database migrations and functions
├── public/                # Static assets
├── .kiro/                 # Kiro AI configuration
└── dist/                  # Build output
```

## Source Code Structure (`src/`)

### Core Application
- `main.tsx` - Application entry point
- `App.tsx` - Root component with providers and routing
- `index.css` - Global styles and Tailwind imports

### Component Organization
```
components/
├── ui/                    # shadcn/ui components (Button, Input, etc.)
├── admin/                 # Admin panel components
├── contact/               # Contact page components
├── forms/                 # Reusable form components
├── profile/               # User profile components
├── submissions/           # Data submission workflow
│   ├── form-components/   # Form-specific components
│   └── steps/            # Multi-step form components
├── Navigation.tsx         # Main navigation
├── DataTable.tsx         # Main data display
├── DataFilters.tsx       # Search and filter UI
└── ProtectedRoute.tsx    # Auth route wrapper
```

### Application Architecture
```
contexts/                  # React contexts (AuthContext)
hooks/                    # Custom React hooks
integrations/supabase/    # Supabase client and types
lib/                      # Utility functions (utils.ts)
pages/                    # Route components
types/                    # TypeScript type definitions
utils/                    # Business logic utilities
```

## Database Structure (`supabase/`)

```
migrations/               # SQL migration files
functions/               # Edge functions
config.toml             # Supabase configuration
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: PascalCase (`Index.tsx`, `MapView.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserRole.ts`)
- **Utils**: camelCase (`dataFetcher.ts`)
- **Types**: camelCase (`index.ts`, `submissions.ts`)

### Component Structure
- One component per file
- Default export for main component
- Named exports for related types/utilities
- Co-locate related components in subdirectories

### Import Organization
1. React imports
2. Third-party libraries
3. Internal components (using `@/` alias)
4. Types and utilities
5. Relative imports

## Key Architectural Patterns

- **Feature-based organization**: Components grouped by domain (admin, submissions, profile)
- **Shared UI components**: Reusable components in `ui/` directory
- **Custom hooks**: Business logic abstracted into hooks
- **Type safety**: Comprehensive TypeScript types for all data structures
- **Context providers**: Authentication and app state management