import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Users, 
  FileText, 
  Award,
  CheckCircle,
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

  // Note: Statistics removed until real community participation exists

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
                Comprehensive database of breed-specific legislation, ready for community contributions
              </p>
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
          <span>Help Build Our Community of Contributors</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-blue-800">
          This comprehensive database of breed-specific legislation was personally researched and curated. 
          Now we're ready to grow it with community contributions. Your submissions help promote transparency and awareness.
        </p>

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