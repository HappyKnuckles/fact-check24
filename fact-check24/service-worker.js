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
  const existingContexts = await chrome.runtime.getContexts({});
  console.log("Vorhandene Kontexte:", existingContexts);
  // Aktiven Tab ermitteln
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Stream-ID im Service Worker anfordern
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  console.log("Stream-ID erhalten:", streamId);

  // Offscreen-Dokument erstellen, falls nicht vorhanden
  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );
  console.log("Offscreen-Dokument vorhanden:", offscreenDocument);
   if (!offscreenDocument) {
     // Create an offscreen document.
     await chrome.offscreen.createDocument({
       url: 'offscreen.html',
       reasons: ['USER_MEDIA'],
       justification: 'Recording from chrome.tabCapture API',
     });
   } 


  // Stream-ID an das Offscreen-Dokument senden
  console.log("Stream-ID an Offscreen-Dokument senden:", streamId);
  chrome.runtime.sendMessage({ type: "start-capture", target: 'offscreen', streamId });
});

