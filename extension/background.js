/**
 * FILL Chrome Extension Background Service Worker
 * Handles tab communication and relays vault / memory state safely
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('FILL Extension installed. Ready to assist with semantic form completion.');
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ status: 'ok', version: '1.0.0' });
    return true;
  }
  return false;
});
