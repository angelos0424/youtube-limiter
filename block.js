document.addEventListener('DOMContentLoaded', () => {
    // Get reason from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (reason) {
        const reasonElement = document.getElementById('reason');
        if(reasonElement) {
            reasonElement.textContent = reason;
        }
    }

    // Button to open the extension's options page
    const settingsButton = document.getElementById('open-settings');
    if(settingsButton) {
        settingsButton.addEventListener('click', () => {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage({ type: 'openOptionsPage' });
            }
        });
    }
});
