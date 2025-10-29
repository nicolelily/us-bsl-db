import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  ExternalLink,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BreedLegislation } from '@/types';

interface ReportUpdateButtonProps {
  record: BreedLegislation;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ReportUpdateButton({ 
  record, 
  variant = 'outline', 
  size = 'sm',
  showLabel = true,
  className = ''
}: ReportUpdateButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReportUpdate = () => {
    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/submit?update=${record.id}`);
      return;
    }

    // Navigate to submission form with pre-filled data
    navigate(`/submit?update=${record.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'repealed': return 'text-red-600';
      case 'amended': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center space-x-1 ${className}`}
      >
        <Edit className="h-3 w-3" />
        {showLabel && <span>Report Update</span>}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Report Update for Legislation</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Record Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Current Record</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Location:</span>
                  <span>{record.municipality}, {record.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline">{record.municipalityType || 'City'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Legislation:</span>
                  <Badge 
                    variant={record.legislationType === 'ban' ? 'destructive' : 'secondary'}
                    className={record.legislationType === 'restriction' 
                      ? 'bg-[#74CFC5] text-white hover:bg-[#5fb8ad]' 
                      : record.legislationType === 'unverified'
                        ? 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                        : ''
                    }
                  >
                    {record.legislationType || 'Ban'}
                  </Badge>
                </div>
                {record.bannedBreeds && record.bannedBreeds.length > 0 && (
                  <div>
                    <span className="font-medium">Banned Breeds:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {record.bannedBreeds.slice(0, 5).map((breed) => (
                        <Badge key={breed} variant="secondary" className="text-xs">
                          {breed}
                        </Badge>
                      ))}
                      {record.bannedBreeds.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{record.bannedBreeds.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                {record.lastUpdated && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Updated:</span>
                    <span>{formatDate(record.lastUpdated)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Types */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">What type of update would you like to report?</h3>
              
              <div className="grid gap-3">
                <Alert className="border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Legislation Changed:</strong> The ordinance has been amended, repealed, or modified
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Information Update:</strong> Incorrect details, missing breeds, or outdated information
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50 cursor-pointer hover:bg-green-100 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Additional Sources:</strong> New documents, URLs, or verification information
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Authentication Notice */}
            {!user && (
              <Alert className="border-blue-200 bg-blue-50">
                <User className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Sign in required:</strong> You'll need to create an account or sign in to submit updates. 
                  This helps us track contributions and maintain data quality.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                {record.ordinanceUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(record.ordinanceUrl, '_blank')}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Current Ordinance</span>
                  </Button>
                )}
                
                <Button
                  onClick={handleReportUpdate}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>{user ? 'Report Update' : 'Sign In & Report'}</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}