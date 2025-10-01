import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  MapPin,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { UserSubmission } from '@/hooks/useUserSubmissions';

type SortField = 'submittedAt' | 'status' | 'municipality' | 'legislationType';
type SortDirection = 'asc' | 'desc';

interface SubmissionListProps {
  submissions: UserSubmission[];
  onViewSubmission: (submissionId: string) => void;
  onEditSubmission?: (submissionId: string) => void;
  showActions?: boolean;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  onViewSubmission,
  onEditSubmission,
  showActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getStatusIcon = (status: UserSubmission['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'needs_changes': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: UserSubmission['status']) => {
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

  // Filter and sort submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (submission.breedRestrictions || []).some(breed => 
          breed.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const statusMatch = statusFilter === 'all' || submission.status === statusFilter;

      // Type filter
      const typeMatch = typeFilter === 'all' || submission.legislationType === typeFilter;

      return searchMatch && statusMatch && typeMatch;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'submittedAt':
          aValue = new Date(a.submittedAt).getTime();
          bValue = new Date(b.submittedAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'municipality':
          aValue = `${a.municipality}, ${a.state}`;
          bValue = `${b.municipality}, ${b.state}`;
          break;
        case 'legislationType':
          aValue = a.legislationType;
          bValue = b.legislationType;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  // Get unique legislation types for filter
  const legislationTypes = useMemo(() => {
    const types = new Set(submissions.map(s => s.legislationType));
    return Array.from(types);
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs_changes">Needs Changes</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {legislationTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
              const [field, direction] = value.split('-') as [SortField, SortDirection];
              setSortField(field);
              setSortDirection(direction);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submittedAt-desc">Newest First</SelectItem>
                <SelectItem value="submittedAt-asc">Oldest First</SelectItem>
                <SelectItem value="status-asc">Status A-Z</SelectItem>
                <SelectItem value="status-desc">Status Z-A</SelectItem>
                <SelectItem value="municipality-asc">Location A-Z</SelectItem>
                <SelectItem value="municipality-desc">Location Z-A</SelectItem>
                <SelectItem value="legislationType-asc">Type A-Z</SelectItem>
                <SelectItem value="legislationType-desc">Type Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAndSortedSubmissions.length} of {submissions.length} submissions
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredAndSortedSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {submissions.length === 0 
                  ? "No submissions found"
                  : "No submissions match your current filters"
                }
              </p>
              {submissions.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedSubmissions.map((submission) => (
            <SubmissionCard 
              key={submission.id} 
              submission={submission}
              onView={() => onViewSubmission(submission.id)}
              onEdit={onEditSubmission ? () => onEditSubmission(submission.id) : undefined}
              showActions={showActions}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Individual Submission Card Component
interface SubmissionCardProps {
  submission: UserSubmission;
  onView: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ 
  submission, 
  onView, 
  onEdit,
  showActions = true 
}) => {
  const getStatusIcon = (status: UserSubmission['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'needs_changes': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: UserSubmission['status']) => {
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
    <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-3">
              <Badge variant={getStatusVariant(submission.status)} className="flex items-center space-x-1">
                {getStatusIcon(submission.status)}
                <span className="capitalize">{submission.status.replace('_', ' ')}</span>
              </Badge>
              <Badge 
                variant="outline" 
                className={`capitalize ${submission.legislationType === 'restriction' ? 'bg-[#74CFC5] text-white border-[#74CFC5] hover:bg-[#5fb8ad]' : ''}`}
              >
                {submission.legislationType.replace('_', ' ')}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-medium text-lg cursor-pointer hover:text-primary" onClick={onView}>
              {submission.title}
            </h3>

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
          {showActions && (
            <div className="flex flex-col space-y-2">
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              {submission.status === 'pending' && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionList;