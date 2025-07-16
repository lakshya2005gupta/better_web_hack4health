// Enhanced content.js - Universal Accessibility Features

// Speech recognition and accessibility style application
let isListening = false;

// Function to apply accessibility styles in the page context
function applyAccessibilityStyles(settings) {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  // Color blindness themes
  const colorBlindnessThemes = {
    protanopia: { bg: "#e0f2f7", text: "#263238", buttonBg: "#4db6ac", buttonText: "#fff" },
    deuteranopia: { bg: "#f1f8e9", text: "#33691e", buttonBg: "#aed581", buttonText: "#fff" },
    tritanopia: { bg: "#f3e5f5", text: "#4a148c", buttonBg: "#ce93d8", buttonText: "#fff" },
    achromatopsia: { bg: "#f5f5f5", text: "#212121", buttonBg: "#9e9e9e", buttonText: "#fff" }
  };

  const theme = colorBlindnessThemes[settings.cbType] || {};
  const bgColor = theme.bg || settings.bgColor;
  const textColor = theme.text || settings.textColor;

  const style = document.createElement("style");
  style.id = styleId;
  
  let css = `
    /* Universal Accessibility Styles */
    html, body {
      ${settings.fontFamily ? `font-family: '${settings.fontFamily}', sans-serif !important;` : ''}
      background-color: ${bgColor} !important;
      color: ${textColor} !important;
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
      letter-spacing: ${settings.letterSpacing / 10}em !important;
      word-spacing: ${settings.wordSpacing / 10}em !important;
      filter: contrast(${settings.contrast}%) brightness(${settings.brightness}%) !important;
    }
    
    * {
      ${settings.fontFamily ? `font-family: '${settings.fontFamily}', sans-serif !important;` : ''}
      ${settings.fontSize ? `font-size: inherit !important;` : ''}
      ${settings.lineHeight ? `line-height: inherit !important;` : ''}
      ${settings.letterSpacing ? `letter-spacing: inherit !important;` : ''}
      ${settings.wordSpacing ? `word-spacing: inherit !important;` : ''}
    }
    
    p, span, div, li, td, th {
      background-color: transparent !important;
      color: ${textColor} !important;
    }
    
    a {
      color: ${textColor} !important;
      ${settings.highlightLinks ? `
        background-color: yellow !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        text-decoration: underline !important;
        font-weight: bold !important;
      ` : ''}
    }
    
    button, input[type="button"], input[type="submit"] {
      background-color: ${theme.buttonBg || '#007acc'} !important;
      color: ${theme.buttonText || '#fff'} !important;
      border: 2px solid ${textColor} !important;
      padding: 8px 16px !important;
      border-radius: 4px !important;
      font-weight: bold !important;
      cursor: pointer !important;
    }
    
    ${settings.hideImages ? `
      img, video, iframe {
        display: none !important;
      }
    ` : ''}
    
    ${settings.simplifyLayout ? `
      /* Hide common distraction elements */
      .sidebar, .advertisement, .ad, .popup, .modal, .banner,
      [class*="sidebar"], [class*="ad"], [id*="ad"],
      [class*="banner"], [class*="popup"], [class*="modal"],
      aside, .aside, #aside,
      .widget, .widgets,
      .social-share, .social-sharing,
      .comments-section, .comment-form,
      .related-posts, .recommended,
      .newsletter, .subscribe,
      .floating, .sticky,
      .overlay, .backdrop {
        display: none !important;
      }
      
      /* Simplify main content area */
      main, article, .main, .content, .post, .entry {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 20px !important;
        box-shadow: none !important;
        border: none !important;
        background: inherit !important;
      }
      
      /* Clean up header and navigation */
      header, nav, .header, .navigation {
        max-width: 800px !important;
        margin: 0 auto !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      
      /* Remove unnecessary visual elements */
      .decoration, .ornament, .divider,
      .gradient, .pattern, .texture {
        display: none !important;
      }
      
      /* Simplify images and media */
      img, video {
        max-width: 100% !important;
        height: auto !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
    ` : ''}
    
    ${settings.bigCursor ? `
      * {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="0,0 0,24 8,18 14,28 18,26 12,16 24,16" fill="black"/></svg>'), auto !important;
      }
    ` : ''}
    
    ${settings.pauseAnimations ? `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        transform: none !important;
      }
    ` : ''}
  `;

  style.textContent = css;
  document.head.appendChild(style);
  
  showNotification('BetterWeb Accessibility Settings Applied ✅', '#4CAF50');
}

// Function to remove accessibility styles
function removeAccessibilityStyles() {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  
  showNotification('Accessibility Settings Removed', '#f44336');
}

// Show notification
function showNotification(message, color) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: opacity 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
}

// Enhanced speech recognition
function startSpeechRecognition() {
  if (isListening) {
    showNotification('Speech recognition is already active', '#ff9800');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showNotification('Speech Recognition not supported in this browser', '#f44336');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  isListening = true;
  recognition.start();
  showNotification('Listening for voice command...', '#2196F3');

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    showNotification(`Heard: "${transcript}"`, '#2196F3');
    handleSpeechCommand(transcript);
  });

  recognition.addEventListener("speechend", () => {
    recognition.stop();
    isListening = false;
  });

  recognition.addEventListener("error", (event) => {
    isListening = false;
    if (event.error === "not-allowed") {
      showNotification('Microphone access denied. Please allow microphone permissions.', '#f44336');
    } else {
      showNotification(`Speech recognition error: ${event.error}`, '#f44336');
    }
  });

  recognition.addEventListener("nomatch", () => {
    isListening = false;
    showNotification('No speech was recognized. Please try again.', '#ff9800');
  });
}

// Enhanced speech command handling
function handleSpeechCommand(command) {
  chrome.storage.sync.get(null, (settings) => {
    let updated = false;
    const newSettings = { ...settings };

    // Profile commands
    if (command.includes('apply dyslexia') || command.includes('dyslexia profile')) {
      applyProfile('dyslexia', newSettings);
      updated = true;
    } else if (command.includes('apply low vision') || command.includes('low vision profile')) {
      applyProfile('low-vision', newSettings);
      updated = true;
    } else if (command.includes('apply motor') || command.includes('motor profile')) {
      applyProfile('motor', newSettings);
      updated = true;
    } else if (command.includes('apply cognitive') || command.includes('cognitive profile')) {
      applyProfile('cognitive', newSettings);
      updated = true;
    }

    // Font size commands
    else if (command.includes('increase font size') || command.includes('bigger font')) {
      newSettings.fontSize = Math.min((newSettings.fontSize || 16) + 2, 32);
      updated = true;
    } else if (command.includes('decrease font size') || command.includes('smaller font')) {
      newSettings.fontSize = Math.max((newSettings.fontSize || 16) - 2, 10);
      updated = true;
    }

    // Spacing commands
    else if (command.includes('increase spacing') || command.includes('more spacing')) {
      newSettings.letterSpacing = Math.min((newSettings.letterSpacing || 0) + 1, 20);
      updated = true;
    } else if (command.includes('decrease spacing') || command.includes('less spacing')) {
      newSettings.letterSpacing = Math.max((newSettings.letterSpacing || 0) - 1, 0);
      updated = true;
    }

    // Image commands
    else if (command.includes('hide images')) {
      newSettings.hideImages = true;
      updated = true;
    } else if (command.includes('show images')) {
      newSettings.hideImages = false;
      updated = true;
    }

    // Cursor commands
    else if (command.includes('big cursor') || command.includes('large cursor')) {
      newSettings.bigCursor = true;
      updated = true;
    } else if (command.includes('normal cursor') || command.includes('small cursor')) {
      newSettings.bigCursor = false;
      updated = true;
    }

    // Color blindness commands
    else if (command.includes('protanopia')) {
      newSettings.cbType = 'protanopia';
      updated = true;
    } else if (command.includes('deuteranopia')) {
      newSettings.cbType = 'deuteranopia';
      updated = true;
    } else if (command.includes('tritanopia')) {
      newSettings.cbType = 'tritanopia';
      updated = true;
    } else if (command.includes('achromatopsia')) {
      newSettings.cbType = 'achromatopsia';
      updated = true;
    } else if (command.includes('disable color blindness') || command.includes('color blindness off')) {
      newSettings.cbType = '';
      updated = true;
    }

    // Layout commands
    else if (command.includes('simplify layout') || command.includes('simple layout')) {
      newSettings.simplifyLayout = true;
      updated = true;
    } else if (command.includes('normal layout') || command.includes('complex layout')) {
      newSettings.simplifyLayout = false;
      updated = true;
    }

    // Animation commands
    else if (command.includes('pause animations') || command.includes('stop animations')) {
      newSettings.pauseAnimations = true;
      updated = true;
    } else if (command.includes('enable animations') || command.includes('start animations')) {
      newSettings.pauseAnimations = false;
      updated = true;
    }

    // Reset command
    else if (command.includes('reset settings') || command.includes('reset all')) {
      removeAccessibilityStyles();
      chrome.storage.sync.clear();
      showNotification('All settings have been reset', '#ff9800');
      return;
    }

    if (updated) {
      chrome.storage.sync.set(newSettings, () => {
        applyAccessibilityStyles(newSettings);
        showNotification('Settings updated via voice command', '#4CAF50');
      });
    } else {
      showNotification('Command not recognized. Please try again.', '#ff9800');
    }
  });
}

// Apply accessibility profile
function applyProfile(profileName, settings) {
  // Default settings to reset to
  const defaultSettings = {
    fontFamily: '',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.4,
    wordSpacing: 0,
    cbType: '',
    contrast: 100,
    brightness: 100,
    bgColor: '#ffffff',
    textColor: '#000000',
    hideImages: false,
    highlightLinks: false,
    bigCursor: false,
    pauseAnimations: false,
    simplifyLayout: false
  };

  const profiles = {
    dyslexia: {
      fontFamily: 'OpenDyslexic',
      fontSize: 18,
      letterSpacing: 2,
      lineHeight: 1.6,
      wordSpacing: 3,
      bgColor: '#fefbd8',
      textColor: '#333333',
      highlightLinks: true,
      pauseAnimations: true
    },
    'low-vision': {
      fontSize: 22,
      contrast: 150,
      brightness: 120,
      bgColor: '#000000',
      textColor: '#ffff00',
      bigCursor: true,
      hideImages: false,
      highlightLinks: true
    },
    motor: {
      fontSize: 20,
      letterSpacing: 1,
      bigCursor: true,
      pauseAnimations: true,
      simplifyLayout: true,
      highlightLinks: true
    },
    cognitive: {
      fontSize: 18,
      lineHeight: 1.8,
      simplifyLayout: true,
      pauseAnimations: true,
      hideImages: true,
      bgColor: '#f0f8ff',
      textColor: '#333333'
    }
  };

  const profile = profiles[profileName];
  if (profile) {
    // First reset all settings to defaults
    Object.assign(settings, defaultSettings);
    // Then apply the specific profile settings
    Object.assign(settings, profile);
    showNotification(`Applied ${profileName} accessibility profile`, '#4CAF50');
  }
}

// Function to find elements on page (used by search)
function findElementsOnPage(searchTerm) {
  const elements = [];
  const selectors = [
    'button', 'input[type="button"]', 'input[type="submit"]', 'a',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div',
    'img', 'video', 'iframe', 'form', 'table', 'nav', 'header', 'footer'
  ];
  
  selectors.forEach(selector => {
    const foundElements = document.querySelectorAll(selector);
    foundElements.forEach((el, index) => {
      const text = el.textContent || el.alt || el.title || '';
      const tag = el.tagName.toLowerCase();
      
      if (tag.includes(searchTerm) || text.toLowerCase().includes(searchTerm)) {
        elements.push({
          tag: tag,
          text: text.trim(),
          selector: `${selector}:nth-of-type(${index + 1})`
        });
      }
    });
  });
  
  return elements;
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSpeechRecognition") {
    startSpeechRecognition();
    sendResponse({ status: "started" });
  }
  return true;
});

// Auto-apply saved settings when page loads
chrome.storage.sync.get(null, (settings) => {
  if (settings && Object.keys(settings).length > 0) {
    // Check if we have any meaningful settings
    const hasSettings = settings.fontSize || settings.fontFamily || settings.cbType || 
                       settings.hideImages || settings.simplifyLayout || settings.highlightLinks;
    
    if (hasSettings) {
      setTimeout(() => {
        applyAccessibilityStyles(settings);
      }, 500); // Small delay to ensure page is ready
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+A to toggle speech recognition
  if (event.ctrlKey && event.shiftKey && event.key === 'A') {
    event.preventDefault();
    startSpeechRecognition();
  }
  
  // Ctrl+Shift+R to reset all settings
  if (event.ctrlKey && event.shiftKey && event.key === 'R') {
    event.preventDefault();
    removeAccessibilityStyles();
    chrome.storage.sync.clear();
    showNotification('All accessibility settings reset', '#ff9800');
  }
});
