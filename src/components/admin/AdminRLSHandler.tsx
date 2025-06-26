
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminRLSHandlerProps {
  children: React.ReactNode;
  error?: any;
  fallback?: React.ReactNode;
}

const AdminRLSHandler: React.FC<AdminRLSHandlerProps> = ({ 
  children, 
  error, 
  fallback 
}) => {
  // Check if the error is related to RLS policy violations
  const isRLSError = error && (
    error.message?.includes('row-level security') ||
    error.message?.includes('permission denied') ||
    error.code === 'PGRST116' || // PostgREST insufficient privilege
    error.code === '42501' // PostgreSQL insufficient privilege
  );

  if (isRLSError) {
    return fallback || (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Access restricted: You don't have sufficient permissions to view this data. 
          Please ensure you have the required administrative privileges.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          An error occurred while loading the data: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AdminRLSHandler;
