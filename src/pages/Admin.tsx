
import React from 'react';
import Navigation from '../components/Navigation';
import AdminPanel from '../components/admin/AdminPanel';
import SecurityMonitor from '../components/admin/SecurityMonitor';
import { NewsletterManager } from '../components/admin/NewsletterManager';
import ProtectedRoute from '../components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bsl-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-bsl-brown mb-4">Admin Panel</h1>
            <p className="text-bsl-brown mb-6">
              Manage users, roles, and system settings. Only administrators can access this panel.
            </p>
            
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="mt-6">
                <AdminPanel />
              </TabsContent>
              
              <TabsContent value="newsletter" className="mt-6">
                <NewsletterManager />
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <SecurityMonitor />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
