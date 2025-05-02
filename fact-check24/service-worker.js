// Enables the side panel on all websites
// chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
//   if (!tab.url) return;
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'side_panel/side_panel.html',
//     enabled: true,
//   });
// });

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

  // service-worker.js

// service-worker.js

// Shortcut-Listener
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "capture-audio") return;

  // Aktiven Tab ermitteln
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Stream-ID im Service Worker anfordern
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  console.log("Stream-ID erhalten:", streamId);

  // Offscreen-Dokument erstellen, falls nicht vorhanden
 const offscreenUrl = chrome.runtime.getURL('offscreen.html');
 await chrome.offscreen.createDocument({
   url: offscreenUrl,
   reasons: [chrome.offscreen.Reason.USER_MEDIA],
   justification: 'Audio-Capture',
 });


  // Stream-ID an das Offscreen-Dokument senden
  console.log("Stream-ID an Offscreen-Dokument senden:", streamId);
  chrome.runtime.sendMessage({ type: "start-capture", streamId });
});

