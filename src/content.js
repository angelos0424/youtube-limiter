let timeTrackingInterval = null;
let currentVideo = null;
let isWhitelisted = false;
let videoReported = false;
let sessionWatchTimeSeconds = 0;

// ================================= //
// FLOATING WIDGET                   //
// ================================= //

function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'yuwc-widget';
    widget.className = 'yuwc-widget-container';
    widget.innerHTML = `
        <div class="yuwc-move-handle" data-position="top-left"></div>
        <div class="yuwc-move-handle" data-position="top-right"></div>
        <div class="yuwc-move-handle" data-position="bottom-left"></div>
        <div class="yuwc-move-handle" data-position="bottom-right"></div>
        <div class="yuwc-header">
            <span>Usage Control Center</span>
            <button id="yuwc-toggle-btn" title="Toggle Widget">-</button>
        </div>
        <div id="yuwc-content" class="yuwc-content">
            <div class="yuwc-stat-grid">
                <div class="yuwc-stat-item">
                    <span class="yuwc-label">Session Time</span>
                    <div class="yuwc-value-row">
                        <span id="yuwc-session-time">0m 0s</span>
                        <span class="yuwc-limit" id="yuwc-session-limit">/ 0m</span>
                    </div>
                </div>
                <div class="yuwc-stat-item">
                    <span class="yuwc-label">Daily Time</span>
                    <div class="yuwc-value-row">
                        <span id="yuwc-daily-time">0m</span>
                        <span class="yuwc-limit" id="yuwc-daily-limit">/ 0m</span>
                    </div>
                </div>
                 <div class="yuwc-stat-item">
                    <span class="yuwc-label">Videos Today</span>
                    <div class="yuwc-value-row">
                        <span id="yuwc-videos-watched">0</span>
                        <span class="yuwc-limit" id="yuwc-videos-limit">/ 0</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(widget);
    initializeWidgetState(widget);
    attachWidgetListeners(widget);
}


async function initializeWidgetState(widget) {
    const { widgetState } = await chrome.storage.local.get('widgetState');
    const position = widgetState?.position || 'bottom-right';
    const isCollapsed = widgetState?.isCollapsed || false;

    widget.classList.add(position);

    if (isCollapsed) {
        widget.classList.add('collapsed');
        document.getElementById('yuwc-content').style.display = 'none';
        document.getElementById('yuwc-toggle-btn').textContent = '+';
    }
}

function attachWidgetListeners(widget) {
    // Move handles
    widget.querySelectorAll('.yuwc-move-handle').forEach(handle => {
        handle.addEventListener('click', (e) => {
            const newPosition = e.target.dataset.position;
            const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            widget.classList.remove(...positions);
            widget.classList.add(newPosition);
            chrome.storage.local.set({ widgetState: { position: newPosition, isCollapsed: widget.classList.contains('collapsed') } });
        });
    });

    // Toggle button
    const toggleBtn = document.getElementById('yuwc-toggle-btn');
    const content = document.getElementById('yuwc-content');
    toggleBtn.addEventListener('click', () => {
        const isCollapsed = widget.classList.toggle('collapsed');
        content.style.display = isCollapsed ? 'none' : 'block';
        toggleBtn.textContent = isCollapsed ? '+' : '-';
        chrome.storage.local.get('widgetState', ({ widgetState }) => {
           chrome.storage.local.set({ widgetState: { ...widgetState, isCollapsed } });
        });
    });
}


function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
}

function formatMinutes(minutes) {
    return `${Math.floor(minutes)}m`;
}

async function updateWidgetUI() {
    const widget = document.getElementById('yuwc-widget');
    if (!widget) return;

    try {
        const { userSettings } = await chrome.storage.sync.get('userSettings');
        const { usageData } = await chrome.storage.local.get('usageData');

        // Session
        document.getElementById('yuwc-session-time').textContent = formatTime(sessionWatchTimeSeconds);
        document.getElementById('yuwc-session-limit').textContent = `/ ${formatMinutes(userSettings?.sessionTimeLimit || 0)}`;

        // Daily
        document.getElementById('yuwc-daily-time').textContent = formatMinutes(usageData?.dailyTimeUsed || 0);
        document.getElementById('yuwc-daily-limit').textContent = `/ ${formatMinutes(userSettings?.dailyTimeLimit || 0)}`;

        // Videos
        document.getElementById('yuwc-videos-watched').textContent = usageData?.videosWatched || 0;
        document.getElementById('yuwc-videos-limit').textContent = `/ ${userSettings?.dailyVideoLimit || 0}`;
    } catch (error) {
        console.error("Error updating widget UI:", error);
    }
}

// Listen for storage changes to keep widget up-to-date
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.userSettings || changes.usageData) {
        updateWidgetUI();
    }
});


// ================================= //
// TIME TRACKING & CORE LOGIC        //
// ================================= //


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
          sessionWatchTimeSeconds += 5;
          updateWidgetUI();
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
        sessionWatchTimeSeconds = 0; // Reset session time on new video
        updateWidgetUI();
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

// Initialize the widget on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
} else {
    createWidget();
}
// Initial UI update
setTimeout(updateWidgetUI, 500);
