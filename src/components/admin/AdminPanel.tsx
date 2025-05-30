
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminStatsCards from './AdminStatsCards';
import UserManagementTable from './UserManagementTable';
import AdminAccessDenied from './AdminAccessDenied';
import AdminLoading from './AdminLoading';

const AdminPanel = () => {
  const { hasRole, loading: roleLoading } = useUserRole();
  const { users, loading: usersLoading, updateUserRole } = useAdminUsers();

  if (roleLoading) {
    return <AdminLoading />;
  }

  if (!hasRole('admin')) {
    return <AdminAccessDenied />;
  }

  return (
    <div className="space-y-6">
      <AdminStatsCards users={users} />
      <UserManagementTable 
        users={users} 
        loading={usersLoading} 
        onUpdateUserRole={updateUserRole} 
      />
    </div>
  );
};

export default AdminPanel;
