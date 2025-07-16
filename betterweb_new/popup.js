// ========== Enhanced Universal Accessibility popup.js ==========

// Default settings
const defaultSettings = {
  // Typography
  fontFamily: '',
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: 1.4,
  wordSpacing: 0,
  
  // Colors & Vision
  cbType: '',
  contrast: 100,
  brightness: 100,
  bgColor: '#ffffff',
  textColor: '#000000',
  
  // Layout & Navigation
  hideImages: false,
  highlightLinks: false,
  bigCursor: false,
  pauseAnimations: false,
  
  // Element-specific customizations
  customElements: {}
};

// Accessibility profiles
const accessibilityProfiles = {
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
    highlightLinks: true
  },
  cognitive: {
    fontSize: 18,
    lineHeight: 1.8,
    pauseAnimations: true,
    hideImages: true,
    bgColor: '#f0f8ff',
    textColor: '#333333'
  }
};

// Initialize popup
window.onload = () => {
  loadSettings();
  setupEventListeners();
  setupProfileButtons();
};

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (data) => {
    // Typography
    document.getElementById('fontFamily').value = data.fontFamily || '';
    document.getElementById('fontSize').value = data.fontSize || 16;
    document.getElementById('letterSpacing').value = data.letterSpacing || 0;
    document.getElementById('lineHeight').value = data.lineHeight || 1.4;
    document.getElementById('wordSpacing').value = data.wordSpacing || 0;
    
    // Colors & Vision
    document.getElementById('cbType').value = data.cbType || '';
    document.getElementById('contrast').value = data.contrast || 100;
    document.getElementById('brightness').value = data.brightness || 100;
    document.getElementById('bgColor').value = data.bgColor || '#ffffff';
    document.getElementById('textColor').value = data.textColor || '#000000';
    
    // Layout & Navigation
    document.getElementById('hideImages').checked = data.hideImages || false;
    document.getElementById('highlightLinks').checked = data.highlightLinks || false;
    document.getElementById('bigCursor').checked = data.bigCursor || false;
    document.getElementById('pauseAnimations').checked = data.pauseAnimations || false;
    
    updateDisplayValues();
  });
}

// Update display values for range inputs
function updateDisplayValues() {
  document.getElementById('fontSizeValue').textContent = `${document.getElementById('fontSize').value}px`;
  document.getElementById('letterSpacingValue').textContent = `${(document.getElementById('letterSpacing').value / 10)}em`;
  document.getElementById('lineHeightValue').textContent = document.getElementById('lineHeight').value;
  document.getElementById('wordSpacingValue').textContent = `${(document.getElementById('wordSpacing').value / 10)}em`;
  document.getElementById('contrastValue').textContent = `${document.getElementById('contrast').value}%`;
  document.getElementById('brightnessValue').textContent = `${document.getElementById('brightness').value}%`;
}

// Setup event listeners
function setupEventListeners() {
  // Range input listeners
  document.getElementById('fontSize').addEventListener('input', (e) => {
    document.getElementById('fontSizeValue').textContent = `${e.target.value}px`;
  });
  
  document.getElementById('letterSpacing').addEventListener('input', (e) => {
    document.getElementById('letterSpacingValue').textContent = `${(e.target.value / 10)}em`;
  });
  
  document.getElementById('lineHeight').addEventListener('input', (e) => {
    document.getElementById('lineHeightValue').textContent = e.target.value;
  });
  
  document.getElementById('wordSpacing').addEventListener('input', (e) => {
    document.getElementById('wordSpacingValue').textContent = `${(e.target.value / 10)}em`;
  });
  
  document.getElementById('contrast').addEventListener('input', (e) => {
    document.getElementById('contrastValue').textContent = `${e.target.value}%`;
  });
  
  document.getElementById('brightness').addEventListener('input', (e) => {
    document.getElementById('brightnessValue').textContent = `${e.target.value}%`;
  });
  
  // Color reset buttons
  document.getElementById('resetBgColor').addEventListener('click', () => {
    document.getElementById('bgColor').value = '#ffffff';
  });
  
  document.getElementById('resetTextColor').addEventListener('click', () => {
    document.getElementById('textColor').value = '#000000';
  });
  
  // Element search
  document.getElementById('searchBtn').addEventListener('click', searchElements);
  document.getElementById('elementSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchElements();
  });
  
  // Main buttons
  document.getElementById('apply').addEventListener('click', applySettings);
  document.getElementById('reset').addEventListener('click', resetSettings);
  document.getElementById('speechToggle').addEventListener('click', toggleSpeechRecognition);
}

// Setup profile buttons
function setupProfileButtons() {
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const profile = e.target.dataset.profile;
      applyProfile(profile);
      
      // Update active state
      document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

// Apply accessibility profile
function applyProfile(profileName) {
  const profile = accessibilityProfiles[profileName];
  if (!profile) return;
  
  // Apply profile settings to UI
  Object.keys(profile).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = profile[key];
      } else {
        element.value = profile[key];
      }
    }
  });
  
  updateDisplayValues();
  
  // Auto-apply the profile
  setTimeout(() => applySettings(), 100);
}

// Search for elements on the page
function searchElements() {
  const searchTerm = document.getElementById('elementSearch').value.toLowerCase();
  if (!searchTerm) return;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: findElementsOnPage,
      args: [searchTerm]
    }, (results) => {
      if (results && results[0] && results[0].result) {
        displaySearchResults(results[0].result);
      }
    });
  });
}

// Display search results
function displaySearchResults(elements) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';
  
  if (elements.length === 0) {
    resultsContainer.innerHTML = '<div class="search-result-item">No elements found</div>';
    return;
  }
  
  elements.slice(0, 10).forEach((element, index) => {
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.textContent = `${element.tag} - ${element.text.substring(0, 50)}${element.text.length > 50 ? '...' : ''}`;
    resultItem.addEventListener('click', () => {
      highlightElement(element.selector);
    });
    resultsContainer.appendChild(resultItem);
  });
}

// Highlight element on page
function highlightElement(selector) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (selector) => {
        // Remove previous highlights
        document.querySelectorAll('.eduadapt-highlight').forEach(el => {
          el.classList.remove('eduadapt-highlight');
        });
        
        // Add highlight to selected element
        const element = document.querySelector(selector);
        if (element) {
          element.classList.add('eduadapt-highlight');
          element.style.outline = '3px solid #ff6b6b';
          element.style.outlineOffset = '2px';
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.classList.remove('eduadapt-highlight');
          }, 3000);
        }
      },
      args: [selector]
    });
  });
}

// Apply all settings
function applySettings() {
  const settings = getCurrentSettings();
  
  chrome.storage.sync.set(settings, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: applyAccessibilityStyles,
        args: [settings]
      });
    });
  });
}

// Get current settings from UI
function getCurrentSettings() {
  return {
    fontFamily: document.getElementById('fontFamily').value,
    fontSize: parseInt(document.getElementById('fontSize').value),
    letterSpacing: parseInt(document.getElementById('letterSpacing').value),
    lineHeight: parseFloat(document.getElementById('lineHeight').value),
    wordSpacing: parseInt(document.getElementById('wordSpacing').value),
    cbType: document.getElementById('cbType').value,
    contrast: parseInt(document.getElementById('contrast').value),
    brightness: parseInt(document.getElementById('brightness').value),
    bgColor: document.getElementById('bgColor').value,
    textColor: document.getElementById('textColor').value,
    hideImages: document.getElementById('hideImages').checked,
    highlightLinks: document.getElementById('highlightLinks').checked,
    bigCursor: document.getElementById('bigCursor').checked,
    pauseAnimations: document.getElementById('pauseAnimations').checked
  };
}

// Reset all settings
function resetSettings() {
  Object.keys(defaultSettings).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = defaultSettings[key];
      } else {
        element.value = defaultSettings[key];
      }
    }
  });
  
  updateDisplayValues();
  
  chrome.storage.sync.clear(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removeAccessibilityStyles
      });
    });
    
    // Remove active state from profile buttons
    document.querySelectorAll('.profile-btn').forEach(btn => btn.classList.remove('active'));
    
    alert("All accessibility settings have been reset.");
  });
}

// Toggle speech recognition
function toggleSpeechRecognition() {
  const commands = `
Available voice commands:
- "Apply [profile name]" (dyslexia, low-vision, motor, cognitive)
- "Increase/Decrease font size"
- "Increase/Decrease spacing"
- "Hide/Show images"
- "Enable/Disable big cursor"
- "Enable/Disable [color blindness type]"
- "Reset settings"

Speak clearly after clicking OK.
`;
  alert(commands);
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "startSpeechRecognition" }, (response) => {
      if (chrome.runtime.lastError) {
        alert("Error: " + chrome.runtime.lastError.message + ". Please make sure you are on a web page.");
      } else {
        alert("Speech recognition started. Please speak your command.");
      }
    });
  });
}

// Functions to be injected into the page
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
  
  // Show confirmation
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  notification.textContent = 'BetterWeb Accessibility Settings Applied ✅';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function removeAccessibilityStyles() {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
  
  // Show confirmation
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  notification.textContent = 'Accessibility Settings Removed';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}
