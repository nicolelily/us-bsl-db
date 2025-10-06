
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminUsersSecure } from '@/hooks/useAdminUsersSecure';
import { useAdminModeration } from '@/hooks/useAdminModeration';
import { ModerationQueue } from './ModerationQueue';
import { AdminDebug } from './AdminDebug';
import AdminStatsCards from './AdminStatsCards';
import UserManagementTable from './UserManagementTable';
import SecurityMonitor from './SecurityMonitor';
import { NewsletterManager } from './NewsletterManager';
import AdminAccessDenied from './AdminAccessDenied';
import AdminLoading from './AdminLoading';
import AdminErrorBoundary from './AdminErrorBoundary';

const AdminPanel = () => {
  const { hasRole, loading: roleLoading } = useUserRole();
  const { users, loading: usersLoading, error, updateUserRole, refetchUsers } = useAdminUsersSecure();
  const { stats: moderationStats } = useAdminModeration();
  const [activeTab, setActiveTab] = useState('moderation');

  if (roleLoading) {
    return <AdminLoading />;
  }

  if (!hasRole('admin')) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="space-y-6">
      <AdminErrorBoundary error={error} retry={refetchUsers}>
        {/* Admin Panel Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dogdata-text mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage submissions, users, and platform settings
          </p>
        </div>

        {/* Main Admin Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="moderation" className="flex items-center space-x-2 relative">
              <FileText className="w-4 h-4" />
              <span>Moderation</span>
              {moderationStats.total_pending > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                >
                  {moderationStats.total_pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Communication</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Debug</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="mt-6">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <AdminStatsCards users={users} />
              <UserManagementTable 
                users={users} 
                loading={usersLoading} 
                onUpdateUserRole={updateUserRole} 
              />
            </div>
          </TabsContent>

          <TabsContent value="communication" className="mt-6">
            <NewsletterManager />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="debug" className="mt-6">
            <AdminDebug />
          </TabsContent>
        </Tabs>
      </AdminErrorBoundary>
    </div>
  );
};

export default AdminPanel;
