
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminUsersSecure } from '@/hooks/useAdminUsersSecure';
import AdminStatsCards from './AdminStatsCards';
import UserManagementTable from './UserManagementTable';
import AdminAccessDenied from './AdminAccessDenied';
import AdminLoading from './AdminLoading';
import AdminErrorBoundary from './AdminErrorBoundary';

const AdminPanel = () => {
  const { hasRole, loading: roleLoading } = useUserRole();
  const { users, loading: usersLoading, error, updateUserRole, refetchUsers } = useAdminUsersSecure();

  if (roleLoading) {
    return <AdminLoading />;
  }

  if (!hasRole('admin')) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="space-y-6">
      <AdminErrorBoundary error={error} retry={refetchUsers}>
        <AdminStatsCards users={users} />
        <UserManagementTable 
          users={users} 
          loading={usersLoading} 
          onUpdateUserRole={updateUserRole} 
        />
      </AdminErrorBoundary>
    </div>
  );
};

export default AdminPanel;
