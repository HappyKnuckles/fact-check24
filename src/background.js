// Enables the side panel on all websites
// chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
//   if (!tab.url) return;
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: 'side_panel/side_panel.html',
//     enabled: true,
//   });
// });
"use strict";

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

let offscreenReady = false;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'offscreen-ready') {
    offscreenReady = true;
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'capture-audio') return;

  const recording = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'is-recording', target: 'offscreen' },
      (response) => resolve(response?.recording === true)
    );
  });

  if (recording) {
    chrome.runtime.sendMessage({
      type: 'stop-capture',
      target: 'offscreen',
    });
  } else {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id,
    });

    const contexts = await chrome.runtime.getContexts({});
    const offscreenDoc = contexts.find(
      (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );
    if (!offscreenDoc) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording from chrome.tabCapture API',
      });

      await new Promise((resolve) => {
        const listener = (m) => {
          if (m.type === 'offscreen-ready') {
            chrome.runtime.onMessage.removeListener(listener);
            resolve();
          }
        };
        chrome.runtime.onMessage.addListener(listener);
      });
    }

    chrome.runtime.sendMessage({
      type: 'start-capture',
      target: 'offscreen',
      streamId,
    });
  }
});
