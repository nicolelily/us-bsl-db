import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function AdminDebug() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDebugInfo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Test the has_role function
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      // Get pending submissions count
      const { data: submissions, count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .in('status', ['pending', 'needs_changes']);

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile,
        roles,
        hasAdminRole,
        submissionsCount: count,
        sampleSubmission: submissions?.[0]
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testApproveFunction = async () => {
    if (!user || !debugInfo?.sampleSubmission) return;

    try {
      console.log('Testing approve_submission function...');
      const { data, error } = await supabase.rpc('approve_submission', {
        submission_id: debugInfo.sampleSubmission.id,
        admin_user_id: user.id
      });
      
      console.log('Approve test result:', { data, error });
      alert(`Test result: ${error ? 'ERROR: ' + error.message : 'SUCCESS: ' + JSON.stringify(data)}`);
    } catch (err) {
      console.error('Test error:', err);
      alert('Test failed: ' + err.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadDebugInfo();
    }
  }, [user]);

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={loadDebugInfo} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Debug Info'}
          </Button>
          
          {debugInfo?.sampleSubmission && (
            <Button onClick={testApproveFunction} variant="outline">
              Test Approve Function
            </Button>
          )}

          {debugInfo && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">User Info:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo.user, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Profile:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo.profile, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Roles:</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {JSON.stringify(debugInfo.roles, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium">Has Admin Role:</h3>
                <Badge variant={debugInfo.hasAdminRole ? 'default' : 'destructive'}>
                  {debugInfo.hasAdminRole ? 'YES' : 'NO'}
                </Badge>
              </div>

              <div>
                <h3 className="font-medium">Submissions Count:</h3>
                <Badge>{debugInfo.submissionsCount}</Badge>
              </div>

              {debugInfo.sampleSubmission && (
                <div>
                  <h3 className="font-medium">Sample Submission:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">
                    {JSON.stringify(debugInfo.sampleSubmission, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.error && (
                <div>
                  <h3 className="font-medium text-red-600">Error:</h3>
                  <p className="text-red-600">{debugInfo.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}