// Enables the side panel on all websites
chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
  if (!tab.url) return;
  await chrome.sidePanel.setOptions({
    tabId,
    path: 'side_panel/side_panel.html',
    enabled: true,
  });
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
