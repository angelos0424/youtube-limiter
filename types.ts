export interface UserSettings {
  dailyTimeLimit: number; // in minutes
  weeklyTimeLimit: number; // in minutes
  sessionTimeLimit: number; // in minutes
  dailyVideoLimit: number;
  strictMode: boolean;
  whitelistedChannels: string[];
}

export interface UsageData {
  dailyTimeUsed: number; // in minutes
  weeklyTimeUsed: number; // in minutes
  videosWatched: number;
  overridesUsed: number;
}

export interface AnalyticsData {
  day: string;
  minutes: number;
}
