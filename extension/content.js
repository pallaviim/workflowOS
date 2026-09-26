// Privacy boundary: only coarse semantic actions are emitted. This script never records
// typed values, passwords, payment data, cookies, tokens, page HTML, or message bodies.
const supported = new Set(['PAGE_OPEN', 'SEARCH', 'FORM_SUBMIT', 'DOWNLOAD_FILE', 'OPEN_EMAIL']);
const domain = () => location.hostname;
const safeTitle = () => document.title.slice(0, 200);
function send(eventType, description) {
  if (!supported.has(eventType)) return;
  chrome.runtime.sendMessage({ type: 'WORKFLOWOS_EVENT', event: { eventType, timestamp: new Date().toISOString(), domain: domain(), pageTitle: safeTitle(), description, source: 'chrome-extension' } });
}
function emitPageOpen() { send('PAGE_OPEN', 'Opened page'); }
// If the popup is switched on after this content script injected, emit the current page.
// Gmail is a single-page app, so observing must not depend on a full browser reload.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.observing?.newValue === true) emitPageOpen();
});
let lastUrl = location.href;
const observeNavigation = () => {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  emitPageOpen();
};
const originalPushState = history.pushState;
history.pushState = function (...args) { const result = originalPushState.apply(this, args); queueMicrotask(observeNavigation); return result; };
const originalReplaceState = history.replaceState;
history.replaceState = function (...args) { const result = originalReplaceState.apply(this, args); queueMicrotask(observeNavigation); return result; };
addEventListener('popstate', observeNavigation);
chrome.storage.local.get({ observing: false }, ({ observing }) => { if (observing) emitPageOpen(); });
document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  // Form values are intentionally never inspected or sent.
  const looksLikeSearch = /search|query/i.test(form.action || '') || Boolean(form.querySelector('input[type="search"]'));
  send(looksLikeSearch ? 'SEARCH' : 'FORM_SUBMIT', looksLikeSearch ? 'Performed search' : 'Submitted form');
}, true);
document.addEventListener('click', event => {
  const anchor = event.target.closest('a');
  if (!anchor) return;
  const href = anchor.href || '';
  if (anchor.hasAttribute('download') || /\.(pdf|csv|xlsx?|docx?|zip)(?:$|[?#])/i.test(href)) send('DOWNLOAD_FILE', 'Downloaded file');
  if (/mail|inbox|message/i.test(href) || /mail|inbox|message/i.test(anchor.getAttribute('aria-label') || '')) send('OPEN_EMAIL', 'Opened email');
}, true);
