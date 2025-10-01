import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  FileText, 
  Award, 
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ContributionPromptProps {
  variant?: 'default' | 'compact' | 'banner' | 'sidebar';
  showStats?: boolean;
  className?: string;
}

export function ContributionPrompt({ 
  variant = 'default', 
  showStats = true,
  className = ''
}: ContributionPromptProps) {
  const { user } = useAuth();

  // Mock stats - in production these would come from a hook
  const stats = {
    totalRecords: 2847,
    recentContributions: 23,
    activeContributors: 156,
    pendingReviews: 12
  };

  if (variant === 'compact') {
    return (
      <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Plus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Help Expand the Database</p>
                <p className="text-sm text-blue-700">Know of BSL in your area?</p>
              </div>
            </div>
            <Link to={user ? "/submit" : "/auth?redirect=/submit"}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Contribute
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Help Build the Most Comprehensive BSL Database</h2>
              <p className="text-blue-100 mb-4">
                Join {stats.activeContributors}+ contributors documenting breed-specific legislation across the US
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{stats.totalRecords.toLocaleString()} Records</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{stats.activeContributors} Contributors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{stats.recentContributions} This Month</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Link to={user ? "/submit" : "/auth?redirect=/submit"}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Contributing
                </Button>
              </Link>
              {!user && (
                <p className="text-xs text-blue-200 text-center">Free account required</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Contribute</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-green-700">
            Help keep our database accurate and up-to-date
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Report new legislation</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Update existing records</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Add supporting documents</span>
            </div>
          </div>

          <Link to={user ? "/submit" : "/auth?redirect=/submit"}>
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="h-3 w-3 mr-1" />
              Contribute Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-blue-900 flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <span>Join Our Community of Contributors</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-800">
          Help us build the most comprehensive database of breed-specific legislation in the United States. 
          Your contributions make a real difference in promoting transparency and awareness.
        </p>

        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.totalRecords.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.activeContributors}</div>
              <div className="text-xs text-blue-600">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.recentContributions}</div>
              <div className="text-xs text-blue-600">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{stats.pendingReviews}</div>
              <div className="text-xs text-blue-600">Pending Review</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-medium text-blue-900">How You Can Help:</h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">Report New Legislation</p>
                <p className="text-xs text-blue-700">Found BSL in your municipality? Add it to our database.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">Update Records</p>
                <p className="text-xs text-blue-700">Help keep existing information accurate and current.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={user ? "/submit" : "/auth?redirect=/submit"} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {user ? 'Start Contributing' : 'Sign Up & Contribute'}
            </Button>
          </Link>
          {user && (
            <Link to="/profile">
              <Button variant="outline" className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>My Contributions</span>
              </Button>
            </Link>
          )}
        </div>

        {!user && (
          <p className="text-xs text-blue-600 text-center">
            Creating an account is free and helps us maintain data quality
          </p>
        )}
      </CardContent>
    </Card>
  );
}