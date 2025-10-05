import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Mail, Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserContributions } from '@/hooks/useUserContributions';
import { useProfile } from '@/hooks/useProfile';

const UserProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { contributions, loading: contributionsLoading } = useUserContributions();
  const { profile, loading: profileLoading } = useProfile();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeVariant = (userRole: string | null) => {
    switch (userRole) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (userRole: string | null) => {
    if (userRole === 'admin' || userRole === 'moderator') {
      return <Shield className="w-3 h-3" />;
    }
    return <User className="w-3 h-3" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Profile Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-lg">
              {getInitials(profile?.full_name || user.user_metadata?.full_name || user.email || 'User')}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-dogdata-text">
                {profileLoading ? 'Loading...' : (profile?.full_name || user.user_metadata?.full_name || 'Anonymous User')}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center space-x-2">
              <Badge variant={getRoleBadgeVariant(role)} className="flex items-center space-x-1">
                {getRoleIcon(role)}
                <span className="capitalize">{role || 'user'}</span>
              </Badge>
              {role === 'admin' && (
                <span className="text-sm text-muted-foreground">
                  Full system access
                </span>
              )}
              {role === 'moderator' && (
                <span className="text-sm text-muted-foreground">
                  Can moderate submissions
                </span>
              )}
            </div>

            {/* Join Date */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Member since {formatDate(user.created_at)}</span>
            </div>
          </div>

          {/* Contribution Stats */}
          <div className="text-right space-y-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {contributionsLoading ? '...' : contributions?.submission_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {contributionsLoading ? '...' : contributions?.approved_count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            {contributions && contributions.reputation_score > 0 && (
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-600">
                  {contributions.reputation_score}
                </div>
                <div className="text-xs text-muted-foreground">Reputation</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;