import React from 'react';
import { UserSettings, UsageData } from '../types';
import { Card } from './common/Card';

interface DashboardProps {
  settings: UserSettings;
  usageData: UsageData;
}

const ProgressBar: React.FC<{ value: number; max: number; label: string; unit: string; }> = ({ value, max, label, unit }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  let colorClass = 'bg-green-500';
  if (percentage > 80) colorClass = 'bg-yellow-500';
  if (percentage >= 100) colorClass = 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className={`${colorClass} h-4 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};


export const Dashboard: React.FC<DashboardProps> = ({ settings, usageData }) => {
  return (
    <Card>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Your Usage Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProgressBar 
                label="Today's Watch Time"
                value={usageData.dailyTimeUsed}
                max={settings.dailyTimeLimit}
                unit="mins"
            />
            <ProgressBar 
                label="This Week's Watch Time"
                value={usageData.weeklyTimeUsed}
                max={settings.weeklyTimeLimit}
                unit="mins"
            />
            <ProgressBar 
                label="Videos Watched Today"
                value={usageData.videosWatched}
                max={settings.dailyVideoLimit}
                unit="videos"
            />
        </div>
    </Card>
  );
};
