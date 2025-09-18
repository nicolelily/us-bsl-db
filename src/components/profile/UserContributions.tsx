import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { useUserContributions } from '@/hooks/useUserContributions';

export function UserContributions() {
  const { data: contributions, isLoading } = useUserContributions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const achievements = [
    {
      id: 'first_submission',
      title: 'First Contribution',
      description: 'Made your first submission',
      icon: Star,
      earned: contributions?.totalSubmissions > 0,
      progress: contributions?.totalSubmissions > 0 ? 100 : 0
    },
    {
      id: 'prolific_contributor',
      title: 'Prolific Contributor',
      description: 'Submit 10 approved records',
      icon: Trophy,
      earned: contributions?.approvedSubmissions >= 10,
      progress: Math.min((contributions?.approvedSubmissions || 0) / 10 * 100, 100)
    },
    {
      id: 'quality_contributor',
      title: 'Quality Contributor',
      description: 'Maintain 90% approval rate with 5+ submissions',
      icon: Target,
      earned: contributions?.totalSubmissions >= 5 && contributions?.approvalRate >= 0.9,
      progress: contributions?.totalSubmissions >= 5 ? (contributions?.approvalRate || 0) * 100 : 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Contribution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{contributions?.totalSubmissions || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{contributions?.approvedSubmissions || 0}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {contributions?.approvalRate ? `${Math.round(contributions.approvalRate * 100)}%` : '0%'}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className={`p-2 rounded-full ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-5 w-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{achievement.title}</h4>
                    {achievement.earned && <Badge variant="secondary">Earned</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {!achievement.earned && (
                    <div className="mt-2">
                      <Progress value={achievement.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{Math.round(achievement.progress)}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contributions?.recentActivity?.length > 0 ? (
              contributions.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded border-l-4 border-l-blue-500 bg-blue-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}