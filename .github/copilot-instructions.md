# US BSL Database - AI Coding Assistant Guide

This project is a comprehensive breed-specific legislation (BSL) tracking application for the United States. It uses TypeScript, React, Vite, and Supabase as the main technologies.

## Core Architecture

### Authentication Flow

- Authentication is managed via Supabase Auth
- All auth-related logic is centralized in `/src/contexts/AuthContext.tsx`
- Protected routes require authenticated user state via `<ProtectedRoute>` component
- Auth state and methods accessible via `useAuth` hook

Example auth integration:

```typescript
const { user, signIn, signOut } = useAuth();
if (!user) {
  navigate("/auth?redirect=" + currentPath);
}
```

### Data Flow

1. User authentication via Supabase Auth
2. Role-based access control via `user_roles` table
3. Secure data operations through Row Level Security (RLS)
4. Community submissions workflow with admin review process

### Key Patterns

#### Custom Hooks

- Business logic is encapsulated in hooks under `/src/hooks/`
- Data fetching hooks follow naming pattern `use[Entity][Action]`
- All hooks that require auth should check user state first
- Example: `useUserSubmissions`, `useUserPreferences`, `useAdminUsersSecure`

#### Component Organization

- Feature-based structure in `/src/components/`
- Reusable UI components in `/src/components/ui/`
- Pages in `/src/pages/` correspond to routes in `App.tsx`
- Admin components isolated in `/src/components/admin/`

#### State Management

- Auth state via AuthContext
- User preferences via dedicated hooks
- Form state with React Hook Form
- API state with React Query

#### Security Patterns

- Admin routes verify role via `useUserRole` hook
- Sensitive operations use RLS policies in Supabase
- Document uploads require authenticated sessions
- Admin operations audit logged

## Common Tasks

### Adding New Features

1. Create component in appropriate feature directory
2. Add route to `App.tsx` if needed
3. Implement data hooks if required
4. Update RLS policies in `supabase/migrations/`

### Working with User Data

- Always check auth state with `useAuth`
- Use `useUserRole` for role-based features
- Follow existing patterns in `useUserSubmissions` for data fetching

### Database Changes

- Add migrations in `supabase/migrations/`
- Include RLS policies for new tables
- Update TypeScript types in `/src/types/`

### Admin Features

- Place in `/src/components/admin/`
- Use `useAdminUsersSecure` patterns for admin-only data access
- Include audit logging for sensitive operations

## Key Files

- `App.tsx` - Main routing and providers
- `AuthContext.tsx` - Authentication logic
- `useUserRole.ts` - Role management
- `ProtectedRoute.tsx` - Auth protection component
