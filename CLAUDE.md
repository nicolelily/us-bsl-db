# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React/TypeScript web application built with Vite that manages breed-specific legislation (BSL) data. The application uses Supabase as its backend database and implements comprehensive Row Level Security (RLS) policies.

## Common Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (runs on port 8080)
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** with tailwindcss-animate for styling
- **React Router DOM** for client-side routing
- **React Hook Form** with Zod validation for forms
- **Recharts** for data visualization
- **React Query** (@tanstack/react-query) for server state management

### Backend Integration
- **Supabase** with comprehensive Row Level Security (RLS)
- **Supabase Auth** for authentication with custom React context
- Database migrations in `supabase/migrations/`
- Audit logging system for security monitoring

### Key Directories
- `src/components/ui/` - shadcn/ui components (accordion, button, form, etc.)
- `src/components/admin/` - Admin panel components with security controls
- `src/contexts/` - React contexts, primarily AuthContext for auth state
- `src/hooks/` - Custom React hooks including security-focused hooks
- `src/integrations/supabase/` - Supabase client configuration and TypeScript types
- `src/utils/` - Utility functions including securityUtils.ts for validation
- `src/pages/` - Route-based page components
- `supabase/migrations/` - Database schema migrations with RLS policies

### Security Architecture
- Comprehensive RLS policies implemented across all database tables
- Role-based access control with admin/user roles
- Input validation and sanitization utilities in `securityUtils.ts`
- Protected routes and admin-only components
- Audit logging for all database operations
- Session validation and authentication state management

### Development Integration
- Built for **Lovable** visual development platform
- Uses `lovable-tagger` plugin for component tagging in development
- Integrates with Lovable project at https://lovable.dev/projects/6f2f5e9e-b252-421a-a579-dd9893797bcc
- Changes made via Lovable are automatically committed to the repository

## Database Schema
The application manages breed-specific legislation data with the following core tables:
- `breed_legislation` - Main BSL data (public read access)
- `profiles` - User profile information
- `user_roles` - Role-based access control
- `contact_submissions` - Contact form submissions
- `audit_logs` - Security audit trail

All tables implement RLS policies for data protection and proper access control.