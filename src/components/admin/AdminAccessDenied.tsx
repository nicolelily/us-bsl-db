
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AdminAccessDenied: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need administrator privileges to access this panel.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAccessDenied;
