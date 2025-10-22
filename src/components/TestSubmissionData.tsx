import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { createMultipleTestSubmissions } from '@/utils/testSubmissions';

const TestSubmissionData: React.FC = () => {
  const { user } = useAuth();

  // Only show in development environment
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleCreateTestData = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    try {
      await createMultipleTestSubmissions(user.id);
      alert('Test submissions created! Refresh the page to see them.');
    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data. Check console for details.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-6 border-dashed border-2 border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Development Testing</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 mb-4">
          Create sample submission data to test the submission management interface.
        </p>
        <Button onClick={handleCreateTestData} variant="outline" className="border-orange-300">
          Create Test Submissions
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestSubmissionData;