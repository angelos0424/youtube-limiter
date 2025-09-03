import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { InputGroup } from './common/InputGroup';
import { Button } from './common/Button';

interface WhitelistManagerProps {
  whitelist: string[];
  onWhitelistChange: (newWhitelist: string[]) => void;
  disabled: boolean;
}

export const WhitelistManager: React.FC<WhitelistManagerProps> = ({ whitelist, onWhitelistChange, disabled }) => {
  const [newChannel, setNewChannel] = useState('');

  const handleAddChannel = () => {
    if (newChannel.trim() && !whitelist.includes(newChannel.trim())) {
      onWhitelistChange([...whitelist, newChannel.trim()]);
      setNewChannel('');
    }
  };
  
  const handleRemoveChannel = (channelToRemove: string) => {
    onWhitelistChange(whitelist.filter(channel => channel !== channelToRemove));
  };

  return (
    <div>
      <h4 className="font-medium text-gray-700 dark:text-gray-300">Learning Channel Whitelist</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">These channels are exempt from time limits.</p>
      
      <div className="flex gap-2 mb-4">
        <div className="flex-grow">
          <InputGroup
            id="new-channel"
            type="text"
            placeholder="e.g., 'Khan Academy'"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            disabled={disabled}
            hideLabel={true}
          />
        </div>
        <Button onClick={handleAddChannel} disabled={disabled || !newChannel.trim()}>
          <PlusIcon className="w-5 h-5" />
          Add
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {whitelist.length > 0 ? whitelist.map(channel => (
          <div key={channel} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
            <span className="text-gray-800 dark:text-gray-200">{channel}</span>
            <button onClick={() => handleRemoveChannel(channel)} disabled={disabled} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )) : (
          <p className="text-center text-gray-500 dark:text-gray-400 p-4">No channels whitelisted.</p>
        )}
      </div>
    </div>
  );
};
