import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import SubmissionWizard from '../components/submissions/SubmissionWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { SubmissionFormData } from '@/types/submissions';
import { useAuth } from '@/contexts/AuthContext';

const Submit: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/submit');
    }
  }, [user, navigate]);

  const handleSubmissionComplete = async (data: SubmissionFormData) => {
    try {
      // TODO: Implement actual submission to Supabase
      console.log('Submitting data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock submission ID
      const mockId = 'sub_' + Math.random().toString(36).substr(2, 9);
      setSubmissionId(mockId);
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      // TODO: Handle submission error
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-dogdata-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-dogdata-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">
                  Submission Successful!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Thank you for contributing to the BSL Database. Your submission has been received
                  and will be reviewed by our moderation team.
                </p>
                
                {submissionId && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium">Submission ID</p>
                    <p className="font-mono text-lg">{submissionId}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Save this ID to track your submission status
                    </p>
                  </div>
                )}
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 You'll receive an email confirmation shortly</p>
                  <p>⏱️ Review typically takes 1-3 business days</p>
                  <p>📊 Check your profile for submission status updates</p>
                </div>
                
                <div className="flex justify-center space-x-4 pt-4">
                  <Button onClick={() => navigate('/')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Database
                  </Button>
                  <Button onClick={() => navigate('/profile')}>
                    View My Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <SubmissionWizard
          onComplete={handleSubmissionComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default Submit;