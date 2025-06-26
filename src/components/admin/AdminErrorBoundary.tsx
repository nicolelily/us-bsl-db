
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  error?: any;
  retry?: () => void;
}

const AdminErrorBoundary: React.FC<AdminErrorBoundaryProps> = ({ 
  children, 
  error, 
  retry 
}) => {
  if (error) {
    const isRLSError = error.message?.includes('row-level security') ||
                      error.message?.includes('permission denied') ||
                      error.code === 'PGRST116' || 
                      error.code === '42501';

    if (isRLSError) {
      return (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex flex-col gap-2">
              <p>Access restricted: You don't have sufficient permissions to view this data.</p>
              <p className="text-sm">Please ensure you have the required administrative privileges.</p>
              {retry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retry}
                  className="w-fit"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex flex-col gap-2">
            <p>An error occurred: {error.message}</p>
            {retry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retry}
                className="w-fit"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AdminErrorBoundary;
