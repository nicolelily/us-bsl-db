import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  MapPin
} from 'lucide-react';
import { useUserSubmissions, UserSubmission } from '@/hooks/useUserSubmissions';

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

const UserSubmissions: React.FC = () => {
  const { submissions, isLoading, error, refetch, statusCounts } = useUserSubmissions();
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'all'>('all');

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'needs_changes': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'needs_changes': return 'outline';
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'needs_changes': return 'text-orange-600';
    }
  };

  const filteredSubmissions = selectedStatus === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === selectedStatus);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  return (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Status Filter Tabs */}
          <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as SubmissionStatus | 'all')}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
              <TabsTrigger value="needs_changes">Needs Changes ({statusCounts.needs_changes})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus}>
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {selectedStatus === 'all' 
                      ? "You haven't made any submissions yet"
                      : `No ${selectedStatus.replace('_', ' ')} submissions`
                    }
                  </p>
                  <Button onClick={() => window.location.href = '/submit'}>
                    Create Your First Submission
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual Submission Card Component
const SubmissionCard: React.FC<{ submission: UserSubmission }> = ({ submission }) => {
  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'needs_changes': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'needs_changes': return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <Badge variant={getStatusVariant(submission.status)} className="flex items-center space-x-1">
                {getStatusIcon(submission.status)}
                <span className="capitalize">{submission.status.replace('_', ' ')}</span>
              </Badge>
              <Badge variant="outline" className="capitalize">
                {submission.legislationType.replace('_', ' ')}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-medium text-lg">{submission.title}</h3>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">
                {submission.municipality}, {submission.state}
              </span>
            </div>

            {/* Breeds */}
            {submission.breedRestrictions && submission.breedRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {submission.breedRestrictions.slice(0, 3).map((breed) => (
                  <Badge key={breed} variant="secondary" className="text-xs">
                    {breed}
                  </Badge>
                ))}
                {submission.breedRestrictions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{submission.breedRestrictions.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Document Count */}
            {submission.documentCount > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>{submission.documentCount} document{submission.documentCount !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Admin Feedback */}
            {submission.adminFeedback && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Admin Feedback:</p>
                <p className="text-sm text-muted-foreground">{submission.adminFeedback}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Submitted {formatDate(submission.submittedAt)}</span>
              </div>
              {submission.reviewedAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Reviewed {formatDate(submission.reviewedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            {submission.status === 'pending' && (
              <Button variant="outline" size="sm">
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSubmissions;