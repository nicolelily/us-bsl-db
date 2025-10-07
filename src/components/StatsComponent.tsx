
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreedLegislation } from '@/types';
import { HorizontalBarChart } from '@/components/ui/horizontal-bar-chart';

interface StatsComponentProps {
  data: BreedLegislation[];
}

const StatsComponent = ({ data }: StatsComponentProps) => {
  const breedStats = useMemo(() => {
    const breedCounts: Record<string, number> = {};

    data.forEach(item => {
      item.bannedBreeds.forEach(breed => {
        breedCounts[breed] = (breedCounts[breed] || 0) + 1;
      });
    });

    return Object.entries(breedCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const stateStats = useMemo(() => {
    const stateCounts: Record<string, number> = {};

    data.forEach(item => {
      stateCounts[item.state] = (stateCounts[item.state] || 0) + 1;
    });

    return Object.entries(stateCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const typeStats = useMemo(() => {
    const typeCounts: Record<string, number> = {
      City: 0,
      County: 0
    };

    data.forEach(item => {
      typeCounts[item.municipalityType] += 1;
    });

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const COLORS = ['#7DCBC4', '#5D2A1A', '#D2691E', '#B8E6E2', '#F5F1E8', '#F8FDFC'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Most Commonly Banned Breeds</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <HorizontalBarChart
            data={breedStats.slice(0, 5)}
            height={300}
            className="w-full"
            color="#7DCBC4"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Municipality Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {typeStats.map(({ name, value }) => {
            const percentage = (value / data.length * 100).toFixed(0);
            return (
              <div key={name} className="space-y-2">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{name}</span>
                  <span className="font-medium">{value} ({percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-bsl-teal" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComponent;
