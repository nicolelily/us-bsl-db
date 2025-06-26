
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminUsersSecure } from '@/hooks/useAdminUsersSecure';
import AdminStatsCards from './AdminStatsCards';
import UserManagementTable from './UserManagementTable';
import AdminAccessDenied from './AdminAccessDenied';
import AdminLoading from './AdminLoading';
import AdminRLSHandler from './AdminRLSHandler';

const AdminPanel = () => {
  const { hasRole, loading: roleLoading } = useUserRole();
  const { users, loading: usersLoading, error, updateUserRole } = useAdminUsersSecure();

  if (roleLoading) {
    return <AdminLoading />;
  }

  if (!hasRole('admin')) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="space-y-6">
      <AdminRLSHandler error={error}>
        <AdminStatsCards users={users} />
        <UserManagementTable 
          users={users} 
          loading={usersLoading} 
          onUpdateUserRole={updateUserRole} 
        />
      </AdminRLSHandler>
    </div>
  );
};

export default AdminPanel;
