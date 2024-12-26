chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("instagram.com")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['insta-reciprocate.js']
    });
  } else {
    chrome.tabs.create({ url: "https://www.instagram.com/" });
  }
}); 