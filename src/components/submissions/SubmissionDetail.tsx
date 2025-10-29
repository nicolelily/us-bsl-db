import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Edit,
    Calendar,
    MapPin,
    User,
    ExternalLink,
    Download,
    ArrowLeft,
    Globe,
    Users,
    FileCheck,
    MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubmissionWithDetails, SubmissionDocument } from '@/types/submissions';
import SubmissionEditForm from './SubmissionEditForm';

interface SubmissionDetailProps {
    submissionId: string;
    onBack?: () => void;
    onEdit?: (submissionId: string) => void;
    showEditButton?: boolean;
    isEditing?: boolean;
}

const SubmissionDetail: React.FC<SubmissionDetailProps> = ({
    submissionId,
    onBack,
    onEdit,
    showEditButton = true,
    isEditing = false
}) => {
    const [submission, setSubmission] = useState<SubmissionWithDetails | null>(null);
    const [documents, setDocuments] = useState<SubmissionDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [submissionId]);

    const fetchSubmissionDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch submission with related data
            const { data: submissionData, error: submissionError } = await supabase
                .from('submissions' as any)
                .select(`
          *,
          user_profile:profiles!submissions_user_id_fkey (
            full_name,
            email
          ),
          reviewer_profile:profiles!submissions_reviewed_by_fkey (
            full_name,
            email
          )
        `)
                .eq('id', submissionId)
                .single();

            if (submissionError) throw submissionError;

            // Fetch documents
            const { data: documentsData, error: documentsError } = await supabase
                .from('submission_documents' as any)
                .select('*')
                .eq('submission_id', submissionId)
                .order('uploaded_at', { ascending: true });

            if (documentsError) throw documentsError;

            setSubmission(submissionData as unknown as SubmissionWithDetails);
            setDocuments((documentsData || []) as unknown as SubmissionDocument[]);
        } catch (err) {
            console.error('Error fetching submission details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch submission details');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5" />;
            case 'approved': return <CheckCircle className="w-5 h-5" />;
            case 'rejected': return <XCircle className="w-5 h-5" />;
            case 'needs_changes': return <AlertCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'approved': return 'default';
            case 'rejected': return 'destructive';
            case 'needs_changes': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600';
            case 'approved': return 'text-green-600';
            case 'rejected': return 'text-red-600';
            case 'needs_changes': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadDocument = async (document: SubmissionDocument) => {
        try {
            const { data, error } = await supabase.storage
                .from('submission-documents')
                .download(document.file_url);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.file_name;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading document:', err);
        }
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

    if (error || !submission) {
        return (
            <Card>
                <CardContent className="text-center py-8">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error || 'Submission not found'}</p>
                    {onBack && (
                        <Button onClick={onBack} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Show edit form if in editing mode
    if (isEditing) {
        return (
            <SubmissionEditForm
                submissionId={submissionId}
                onSave={() => {
                    fetchSubmissionDetails();
                    if (onBack) onBack();
                }}
                onCancel={onBack || (() => { })}
            />
        );
    }

    const submittedData = (submission.submitted_data as any) || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {onBack && (
                        <Button variant="outline" size="sm" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Submission Details</h1>
                        <p className="text-muted-foreground">ID: {submission.id}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Badge variant={getStatusVariant(submission.status)} className="flex items-center space-x-1">
                        {getStatusIcon(submission.status)}
                        <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                    </Badge>
                    {showEditButton && submission.status === 'pending' && onEdit && (
                        <Button onClick={() => onEdit(submission.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Submission
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Alert */}
            {submission.status === 'needs_changes' && submission.admin_feedback && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Changes Requested:</strong> {submission.admin_feedback}
                    </AlertDescription>
                </Alert>
            )}

            {submission.status === 'rejected' && submission.admin_feedback && (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Rejection Reason:</strong> {submission.admin_feedback}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5" />
                                <span>Legislation Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <p className="capitalize">{submission.type.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Legislation Type</label>
                                    <div className="mt-1">
                                        <Badge 
                                            variant={submittedData.legislation_type === 'ban' ? 'destructive' : 'secondary'}
                                            className={`capitalize ${submittedData.legislation_type === 'restriction' 
                                                ? 'bg-[#74CFC5] text-white hover:bg-[#5fb8ad]'
                                                : submittedData.legislation_type === 'unverified'
                                                    ? 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                                                    : ''
                                            }`}
                                        >
                                            {submittedData.legislation_type || 'Not specified'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {submittedData.municipality}, {submittedData.state}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {submittedData.municipality_type}
                                    </Badge>
                                </div>
                            </div>

                            {submittedData.population && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Population</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span>{submittedData.population.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Ordinance Title/Description</label>
                                <p className="mt-1">{submittedData.ordinance || 'Not provided'}</p>
                            </div>

                            {submittedData.banned_breeds && submittedData.banned_breeds.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Restricted Breeds</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {submittedData.banned_breeds.map((breed: string) => (
                                            <Badge key={breed} variant="secondary">
                                                {breed}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {submittedData.ordinance_url && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Source URL</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                        <a
                                            href={submittedData.ordinance_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center space-x-1"
                                        >
                                            <span>View Source</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {submittedData.verification_date && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Verification Date</label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <FileCheck className="w-4 h-4 text-muted-foreground" />
                                        <span>{formatDate(submittedData.verification_date)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    {documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Supporting Documents</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {documents.map((document) => (
                                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{document.file_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {document.file_type} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadDocument(document)}
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Feedback */}
                    {submission.admin_feedback && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>Admin Feedback</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted p-4 rounded-lg">
                                    <p>{submission.admin_feedback}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Timeline</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium">Submitted</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(submission.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {submission.reviewed_at && (
                                    <div className="flex items-start space-x-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(submission.status).replace('text-', 'bg-')}`}></div>
                                        <div>
                                            <p className="font-medium capitalize">
                                                {submission.status.replace('_', ' ')}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(submission.reviewed_at)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submission Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>Submission Info</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Submitted By</label>
                                <p className="mt-1">
                                    {submission.user_profile?.full_name || 'Anonymous User'}
                                </p>
                            </div>

                            {submission.reviewer_profile && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Reviewed By</label>
                                    <p className="mt-1">
                                        {submission.reviewer_profile.full_name || 'Admin User'}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="mt-1">{formatDate(submission.updated_at)}</p>
                            </div>

                            {documents.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Documents</label>
                                    <p className="mt-1">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SubmissionDetail;