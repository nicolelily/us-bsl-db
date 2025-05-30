
import React from 'react';
import Navigation from '../components/Navigation';
import AdminPanel from '../components/admin/AdminPanel';
import ProtectedRoute from '../components/ProtectedRoute';

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
            <AdminPanel />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
