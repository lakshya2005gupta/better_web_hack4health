// content.js - Speech recognition and accessibility style application

// Function to apply accessibility styles in the page context
function applyAccessibilityStyles(enableDyslexia, fontSize, spacing, cbType) {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();

  const themes = {
    default: { bg: "#fef6e4", text: "#001858", buttonBg: "#8bd3dd", buttonText: "#172c66" },
    protanopia: { bg: "#e0f2f7", text: "#263238", buttonBg: "#4db6ac", buttonText: "#fff" },
    deuteranopia: { bg: "#f1f8e9", text: "#33691e", buttonBg: "#aed581", buttonText: "#fff" },
    tritanopia: { bg: "#f3e5f5", text: "#4a148c", buttonBg: "#ce93d8", buttonText: "#fff" },
    achromatopsia: { bg: "#f5f5f5", text: "#212121", buttonBg: "#9e9e9e", buttonText: "#fff" }
  };

  const theme = themes[cbType] || themes.default;

  const style = document.createElement("style");
  style.id = styleId;
  style.innerText = `
    body * {
      font-family: ${enableDyslexia ? "'OpenDyslexic', sans-serif" : "inherit"} !important;
      ${enableDyslexia ? `letter-spacing: ${spacing / 10}em !important;` : ""}
      ${enableDyslexia ? "line-height: 1.6 !important;" : ""}
      ${enableDyslexia ? `font-size: ${fontSize}px !important;` : ""}
      -webkit-text-size-adjust: none !important;
    }
    html, body {
      background-color: ${theme.bg} !important;
      color: ${theme.text} !important;
    }
    a {
      color: ${theme.text} !important;
    }
  `;
  document.head.appendChild(style);
}

// Function to remove accessibility styles
function removeAccessibilityStyles() {
  const styleId = "eduadapt-accessibility-style";
  const existing = document.getElementById(styleId);
  if (existing) existing.remove();
}

// Speech recognition logic
function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition API not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  alert("Listening for voice command...");

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    alert(`Heard: ${transcript}`);
    handleSpeechCommand(transcript);
  });

  recognition.addEventListener("speechend", () => {
    recognition.stop();
  });

  recognition.addEventListener("error", (event) => {
    if(event.error === "not-allowed") {
      alert("Microphone access denied. Please allow microphone permissions for this extension in your browser settings.");
    } else {
      alert(`Error occurred in recognition: ${event.error}`);
    }
  });

  // Load current settings from chrome.storage
  function loadSettings(callback) {
    chrome.storage.sync.get(["enableDyslexia", "fontSize", "spacing", "cbType"], (data) => {
      callback({
        enableDyslexia: data.enableDyslexia ?? false,
        fontSize: data.fontSize ?? 18,
        spacing: data.spacing ?? 2,
        cbType: data.cbType ?? ""
      });
    });
  }

  // Save updated settings to chrome.storage
  function saveSettings(settings) {
    chrome.storage.sync.set(settings);
  }

  // Handle recognized speech commands
  function handleSpeechCommand(command) {
    loadSettings((settings) => {
      let updated = false;

      if (command.includes("enable dyslexia")) {
        settings.enableDyslexia = true;
        updated = true;
      } else if (command.includes("disable dyslexia")) {
        settings.enableDyslexia = false;
        updated = true;
      }

      if (command.includes("increase font size")) {
        settings.fontSize = Math.min(settings.fontSize + 2, 24);
        updated = true;
      } else if (command.includes("decrease font size")) {
        settings.fontSize = Math.max(settings.fontSize - 2, 14);
        updated = true;
      }

      if (command.includes("increase spacing")) {
        settings.spacing = Math.min(settings.spacing + 1, 10);
        updated = true;
      } else if (command.includes("decrease spacing")) {
        settings.spacing = Math.max(settings.spacing - 1, 0);
        updated = true;
      }

      if (command.includes("color blindness off") || command.includes("turn off color blindness")) {
        settings.cbType = "";
        updated = true;
      } else if (command.includes("enable color blindness mode")) {
        settings.cbType = "protanopia";
        updated = true;
      } else if (command.includes("protanopia")) {
        settings.cbType = "protanopia";
        updated = true;
      } else if (command.includes("deuteranopia")) {
        settings.cbType = "deuteranopia";
        updated = true;
      } else if (command.includes("tritanopia")) {
        settings.cbType = "tritanopia";
        updated = true;
      } else if (command.includes("achromatopsia")) {
        settings.cbType = "achromatopsia";
        updated = true;
      }

      if (updated) {
        saveSettings(settings);
        applyAccessibilityStyles(settings.enableDyslexia, settings.fontSize, settings.spacing, settings.cbType);
        alert("Accessibility settings updated via voice command.");
      } else {
        alert("Command not recognized. Please try again.");
      }
    });
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSpeechRecognition") {
    startSpeechRecognition();
    sendResponse({status: "started"});
  }
});
