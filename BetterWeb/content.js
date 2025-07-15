// let userData = {};
// let originalFontSize = null;
// let currentFontSize = null;

// // Load user preferences and font size on initialization
// chrome.storage.local.get(["userData", "fontSize"], function (result) {
//   if (result.userData) {
//     console.log("Retrieved user preferences:", result.userData);
//     userData = result.userData;
//   }

//   if (result.fontSize) {
//     currentFontSize = result.fontSize;
//   }

//   checkAllUIChanges();
//   applySavedFontSize();
// });

// // Listen for changes in storage
// chrome.storage.onChanged.addListener(function (changes, namespace) {
//   if (changes.userData) {
//     console.log("User preferences updated:", changes.userData.newValue);
//     userData = changes.userData.newValue;
//     checkAllUIChanges();
//   }

//   if (changes.fontSize) {
//     currentFontSize = changes.fontSize.newValue;
//     applySavedFontSize();
//   }
// });

// function checkAllUIChanges() {
//   console.log("hello from checkAllUIChanges");

//   // Dark mode
//   if (
//     userData.visualDisabilitiesPreferences?.visualSnowDarkMode ||
//     userData.photosensitivityPreferences?.useDarkMode
//   ) {
//     applyDarkMode();
//   } else {
//     removeDarkMode();
//   }

//   // Font size
//   if (
//     userData.visualDisabilitiesPreferences?.lowVisionIncreaseFontSize ||
//     userData.visualDisabilitiesPreferences?.glaucomaMacularEnlargedText ||
//     userData.visualDisabilitiesPreferences?.presbyopiaIncreaseFontSize ||
//     userData.adhdPreferences?.largerFonts
//   ) {
//     console.log("font size increasing");
//     increaseFontSize();
//   } else {
//     resetFontSize();
//   }

//   // Dyslexia font
//   if (
//     userData.dyslexiaLearningPreferences?.dyslexiaOpenDyslexicFont ||
//     userData.dyslexiaLearningPreferences?.dysgraphiaClearFonts
//   ) {
//     applyDyslexiaFont();
//   } else {
//     removeDyslexiaFont();
//   }
// }

// function applySavedFontSize() {
//   if (currentFontSize) {
//     document.documentElement.style.fontSize = currentFontSize;
//   }
// }

// function applyDyslexiaFont() {
//   document.body.style.fontFamily = '"OpenDyslexic", Arial, sans-serif';
// }

// function removeDyslexiaFont() {
//   document.body.style.fontFamily = "";
// }

// function increaseFontSize() {
//   const root = document.documentElement;
//   let currentSize = window.getComputedStyle(root).fontSize;
//   let sizeValue = parseFloat(currentSize);
//   let sizeUnit = currentSize.replace(sizeValue, "").trim();

//   if (!originalFontSize) {
//     originalFontSize = currentSize;
//   }

//   const newSizeValue = sizeValue + 3;
//   root.style.fontSize = `${newSizeValue}${sizeUnit}`;

//   currentFontSize = `${newSizeValue}${sizeUnit}`;

//   // Save to chrome.storage
//   chrome.storage.local.set({ fontSize: currentFontSize });

//   console.log(`Font size increased to ${newSizeValue}${sizeUnit}`);
// }

// function resetFontSize() {
//   const root = document.documentElement;

//   if (originalFontSize) {
//     root.style.fontSize = originalFontSize;
//     currentFontSize = originalFontSize;
//     originalFontSize = null;
//   } else {
//     root.style.fontSize = "";
//     currentFontSize = null;
//   }

//   // Save to chrome.storage
//   chrome.storage.local.set({ fontSize: currentFontSize });

//   console.log("Font size reset");
// }

// function applyDarkMode() {
//   document.documentElement.style.backgroundColor = "#000";
//   document.documentElement.style.color = "#fff";
//   document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";

//   const media = document.querySelectorAll("img, picture, video, iframe");
//   media.forEach((el) => {
//     el.style.filter = "invert(1) hue-rotate(180deg)";
//   });
// }

// function speakHighlightedText(text = null) {
//   const selection = text || window.getSelection().toString().trim();
//   if (selection.length > 0) {
//     const utterance = new SpeechSynthesisUtterance(selection);
//     utterance.lang = "en-US";
//     utterance.rate = 1;
//     utterance.pitch = 1;
//     speechSynthesis.speak(utterance);
//   }
// }

// function removeDarkMode() {
//   document.body.style.backgroundColor = "";
//   document.body.style.color = "";
//   document.documentElement.style.filter = "";

//   const media = document.querySelectorAll("img, picture, video, iframe");
//   media.forEach((el) => {
//     el.style.filter = "";
//   });
// }

// // Speech synthesis function
// function speakModifiedSelection() {
//   // Implementation would go here
// }

// // Apply settings from chrome.storage
// function applySettings(settings) {
//   settings.dyslexiaFont ? applyDyslexiaFont() : removeDyslexiaFont();
// }

// // Listen for messages to apply fixes
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "SPEAK_SELECTION") {
//     speakHighlightedText();
//   } else if (message.type === "applyFix" && message.data) {
//     try {
//       const rules =
//         typeof message.data === "string"
//           ? JSON.parse(message.data)
//           : message.data;
//       rules.forEach((rule) => {
//         document.querySelectorAll(rule.selector).forEach((el) => {
//           el.style.setProperty(rule.property, rule.value, "important");
//         });
//       });
//       console.log("DOM modifications applied:", rules);
//     } catch (e) {
//       console.error("Error applying fix:", e);
//     }
//   }
// });

// console.log("content.js is running on this page.");




// BetterWeb Content Script

// Store original page styles to revert changes if needed
let originalStyles = {
  body: {},
  saved: false
};

// Track if extension is enabled
let isEnabled = true;

// Initialize when content script loads
function initialize() {
  console.log("BetterWeb content script initialized");
  
  // Check if extension is enabled
  chrome.storage.local.get(['enabled'], function(result) {
    isEnabled = result.enabled !== false; // Default to enabled if not set
    
    if (isEnabled) {
      // Save original styles
      saveOriginalStyles();
    }
  });
  
  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("Message received:", message);
    
    if (message.action === "enable") {
      isEnabled = true;
      saveOriginalStyles();
      sendResponse({status: "enabled"});
    }
    else if (message.action === "disable") {
      isEnabled = false;
      restoreOriginalStyles();
      sendResponse({status: "disabled"});
    }
    else if (message.action === "processCommand" && isEnabled) {
      processUserCommand(message.command);
      sendResponse({status: "command processed"});
    }
    
    return true; // Required for asynchronous sendResponse
  });
}

// Save original page styles to revert later if needed
function saveOriginalStyles() {
  if (originalStyles.saved) return;
  
  const computedStyle = window.getComputedStyle(document.body);
  originalStyles.body = {
    fontSize: computedStyle.fontSize,
    lineHeight: computedStyle.lineHeight,
    fontFamily: computedStyle.fontFamily,
    backgroundColor: computedStyle.backgroundColor,
    color: computedStyle.color
  };
  
  originalStyles.saved = true;
}

// Restore the original page styles
function restoreOriginalStyles() {
  if (!originalStyles.saved) return;
  
  document.body.style.fontSize = originalStyles.body.fontSize;
  document.body.style.lineHeight = originalStyles.body.lineHeight;
  document.body.style.fontFamily = originalStyles.body.fontFamily;
  document.body.style.backgroundColor = originalStyles.body.backgroundColor;
  document.body.style.color = originalStyles.body.color;
  
  // Remove any injected styles
  StyleUtils.removeInjectedStyles();
}

// Process natural language commands from the user
function processUserCommand(command) {
  if (!isEnabled) return;
  
  console.log("Processing command:", command);
  const lowerCommand = command.toLowerCase();
  
  // Handle font size changes
  if (lowerCommand.includes("font size") || lowerCommand.includes("text size")) {
    if (lowerCommand.includes("bigger") || lowerCommand.includes("larger") || lowerCommand.includes("increase")) {
      StyleUtils.changeFontSize('increase', 2);
    } else if (lowerCommand.includes("smaller") || lowerCommand.includes("decrease")) {
      StyleUtils.changeFontSize('decrease', 2);
    } else if (lowerCommand.match(/\d+px/)) {
      // Extract specific size like "font size 18px"
      const sizeMatch = lowerCommand.match(/(\d+)px/);
      if (sizeMatch && sizeMatch[1]) {
        const fontSize = parseInt(sizeMatch[1]);
        StyleUtils.applyStyle(document.body, 'fontSize', fontSize + 'px');
      }
    }
  }
  
  // Handle basic font size commands without specific terminology
  if (lowerCommand.includes("bigger text") || lowerCommand.includes("larger text")) {
    StyleUtils.changeFontSize('increase', 4);
  }
  
  if (lowerCommand.includes("smaller text")) {
    StyleUtils.changeFontSize('decrease', 2);
  }
  
  // Handle dark mode
  if (lowerCommand.includes("dark mode") || lowerCommand.includes("dark theme")) {
    const scheme = CONFIG.colorSchemes.darkMode;
    StyleUtils.applyStyle(document.body, 'backgroundColor', scheme.backgroundColor);
    StyleUtils.applyStyle(document.body, 'color', scheme.textColor);
    StyleUtils.injectCSS(`
      a:link, a:visited {
        color: ${scheme.linkColor} !important;
      }
    `);
  }
  
  // Handle light mode
  if (lowerCommand.includes("light mode") || lowerCommand.includes("light theme")) {
    const scheme = CONFIG.colorSchemes.default;
    StyleUtils.applyStyle(document.body, 'backgroundColor', scheme.backgroundColor);
    StyleUtils.applyStyle(document.body, 'color', scheme.textColor);
    StyleUtils.injectCSS(`
      a:link, a:visited {
        color: ${scheme.linkColor} !important;
      }
    `);
  }
  
  // Handle dyslexia font
  if (lowerCommand.includes("dyslexia font") || lowerCommand.includes("dyslexic font")) {
    StyleUtils.applyStyle(document.body, 'fontFamily', "Comic Sans MS, sans-serif");
  }
  
  // Handle line spacing
  if (lowerCommand.includes("line spacing") || lowerCommand.includes("line height")) {
    if (lowerCommand.includes("increase") || lowerCommand.includes("more")) {
      const currentLineHeight = parseFloat(window.getComputedStyle(document.body).lineHeight) || 1.5;
      StyleUtils.applyStyle(document.body, 'lineHeight', (currentLineHeight + 0.2).toFixed(1));
    } else if (lowerCommand.includes("decrease") || lowerCommand.includes("less")) {
      const currentLineHeight = parseFloat(window.getComputedStyle(document.body).lineHeight) || 1.5;
      StyleUtils.applyStyle(document.body, 'lineHeight', Math.max(1, currentLineHeight - 0.2).toFixed(1));
    }
  }
}

// Initialize the content script
initialize();