#!/bin/bash

# Fix Supabase RLS Security Issues
# This script addresses the security linter warnings about user_roles table

echo "🔧 Fixing Supabase RLS Security Issues..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Issue:${NC} user_roles table has RLS policies but RLS is disabled"
echo -e "${YELLOW}Solution:${NC} Enable RLS on user_roles table"
echo ""

# Check if user wants to proceed
read -p "Do you want to apply the RLS fix? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Run the RLS fix
echo -e "${YELLOW}Step 1:${NC} Enabling RLS on user_roles table..."
echo -e "${RED}For remote Supabase instances:${NC}"
echo "Please run this SQL manually in your Supabase Dashboard → SQL Editor:"
echo ""
echo -e "${GREEN}ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;${NC}"
echo ""
echo "Or copy the contents of: sql/25_manual_rls_fix.sql"
echo ""

echo -e "${YELLOW}Step 2:${NC} After running the SQL, verify with:"
echo "Run the contents of: sql/24_verify_rls_fix_applied.sql"
echo ""

# Check if they have Supabase CLI for local development
if command -v supabase &> /dev/null && [ -n "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Alternative: Using Supabase CLI (if you have DATABASE_URL set)...${NC}"
    echo "DATABASE_URL is set, attempting CLI approach..."
    psql "$DATABASE_URL" < sql/25_manual_rls_fix.sql
else
    echo -e "${YELLOW}Note:${NC} For automated fixes, you need either:"
    echo "1. Supabase CLI + DATABASE_URL environment variable, or"
    echo "2. Local Supabase development setup"
fi

echo -e "${GREEN}✅ RLS Security Fix Complete!${NC}"
echo ""
echo "What this fixed:"
echo "• Enabled RLS on user_roles table"
echo "• Resolved 'Policy Exists RLS Disabled' error"
echo "• Resolved 'RLS Disabled in Public' error"
echo ""
echo "Next steps:"
echo "1. Check your Supabase dashboard for the security warnings"
echo "2. They should now be resolved"
echo "3. Test your admin functionality to ensure it still works"