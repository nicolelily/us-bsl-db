import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Eye,
  MessageSquare,
  Calendar
} from 'lucide-react';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'needs_changes';

interface SubmissionStatusTrackerProps {
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminFeedback?: string;
  showProgress?: boolean;
  className?: string;
}

const SubmissionStatusTracker: React.FC<SubmissionStatusTrackerProps> = ({
  status,
  submittedAt,
  reviewedAt,
  adminFeedback,
  showProgress = true,
  className = ''
}) => {
  const getStatusConfig = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeVariant: 'secondary' as const,
          title: 'Under Review',
          description: 'Your submission is being reviewed by our team',
          progress: 50
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'default' as const,
          title: 'Approved',
          description: 'Your submission has been approved and added to the database',
          progress: 100
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          title: 'Rejected',
          description: 'Your submission was not approved',
          progress: 100
        };
      case 'needs_changes':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          badgeVariant: 'outline' as const,
          title: 'Changes Requested',
          description: 'Please review the feedback and update your submission',
          progress: 75
        };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeElapsed = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return 'Less than an hour';
    }
  };

  return (
    <Card className={`${config.borderColor} ${className}`}>
      <CardHeader className={`${config.bgColor} rounded-t-lg`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-6 h-6 ${config.color}`} />
            <span className={config.color}>{config.title}</span>
          </div>
          <Badge variant={config.badgeVariant} className="capitalize">
            {status.replace('_', ' ')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Description */}
          <p className="text-muted-foreground">{config.description}</p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{config.progress}%</span>
              </div>
              <Progress value={config.progress} className="h-2" />
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Submitted</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(submittedAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getTimeElapsed(submittedAt, reviewedAt)} ago
                </p>
              </div>
            </div>

            {reviewedAt && (
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${config.color.replace('text-', 'bg-')}`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Reviewed</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(reviewedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review completed in {getTimeElapsed(submittedAt, reviewedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Feedback */}
          {adminFeedback && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Admin Feedback</span>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{adminFeedback}</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Next Steps</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              {status === 'pending' && (
                <>
                  <p>• Your submission is in the review queue</p>
                  <p>• You'll receive an email when the review is complete</p>
                  <p>• Average review time is 2-3 business days</p>
                </>
              )}
              {status === 'approved' && (
                <>
                  <p>• Your legislation has been added to the public database</p>
                  <p>• Thank you for contributing to the community!</p>
                  <p>• You can submit more legislation anytime</p>
                </>
              )}
              {status === 'rejected' && (
                <>
                  <p>• Review the feedback above to understand why</p>
                  <p>• You can submit a new, corrected version</p>
                  <p>• Contact support if you have questions</p>
                </>
              )}
              {status === 'needs_changes' && (
                <>
                  <p>• Review the admin feedback carefully</p>
                  <p>• Edit your submission to address the concerns</p>
                  <p>• Resubmit for another review</p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionStatusTracker;