import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  XCircle,
  Plus
} from 'lucide-react';
import { useUserSubmissions } from '@/hooks/useUserSubmissions';
import SubmissionList from '@/components/submissions/SubmissionList';
import SubmissionDetail from '@/components/submissions/SubmissionDetail';

const UserSubmissions: React.FC = () => {
  const { submissions, isLoading, error, refetch, statusCounts } = useUserSubmissions();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleViewSubmission = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsEditing(false);
  };

  const handleEditSubmission = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsEditing(true);
  };

  const handleBackToList = () => {
    setSelectedSubmissionId(null);
    setIsEditing(false);
    refetch(); // Refresh the list in case of updates
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load submissions: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show submission detail view
  if (selectedSubmissionId) {
    return (
      <SubmissionDetail
        submissionId={selectedSubmissionId}
        onBack={handleBackToList}
        onEdit={handleEditSubmission}
        showEditButton={!isEditing}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Submissions</h2>
          <p className="text-muted-foreground">
            Track and manage your legislation submissions
          </p>
        </div>
        <Button onClick={() => window.location.href = '/submit'}>
          <Plus className="w-4 h-4 mr-2" />
          New Submission
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {submissions.length}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.approved}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.rejected}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't made any submissions yet
            </p>
            <Button onClick={() => window.location.href = '/submit'}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Submission
            </Button>
          </CardContent>
        </Card>
      ) : (
        <SubmissionList
          submissions={submissions}
          onViewSubmission={handleViewSubmission}
          onEditSubmission={handleEditSubmission}
        />
      )}
    </div>
  );
};



export default UserSubmissions;