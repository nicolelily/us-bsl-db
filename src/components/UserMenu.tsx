

import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import DesktopOnlyModal from './DesktopOnlyModal';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { role, hasRole } = useUserRole();

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">{user.email}</span>
          {role && (
            <Badge 
              variant={
                role === 'admin' ? 'destructive' : 
                role === 'moderator' ? 'default' : 
                'secondary'
              }
              className="ml-1"
            >
              {role}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-muted-foreground">
            Role: {role || 'Loading...'}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Profile
          </Link>
        </DropdownMenuItem>
        {hasRole('admin') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2 hidden md:flex">
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              {/* On mobile, show an info trigger that opens a modal explaining admin is desktop-only */}
              <div className="md:hidden">
                <DesktopOnlyModal
                  title="Admin actions are desktop-only"
                  description={<>Admin tasks (approvals, edits) are supported on desktop to ensure accurate review and attachments. Please use a desktop browser to access the Admin Panel.</>}
                >
                  <button className="w-full text-left px-2 py-1">Admin Panel</button>
                </DesktopOnlyModal>
              </div>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
