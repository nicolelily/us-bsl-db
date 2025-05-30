
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreedLegislation } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      typeCounts[item.type] += 1;
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={breedStats.slice(0, 5)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Number of Municipalities" fill="#7DCBC4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Municipality Type Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {typeStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsComponent;
