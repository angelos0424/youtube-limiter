import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '../types';

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} />
          <YAxis tick={{ fill: '#9CA3AF' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#374151', 
              borderColor: '#4B5563',
              borderRadius: '0.5rem'
            }} 
            labelStyle={{ color: '#F9FAFB' }}
          />
          <Legend />
          <Bar dataKey="minutes" fill="#4F46E5" name="Watch Time (mins)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
