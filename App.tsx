import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { UserSettings, UsageData } from './types';
import { useChromeStorage } from './hooks/useChromeStorage';
import { DEFAULT_SETTINGS, MOCK_USAGE_DATA, MOCK_ANALYTICS_DATA } from './constants';
import { AnalyticsChart } from './components/AnalyticsChart';
import { Card } from './components/common/Card';
import { LockIcon } from './components/icons/LockIcon';

const App: React.FC = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [settings, setSettings] = useChromeStorage<UserSettings>('userSettings', DEFAULT_SETTINGS);
  const [usageData, setUsageData] = useState<UsageData>(MOCK_USAGE_DATA);

  // Effect to apply dark mode class
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleAuth = () => {
    // This is a mock authentication flow.
    // In a real extension, this would trigger Google OAuth.
    setIsPremium(prev => !prev);
  };
  
  const handleSettingsChange = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
      <Header isPremium={isPremium} onAuth={handleAuth} />
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <Dashboard settings={settings} usageData={usageData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Settings 
              settings={settings} 
              onSettingsChange={handleSettingsChange}
              isPremium={isPremium} 
              onUpgrade={() => setIsPremium(true)}
            />
          </div>
          
          <div className="space-y-8">
            <Card>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <LockIcon className="w-5 h-5 mr-2 text-yellow-500" />
                Advanced Analytics
              </h2>
              {isPremium ? (
                 <AnalyticsChart data={MOCK_ANALYTICS_DATA} />
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4 text-gray-600 dark:text-gray-400">Unlock detailed viewing pattern analysis with Premium.</p>
                  <button onClick={handleAuth} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </Card>
            
            <Card>
               <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Emergency Override</h2>
               <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">Overrides Used Today</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You can use this 2 times per day.</p>
                  </div>
                  <div className="text-2xl font-bold text-brand-red">1 / 2</div>
               </div>
               <button 
                disabled={usageData.overridesUsed >= 2}
                className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-red-400 disabled:cursor-not-allowed dark:disabled:bg-red-800"
               >
                 Request 5-Min Extension
               </button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
