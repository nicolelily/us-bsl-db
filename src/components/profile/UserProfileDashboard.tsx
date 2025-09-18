import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, FileText, Award, Settings } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import UserSubmissions from './UserSubmissions';
import { UserContributions } from './UserContributions';
import { UserSettings } from './UserSettings';

const UserProfileDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-dogdata-text mb-2">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your submissions and track your contributions to the BSL Database
        </p>
      </div>

      {/* Profile Overview */}
      <UserProfileCard />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>My Submissions</span>
          </TabsTrigger>
          <TabsTrigger value="contributions" className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Contributions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-6">
          <UserSubmissions />
        </TabsContent>

        <TabsContent value="contributions" className="mt-6">
          <UserContributions />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <UserSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfileDashboard;