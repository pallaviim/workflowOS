const status = document.querySelector('#status'); const toggle = document.querySelector('#toggle'); const message = document.querySelector('#message');
function render(observing) { status.textContent = `Observation: ${observing ? 'ON' : 'OFF'}`; status.className = observing ? 'on' : 'off'; toggle.textContent = observing ? 'Stop Observation' : 'Start Observation'; }
chrome.storage.local.get({ observing: false }, ({ observing }) => render(observing));
toggle.addEventListener('click', () => chrome.storage.local.get({ observing: false }, ({ observing }) => { chrome.storage.local.set({ observing: !observing }, () => { render(!observing); message.textContent = !observing ? 'Semantic browser events will be sent to localhost.' : 'Observation stopped. No new events will be sent.'; }); }));
