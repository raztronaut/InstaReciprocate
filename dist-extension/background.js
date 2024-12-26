chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("instagram.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['instagram-analytics.js']
    });
  } else {
    chrome.tabs.create({ url: "https://www.instagram.com/" });
  }
}); 