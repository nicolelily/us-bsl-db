
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserWithRole } from '@/types/admin';
import { securityChecks, auditLog } from '@/utils/securityUtils';

export const useAdminUsersSecure = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for admin panel with enhanced security...');
      setError(null);
      
      // Enhanced security checks
      if (!await securityChecks.hasValidSession()) {
        throw new Error('Invalid session');
      }
      
      // Rate limiting check
      if (!securityChecks.checkRateLimiting('admin_fetch_users', 5, 60000)) {
        throw new Error('Rate limit exceeded');
      }
      
      // Audit log the action
      await auditLog.logAction('admin_fetch_users_attempt');
      
      // First check if user has admin role by trying to access user_roles table
      const { data: roleCheck, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin role:', roleError);
        throw new Error('Unable to verify admin privileges');
      }

      if (!roleCheck) {
        await auditLog.logAction('admin_access_denied', { reason: 'insufficient_privileges' });
        throw new Error('Insufficient privileges: Admin access required');
      }

      // Fetch profiles with enhanced RLS protection
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log(`Fetched ${profilesData?.length || 0} profiles`);

      // Fetch user roles with enhanced RLS protection
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      console.log(`Fetched ${rolesData?.length || 0} user roles`);

      // Combine the data securely
      const usersWithRoles: UserWithRole[] = (profilesData || []).map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      });

      console.log(`Combined data for ${usersWithRoles.length} users`);
      await auditLog.logAction('admin_fetch_users_success', { user_count: usersWithRoles.length });
      
      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      await auditLog.logAction('admin_fetch_users_error', { error: error.message });
      setError(error);
      
      // Only show toast for unexpected errors, not RLS/permission errors
      if (!error.message?.includes('privilege') && 
          !error.message?.includes('permission') &&
          !error.message?.includes('Rate limit')) {
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      console.log(`Updating user ${userId} role to ${newRole} with enhanced security`);
      setError(null);
      
      // Enhanced security checks
      if (!await securityChecks.hasValidSession()) {
        throw new Error('Invalid session');
      }
      
      // Rate limiting check
      if (!securityChecks.checkRateLimiting('admin_update_role', 3, 60000)) {
        throw new Error('Rate limit exceeded');
      }
      
      // Audit log the action
      await auditLog.logAction('admin_update_user_role_attempt', { 
        target_user_id: userId, 
        new_role: newRole 
      });
      
      // Check if user already has a role entry
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing role:', checkError);
        throw checkError;
      }

      let updateError;
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        updateError = error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating user role:', updateError);
        throw updateError;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      console.log(`Successfully updated user ${userId} role to ${newRole}`);
      await auditLog.logAction('admin_update_user_role_success', { 
        target_user_id: userId, 
        new_role: newRole 
      });
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      await auditLog.logAction('admin_update_user_role_error', { 
        target_user_id: userId, 
        new_role: newRole,
        error: error.message 
      });
      setError(error);
      
      let errorMessage = "Failed to update user role.";
      
      if (error.message?.includes('Rate limit')) {
        errorMessage = "Too many requests. Please wait before trying again.";
      } else if (error.message?.includes('privilege') || error.message?.includes('permission')) {
        errorMessage = "Insufficient permissions to update user roles.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, updateUserRole, refetchUsers: fetchUsers };
};
