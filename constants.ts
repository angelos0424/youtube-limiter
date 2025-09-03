import { UserSettings, UsageData, AnalyticsData } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyTimeLimit: 120,
  weeklyTimeLimit: 840,
  sessionTimeLimit: 45,
  dailyVideoLimit: 10,
  strictMode: false,
  whitelistedChannels: [
    'Fireship',
    'freeCodeCamp.org'
  ],
};

export const MOCK_USAGE_DATA: UsageData = {
  dailyTimeUsed: 75,
  weeklyTimeUsed: 560,
  videosWatched: 6,
  overridesUsed: 1,
};

export const MOCK_ANALYTICS_DATA: AnalyticsData[] = [
  { day: 'Mon', minutes: 90 },
  { day: 'Tue', minutes: 110 },
  { day: 'Wed', minutes: 75 },
  { day: 'Thu', minutes: 130 },
  { day: 'Fri', minutes: 150 },
  { day: 'Sat', minutes: 180 },
  { day: 'Sun', minutes: 60 },
];
