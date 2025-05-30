
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminStatsCards from './admin/AdminStatsCards';
import UserManagementTable from './admin/UserManagementTable';
import AdminAccessDenied from './admin/AdminAccessDenied';
import AdminLoading from './admin/AdminLoading';

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
