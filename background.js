// Default settings from constants.ts - must be kept in sync
const DEFAULT_SETTINGS = {
  dailyTimeLimit: 120,
  weeklyTimeLimit: 840,
  sessionTimeLimit: 45,
  dailyVideoLimit: 10,
  strictMode: false,
  whitelistedChannels: ['Fireship', 'freeCodeCamp.org'],
};

// Initialize storage on installation
chrome.runtime.onInstalled.addListener(async () => {
  const { userSettings } = await chrome.storage.sync.get('userSettings');
  if (!userSettings) {
    await chrome.storage.sync.set({ userSettings: DEFAULT_SETTINGS });
  }

  // Initialize usage data
  await chrome.storage.local.set({
    usageData: {
      dailyTimeUsed: 0,
      weeklyTimeUsed: 0,
      videosWatched: 0,
      overridesUsed: 0,
      lastDate: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
    }
  });

  // Create a periodic alarm to check for date changes
  chrome.alarms.create('dailyReset', { periodInMinutes: 60 });
});


// Open options page when action icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'timeUpdate') {
    handleTimeUpdate(request.seconds);
  } else if (request.type === 'videoWatched') {
    handleVideoWatched();
  } else if (request.type === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }
  return true; // Keep the message channel open for async response
});

async function checkAndResetUsage() {
    const { usageData } = await chrome.storage.local.get('usageData');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (usageData && todayStr !== usageData.lastDate) {
        usageData.dailyTimeUsed = 0;
        usageData.videosWatched = 0;
        usageData.overridesUsed = 0;
        
        // Reset weekly data if it's a new week (Monday is 1, Sunday is 0)
        if (today.getDay() === 1) { // It's Monday
             usageData.weeklyTimeUsed = 0;
        }

        usageData.lastDate = todayStr;
        await chrome.storage.local.set({ usageData });
    }
}


// Alarm for daily reset check
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await checkAndResetUsage();
  }
});

async function handleTimeUpdate(seconds) {
  await checkAndResetUsage();
  const { usageData } = await chrome.storage.local.get('usageData');
  
  usageData.dailyTimeUsed += seconds / 60; // convert to minutes
  usageData.weeklyTimeUsed += seconds / 60;

  await chrome.storage.local.set({ usageData });
  await checkLimits();
}

async function handleVideoWatched() {
    await checkAndResetUsage();
    const { usageData } = await chrome.storage.local.get('usageData');
    usageData.videosWatched += 1;
    await chrome.storage.local.set({ usageData });
    await checkLimits();
}

async function checkLimits() {
  const { userSettings } = await chrome.storage.sync.get('userSettings');
  const { usageData } = await chrome.storage.local.get('usageData');
  
  const settings = userSettings || DEFAULT_SETTINGS;

  const dailyTimeExceeded = usageData.dailyTimeUsed >= settings.dailyTimeLimit;
  const weeklyTimeExceeded = usageData.weeklyTimeUsed >= settings.weeklyTimeLimit;
  const videoCountExceeded = usageData.videosWatched >= settings.dailyVideoLimit;

  if (dailyTimeExceeded || weeklyTimeExceeded || videoCountExceeded) {
    const [tab] = await chrome.tabs.query({ active: true, url: "*://*.youtube.com/*" });
    if (tab && tab.id) {
        let blockReason = '';
        if (dailyTimeExceeded) blockReason = 'Daily time limit reached.';
        else if (weeklyTimeExceeded) blockReason = 'Weekly time limit reached.';
        else if (videoCountExceeded) blockReason = 'Daily video limit reached.';

        chrome.tabs.sendMessage(tab.id, {
            type: 'block',
            strict: settings.strictMode,
            reason: blockReason,
        });
    }
  }
}
