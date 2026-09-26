const API_URL = 'http://localhost:3001/api/activity/event';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ observing: false }, state => chrome.storage.local.set(state));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'WORKFLOWOS_EVENT') return;
  chrome.storage.local.get({ observing: false }, async ({ observing }) => {
    if (!observing) return sendResponse({ sent: false, reason: 'observation_off' });
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message.event) });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      sendResponse({ sent: true, event: await response.json() });
    } catch (error) {
      // Do not queue or retain browser activity if the local backend is unavailable.
      sendResponse({ sent: false, reason: 'backend_unavailable', error: error.message });
    }
  });
  return true;
});
