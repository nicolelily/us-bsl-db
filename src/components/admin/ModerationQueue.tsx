import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  FileText,
  User,
  Calendar,
  MapPin,
  Scale,
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Award
} from 'lucide-react';
import { useAdminModeration, ModerationSubmission } from '@/hooks/useAdminModeration';
import { SubmissionStatusTracker } from '@/components/submissions/SubmissionStatusTracker';

type SortField = 'created_at' | 'priority_score' | 'days_pending' | 'municipality';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'pending' | 'needs_changes';

// Helper functions
function getStatusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'needs_changes': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    default: return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending': return <Badge variant="secondary">Pending Review</Badge>;
    case 'needs_changes': return <Badge variant="outline">Needs Changes</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function getPriorityBadge(score: number) {
  if (score > 40) return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
  if (score > 20) return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
  return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ModerationQueue() {
  const {
    submissions,
    stats,
    isLoading,
    error,
    refetch,
    approveSubmission,
    rejectSubmission,
    bulkApprove,
    bulkReject,
    requestChanges
  } = useAdminModeration();

  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('priority_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  
  // Dialog states
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
  }>({ open: false, action: null });
  const [bulkFeedback, setBulkFeedback] = useState('');
  
  const [singleActionDialog, setSingleActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'changes' | null;
    submissionId: string | null;
  }>({ open: false, action: null, submissionId: null });
  const [singleFeedback, setSingleFeedback] = useState('');

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      // Status filter
      if (filterStatus !== 'all' && submission.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const data = submission.submitted_data;
        return (
          data.municipality?.toLowerCase().includes(searchLower) ||
          data.state?.toLowerCase().includes(searchLower) ||
          submission.submitter_name?.toLowerCase().includes(searchLower) ||
          data.banned_breeds?.some(breed => breed.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'priority_score':
          aValue = a.priority_score || 0;
          bValue = b.priority_score || 0;
          break;
        case 'days_pending':
          aValue = a.days_pending;
          bValue = b.days_pending;
          break;
        case 'municipality':
          aValue = `${a.submitted_data.municipality}, ${a.submitted_data.state}`;
          bValue = `${b.submitted_data.municipality}, ${b.submitted_data.state}`;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [submissions, filterStatus, searchTerm, sortField, sortDirection]);

  const handleSelectSubmission = (submissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(prev => [...prev, submissionId]);
    } else {
      setSelectedSubmissions(prev => prev.filter(id => id !== submissionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubmissions(filteredSubmissions.map(s => s.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedSubmissions.length === 0) return;

    if (action === 'approve') {
      await bulkApprove(selectedSubmissions, bulkFeedback || undefined);
    } else {
      if (!bulkFeedback.trim()) return;
      await bulkReject(selectedSubmissions, bulkFeedback);
    }

    setSelectedSubmissions([]);
    setBulkActionDialog({ open: false, action: null });
    setBulkFeedback('');
  };

  const handleSingleAction = async (action: 'approve' | 'reject' | 'changes') => {
    if (!singleActionDialog.submissionId) return;

    const submissionId = singleActionDialog.submissionId;

    switch (action) {
      case 'approve':
        await approveSubmission(submissionId, singleFeedback || undefined);
        break;
      case 'reject':
        if (!singleFeedback.trim()) return;
        await rejectSubmission(submissionId, singleFeedback);
        break;
      case 'changes':
        if (!singleFeedback.trim()) return;
        await requestChanges(submissionId, singleFeedback);
        break;
    }

    setSingleActionDialog({ open: false, action: null, submissionId: null });
    setSingleFeedback('');
  };



  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading moderation queue...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          Error loading moderation queue: {error}
          <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewed Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.total_reviewed_today}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.high_priority_count}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Showing</p>
                <p className="text-2xl font-bold text-blue-600">{filteredSubmissions.length}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Queue
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={refetch} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              {selectedSubmissions.length > 0 && (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkActionDialog({ open: true, action: 'approve' })}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bulk Approve ({selectedSubmissions.length})
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkActionDialog({ open: true, action: 'reject' })}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Bulk Reject ({selectedSubmissions.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Search by location, user, breeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Sort By</Label>
              <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority_score">Priority Score</SelectItem>
                  <SelectItem value="days_pending">Days Pending</SelectItem>
                  <SelectItem value="created_at">Submission Date</SelectItem>
                  <SelectItem value="municipality">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Direction</Label>
              <Select value={sortDirection} onValueChange={(value: SortDirection) => setSortDirection(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Select All Checkbox */}
          {filteredSubmissions.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
              <Checkbox
                id="select-all"
                checked={selectedSubmissions.length === filteredSubmissions.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">
                Select all {filteredSubmissions.length} submissions
              </Label>
            </div>
          )}

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No submissions match your current filters.</p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  isSelected={selectedSubmissions.includes(submission.id)}
                  isExpanded={expandedSubmission === submission.id}
                  onSelect={(checked) => handleSelectSubmission(submission.id, checked)}
                  onToggleExpanded={() => setExpandedSubmission(
                    expandedSubmission === submission.id ? null : submission.id
                  )}
                  onApprove={() => setSingleActionDialog({ 
                    open: true, 
                    action: 'approve', 
                    submissionId: submission.id 
                  })}
                  onReject={() => setSingleActionDialog({ 
                    open: true, 
                    action: 'reject', 
                    submissionId: submission.id 
                  })}
                  onRequestChanges={() => setSingleActionDialog({ 
                    open: true, 
                    action: 'changes', 
                    submissionId: submission.id 
                  })}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog 
        open={bulkActionDialog.open} 
        onOpenChange={(open) => setBulkActionDialog({ open, action: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionDialog.action === 'approve' 
                ? `Approve ${selectedSubmissions.length} Submissions` 
                : `Reject ${selectedSubmissions.length} Submissions`
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>
                {bulkActionDialog.action === 'approve' ? 'Approval Feedback (Optional)' : 'Rejection Reason (Required)'}
              </Label>
              <Textarea
                value={bulkFeedback}
                onChange={(e) => setBulkFeedback(e.target.value)}
                placeholder={
                  bulkActionDialog.action === 'approve' 
                    ? 'Optional feedback for approved submissions...'
                    : 'Please explain why these submissions are being rejected...'
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog({ open: false, action: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleBulkAction(bulkActionDialog.action!)}
              disabled={bulkActionDialog.action === 'reject' && !bulkFeedback.trim()}
            >
              {bulkActionDialog.action === 'approve' ? 'Approve All' : 'Reject All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Action Dialog */}
      <Dialog 
        open={singleActionDialog.open} 
        onOpenChange={(open) => setSingleActionDialog({ open, action: null, submissionId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {singleActionDialog.action === 'approve' && 'Approve Submission'}
              {singleActionDialog.action === 'reject' && 'Reject Submission'}
              {singleActionDialog.action === 'changes' && 'Request Changes'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>
                {singleActionDialog.action === 'approve' && 'Approval Feedback (Optional)'}
                {singleActionDialog.action === 'reject' && 'Rejection Reason (Required)'}
                {singleActionDialog.action === 'changes' && 'Changes Requested (Required)'}
              </Label>
              <Textarea
                value={singleFeedback}
                onChange={(e) => setSingleFeedback(e.target.value)}
                placeholder={
                  singleActionDialog.action === 'approve' 
                    ? 'Optional feedback for the approved submission...'
                    : 'Please explain what changes are needed or why this is being rejected...'
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSingleActionDialog({ open: false, action: null, submissionId: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleSingleAction(singleActionDialog.action!)}
              disabled={(singleActionDialog.action !== 'approve') && !singleFeedback.trim()}
            >
              {singleActionDialog.action === 'approve' && 'Approve'}
              {singleActionDialog.action === 'reject' && 'Reject'}
              {singleActionDialog.action === 'changes' && 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Submission Card Component
interface SubmissionCardProps {
  submission: ModerationSubmission;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (checked: boolean) => void;
  onToggleExpanded: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
}

function SubmissionCard({ 
  submission, 
  isSelected, 
  isExpanded, 
  onSelect, 
  onToggleExpanded,
  onApprove,
  onReject,
  onRequestChanges
}: SubmissionCardProps) {
  const data = submission.submitted_data;
  
  return (
    <Card className={`transition-colors ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {submission.status === 'pending' ? (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  )}
                  <h3 className="font-medium">
                    {data.municipality}, {data.state}
                  </h3>
                  {submission.type === 'update_existing' && (
                    <Badge variant="outline">Update</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {submission.priority_score && getPriorityBadge(submission.priority_score)}
                  {getStatusBadge(submission.status)}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{submission.submitter_name}</span>
                  {submission.submitter_reputation && submission.submitter_reputation > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Award className="h-2 w-2 mr-1" />
                      {submission.submitter_reputation}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(submission.created_at)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{submission.days_pending} days ago</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <Separator />
            
            {/* Legislation Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Legislation Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {data.legislation_type || 'ban'}
                  </div>
                  <div>
                    <span className="font-medium">Municipality Type:</span> {data.municipality_type}
                  </div>
                  {data.population && (
                    <div>
                      <span className="font-medium">Population:</span> {data.population.toLocaleString()}
                    </div>
                  )}
                  {data.ordinance && (
                    <div>
                      <span className="font-medium">Ordinance:</span>
                      <p className="mt-1 text-gray-600 text-xs">{data.ordinance}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Banned Breeds</h4>
                <div className="flex flex-wrap gap-1">
                  {data.banned_breeds?.slice(0, 6).map((breed, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {breed}
                    </Badge>
                  ))}
                  {data.banned_breeds && data.banned_breeds.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{data.banned_breeds.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sources */}
            {data.ordinance_url && (
              <div>
                <h4 className="font-medium mb-2">Sources</h4>
                <a 
                  href={data.ordinance_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex items-center space-x-1"
                >
                  <span>{data.ordinance_url}</span>
                  <Eye className="h-3 w-3" />
                </a>
              </div>
            )}
            
            {/* Documents */}
            {submission.documents && submission.documents.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Documents ({submission.documents.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {submission.documents.map((doc) => (
                    <Badge key={doc.id} variant="outline" className="text-xs">
                      <FileText className="h-2 w-2 mr-1" />
                      {doc.file_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Admin Feedback */}
            {submission.admin_feedback && (
              <div>
                <h4 className="font-medium mb-2">Previous Feedback</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {submission.admin_feedback}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <Separator />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={onRequestChanges}>
                <MessageSquare className="h-3 w-3 mr-1" />
                Request Changes
              </Button>
              <Button variant="outline" size="sm" onClick={onReject}>
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
              <Button size="sm" onClick={onApprove}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

