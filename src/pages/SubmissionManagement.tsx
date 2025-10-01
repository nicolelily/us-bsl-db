import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSubmissions } from '@/hooks/useUserSubmissions';
import SubmissionList from '@/components/submissions/SubmissionList';
import SubmissionDetail from '@/components/submissions/SubmissionDetail';
import Navigation from '@/components/Navigation';
import TestSubmissionData from '@/components/TestSubmissionData';

const SubmissionManagement: React.FC = () => {
  const { submissionId } = useParams<{ submissionId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submissions, isLoading, error, refetch } = useUserSubmissions();
  
  // Check if we're in edit mode based on URL
  const isEditing = window.location.pathname.includes('/edit');

  const handleViewSubmission = (id: string) => {
    navigate(`/submissions/${id}`);
  };

  const handleEditSubmission = (id: string) => {
    navigate(`/submissions/${id}/edit`);
  };

  const handleBackToList = () => {
    navigate('/submissions');
    refetch();
  };

  // Redirect to auth if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to view your submissions.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load submissions: {error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {submissionId ? (
          <SubmissionDetail
            submissionId={submissionId}
            onBack={handleBackToList}
            onEdit={handleEditSubmission}
            showEditButton={!isEditing}
            isEditing={isEditing}
          />
        ) : (
          <div className="space-y-6">
            {/* Test Data Component (Development Only) */}
            <TestSubmissionData />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Submissions</h1>
                <p className="text-muted-foreground">
                  Track and manage your legislation submissions
                </p>
              </div>
              <Button onClick={() => navigate('/submit')}>
                New Submission
              </Button>
            </div>

            {/* Submissions List */}
            <SubmissionList
              submissions={submissions}
              onViewSubmission={handleViewSubmission}
              onEditSubmission={handleEditSubmission}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionManagement;