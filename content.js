let timeTrackingInterval = null;
let currentVideo = null;
let isWhitelisted = false;
let videoReported = false;

// Function to find the main video element on the page
function findVideoElement() {
    return document.querySelector('video.html5-main-video');
}

// Channel information extraction with fallback
const getChannelInfo = () => {
  const selectors = [
    '#owner-text a',
    '#channel-name',
    '.ytd-channel-name', 
    'yt-formatted-string[id*="channel"]',
    '.ytd-video-owner-renderer .ytd-channel-name',
    '[class*="channel-name"]'
  ];
  
  for (const selector of selectors) {
    const infoContainer = document.querySelector('#upload-info') || document.querySelector('ytd-video-owner-renderer');
    if (infoContainer) {
        const element = infoContainer.querySelector(selector);
        if (element?.textContent) {
          return element.textContent.trim();
        }
    }
    const element = document.querySelector(selector);
    if (element?.textContent) {
      return element.textContent.trim();
    }
  }
  return null;
};

async function startTracking() {
    if (timeTrackingInterval || !currentVideo || currentVideo.paused) return; // Already tracking or not ready

    const { userSettings } = await chrome.storage.sync.get('userSettings');
    const channelName = getChannelInfo();

    isWhitelisted = userSettings?.whitelistedChannels?.includes(channelName) || false;
    
    if (isWhitelisted) {
        console.log(`Channel "${channelName}" is whitelisted. Time not tracked.`);
        return;
    }
    
    if (!videoReported) {
        chrome.runtime.sendMessage({ type: 'videoWatched' });
        videoReported = true;
    }

    // Start sending time updates every 5 seconds
    timeTrackingInterval = setInterval(() => {
        if (currentVideo && !currentVideo.paused) {
          chrome.runtime.sendMessage({ type: 'timeUpdate', seconds: 5 });
        }
    }, 5000);
}

function stopTracking() {
    if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
        timeTrackingInterval = null;
    }
}

function setupVideoListeners(video) {
    if (video.dataset.listenerAttached) return;

    currentVideo = video;
    video.addEventListener('play', startTracking);
    video.addEventListener('pause', stopTracking);
    video.addEventListener('ended', () => {
      stopTracking();
      videoReported = false; // Reset for next video
    });
    // For SPA navigation on YouTube, reset when src changes
    new MutationObserver(() => {
        stopTracking();
        videoReported = false;
        if (!video.paused) {
            startTracking();
        }
    }).observe(video, { attributeFilter: ['src'] });

    video.dataset.listenerAttached = 'true';
}

function blockPage(reason) {
    const blockUrl = chrome.runtime.getURL('block.html') + `?reason=${encodeURIComponent(reason)}`;
    window.location.href = blockUrl;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'block') {
        if (request.strict) {
            stopTracking();
            blockPage(request.reason);
        } else {
            if (currentVideo && !currentVideo.paused) {
                 currentVideo.addEventListener('ended', () => blockPage(request.reason), { once: true });
            } else {
                 blockPage(request.reason);
            }
        }
    }
});

// Main logic to observe for video elements and page navigation
const observer = new MutationObserver(() => {
    const video = findVideoElement();
    if (video && !video.dataset.listenerAttached) {
        setupVideoListeners(video);
    }
    if (window.location.href.includes('watch?v=')) {
        if (currentVideo && currentVideo.paused) {
            videoReported = false;
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial check
const initialVideo = findVideoElement();
if (initialVideo) {
    setupVideoListeners(initialVideo);
}
