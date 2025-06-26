
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserWithRole } from '@/types/admin';

interface AdminStatsCardsProps {
  users: UserWithRole[];
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ users }) => {
  const totalUsers = users.length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const moderatorCount = users.filter(user => user.role === 'moderator').length;
  const regularUserCount = users.filter(user => user.role === 'user').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-bsl-teal">{totalUsers}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{adminCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Moderators</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">{moderatorCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Regular Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{regularUserCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;
