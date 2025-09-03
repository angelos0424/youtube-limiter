import React from 'react';
import { UserSettings } from '../types';
import { Card } from './common/Card';
import { InputGroup } from './common/InputGroup';
import { ToggleSwitch } from './common/ToggleSwitch';
import { WhitelistManager } from './WhitelistManager';
import { LockIcon } from './icons/LockIcon';

interface SettingsProps {
  settings: UserSettings;
  onSettingsChange: (newSettings: Partial<UserSettings>) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, isPremium, onUpgrade }) => {
  
  const handleWhitelistChange = (newWhitelist: string[]) => {
    onSettingsChange({ whitelistedChannels: newWhitelist });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configuration</h2>
      <div className="space-y-8">
        {/* Free Features */}
        <section>
          <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Viewing Limits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup
              label="Daily Time Limit (minutes)"
              type="number"
              id="dailyTimeLimit"
              value={settings.dailyTimeLimit}
              onChange={(e) => onSettingsChange({ dailyTimeLimit: parseInt(e.target.value, 10) || 0 })}
            />
            <InputGroup
              label="Weekly Time Limit (minutes)"
              type="number"
              id="weeklyTimeLimit"
              value={settings.weeklyTimeLimit}
              onChange={(e) => onSettingsChange({ weeklyTimeLimit: parseInt(e.target.value, 10) || 0 })}
            />
            <InputGroup
              label="Session Limit (minutes)"
              type="number"
              id="sessionTimeLimit"
              value={settings.sessionTimeLimit}
              onChange={(e) => onSettingsChange({ sessionTimeLimit: parseInt(e.target.value, 10) || 0 })}
            />
            <InputGroup
              label="Daily Video Count Limit"
              type="number"
              id="dailyVideoLimit"
              value={settings.dailyVideoLimit}
              onChange={(e) => onSettingsChange({ dailyVideoLimit: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </section>

        {/* Premium Features */}
        <section className={`p-4 rounded-lg transition-all ${isPremium ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-gray-100 dark:bg-gray-800/50 relative'}`}>
          {!isPremium && (
            <div className="absolute inset-0 bg-gray-300/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
              <LockIcon className="w-12 h-12 text-yellow-500 mb-2" />
              <p className="font-semibold text-lg text-gray-700 dark:text-gray-200">Unlock Premium Features</p>
              <button onClick={onUpgrade} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Upgrade Now
              </button>
            </div>
          )}
          
          <div className={`${!isPremium ? 'blur-sm' : ''}`}>
            <h3 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 flex items-center text-indigo-800 dark:text-indigo-300">
                <LockIcon className="w-4 h-4 mr-2" /> Premium Settings
            </h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="strictMode" className="font-medium text-gray-700 dark:text-gray-300">Strict Blocking Mode</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Immediately block when limit is reached (no waiting for video to end).</p>
                    </div>
                    <ToggleSwitch
                        id="strictMode"
                        checked={settings.strictMode}
                        onChange={(e) => onSettingsChange({ strictMode: e.target.checked })}
                        disabled={!isPremium}
                    />
                </div>
                
                <WhitelistManager
                    whitelist={settings.whitelistedChannels}
                    onWhitelistChange={handleWhitelistChange}
                    disabled={!isPremium}
                />
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
};
