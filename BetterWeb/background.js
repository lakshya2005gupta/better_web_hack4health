chrome.runtime.onInstalled.addListener(() => {
  console.log("BetterWeb installed.");
  chrome.runtime.openOptionsPage();

  chrome.contextMenus.create({
    id:"speak",
    title: "🔊 Speak selected text",
    contexts: ["selection"]
  });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "speak" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "SPEAK_SELECTION",
      text: info.selectionText
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
      chrome.tabs.create({ url: "startup.html" });
    }
  });


  // Background script for handling AI Agent requests

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'runGeminiAgent') {
    // Execute the Python agent script
    runGeminiAgent(request.query, request.url)
      .then(result => {
        sendResponse({success: true, result: result});
      })
      .catch(error => {
        console.error('Agent error:', error);
        sendResponse({success: false, error: error.message});
      });
    
    // Keep the message channel open for async response
    return true;
  }
});

async function runGeminiAgent(query, url) {
  try {
    // Setup the connection to native application that runs Python
    const nativePort = chrome.runtime.connectNative('com.betterweb.gemini_agent');
    
    return new Promise((resolve, reject) => {
      // Send the query and URL to the native app
      nativePort.postMessage({
        query: query,
        url: url
      });
      
      // Handle response from native app
      nativePort.onMessage.addListener(function(response) {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
        nativePort.disconnect();
      });
      
      // Handle disconnect
      nativePort.onDisconnect.addListener(function() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        }
      });
    });
  } catch (error) {
    console.error('Failed to connect to agent:', error);
    throw error;
  }
}