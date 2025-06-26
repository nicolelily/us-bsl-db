
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AdminAccessDenied = () => {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-bsl-brown mb-4">
          You don't have permission to access the admin panel. 
          Only administrators can view this page.
        </p>
        <p className="text-sm text-gray-600">
          If you believe this is an error, please contact a system administrator.
        </p>
      </CardContent>
    </Card>
  );
};

export default AdminAccessDenied;
