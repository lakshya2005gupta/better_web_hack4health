document.addEventListener("DOMContentLoaded", () => {
  const enableBtn = document.getElementById("enableBtn");
  const disableBtn = document.getElementById("disableBtn");
  const openOptionsButton = document.getElementById("openOptions");
  const sendCommandButton = document.getElementById("sendCommand");

  enableBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ extensionEnabled: true }, () => {
      alert("BetterWeb has been enabled!");
    });
  });

  disableBtn.addEventListener("click", () => {
    chrome.storage.sync.set({ extensionEnabled: false }, () => {
      alert("BetterWeb has been disabled.");
    });
  });

  openOptionsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  sendCommandButton.addEventListener("click", async () => {
    const userCommand = document.getElementById("userCommand").value;
    console.log("User input:", userCommand);

    const fix = await getAccessibilityFix(userCommand);
    console.log("Fix received from API:", fix);

    if (fix) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("Sending message to tab:", tab.id);

      chrome.tabs.sendMessage(tab.id, { type: "applyFix", data: fix });

      console.log("Message sent to content script (no callback).");
    } else {
      console.warn("No fix returned from the API.");
      alert("No fix returned from the API.");
    }
    document.getElementById("userCommand").value = "";
  });

  // The function that calls the Cohere API
  async function getAccessibilityFix(userPrompt) {
    const apiKey = "FdSNITT5WANFBPHHXj645GonfiFZzdMyqkiZ49ha";
   // const apiKey='osIgZ9Vz7k7tk5jcZEpSycynDAQVBtdv1lz181ZC'
   //const apiKey='vNi8nBpM60Yx8UW8Fp0WKcuklCZrZ1s7Ldst5bYd'
    
    try {
      const response = await fetch("https://api.cohere.ai/v2/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "626f3d0b-210f-4e53-a86b-0d747950d57d-ft",
          messages: [
            {
              role: "user",
              content: `You are a function that returns only JSON instructions to modify a webpage's DOM.
If the user request is accessibility-related (e.g., "make font bigger"), return JSON like:
[{"selector":"body","property":"fontSize","value":"150%"}]
If the prompt is unrelated, return an empty array: []
Do not explain anything and if a user asks to change the contents of a page, like text color or font spacing,
please change it for all elements unless otherwise stated by the user.
Just output the JSON.

Use the following DOM schema as a reference for the page structure:
{
  "pageSchema": {
    "head": [
      {"selector": "meta", "description": "Metadata including charset, viewport, and SEO tags."},
      {"selector": "title", "description": "The page title (e.g., 'Wikipedia, the free encyclopedia')."},
      {"selector": "link", "description": "Links to external stylesheets and resources."},
      {"selector": "script", "description": "Scripts and configuration settings."}
    ],
    "body": [
      {"selector": "div.vector-header-container", "description": "Container for the header section."},
      {"selector": "header.mw-header", "description": "Main header with site logo and primary navigation."},
      {"selector": "a.mw-logo", "description": "Clickable site logo linking to the main page."},
      {"selector": "nav.vector-main-menu-landmark", "description": "Primary navigation bar at the top."},
      {"selector": "div#mw-panel", "description": "Sidebar navigation panel with additional menus."},
      {"selector": "div.mw-content-container", "description": "Main container for the page content."},
      {"selector": "main#content", "description": "Primary content area for the article."},
      {"selector": "div.mw-parser-output", "description": "Contains formatted text, images, and other content elements."},
      {"selector": "div#footer", "description": "Footer section with copyright info and extra links."},
      {"selector": "div.vector-sticky-header-container", "description": "Container for the sticky header that remains during scrolling."},
      {"selector": "div#p-lang-btn", "description": "Language selection dropdown for switching page languages."}
    ]
  }
}

Now here is the prompt: ${userPrompt}`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log("Cohere raw response:", data);

      const text = data.message?.content?.[0]?.text;
      console.log("Text output:", text);

      if (!text) {
        console.warn("No text returned by LLM.");
        return null;
      }
      try {
        const parsed = JSON.parse(text);
        console.log("Parsed response:", parsed);
        return parsed;
      } catch (e) {
        console.error("Error parsing LLM response as JSON:", e);
        return null;
      }
    } catch (err) {
      console.error("Failed API call:", err);
      return null;
    }
  }
});



// Extension functionality
document.addEventListener('DOMContentLoaded', function() {
  // Extension control buttons
  const enableBtn = document.getElementById('enableBtn');
  const disableBtn = document.getElementById('disableBtn');
  const openOptions = document.getElementById('openOptions');
  const sendCommand = document.getElementById('sendCommand');
  const userCommand = document.getElementById('userCommand');
  
  const aiAgentBtn = document.getElementById('aiAgentBtn');
  const agentInputContainer = document.getElementById('agentInputContainer');
  const agentCommand = document.getElementById('agentCommand');
  const runAgentBtn = document.getElementById('runAgentBtn');
  const agentStatus = document.getElementById('agentStatus');
  
  if (enableBtn) {
    enableBtn.addEventListener('click', function() {
      chrome.runtime.sendMessage({action: 'enable'}, function(response) {
        console.log('Extension enabled');
      });
    });
  }
  
  if (disableBtn) {
    disableBtn.addEventListener('click', function() {
      chrome.runtime.sendMessage({action: 'disable'}, function(response) {
        console.log('Extension disabled');
      });
    });
  }
  
  if (openOptions) {
    openOptions.addEventListener('click', function() {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
  }
  
  if (sendCommand) {
    sendCommand.addEventListener('click', function() {
      const command = userCommand.value.trim();
      if (command) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'executeCommand', command: command}, function(response) {
            console.log('Command executed:', response);
          });
        });
      }
    });
  }
  
  if (aiAgentBtn) {
    aiAgentBtn.addEventListener('click', function() {
      if (agentInputContainer.style.display === 'block') {
        agentInputContainer.style.display = 'none';
      } else {
        agentInputContainer.style.display = 'block';
      }
    });
  }
  
  if (runAgentBtn) {
    runAgentBtn.addEventListener('click', function() {
      const command = agentCommand.value.trim();
      if (command) {
        agentStatus.textContent = 'Processing...';
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'runAgent', command: command}, function(response) {
            agentStatus.textContent = response ? 'Done!' : 'Error running agent';
            setTimeout(() => { agentStatus.textContent = ''; }, 2000);
          });
        });
      }
    });
  }

  // Chatbot functionality
  initializeChatbot();
});

// Chatbot functionality
function initializeChatbot() {
  const API_KEY = "AIzaSyCsA7wL-Xusb21c8oS37CQ9FpwlSGtQf_k";
  
  const minimizeBtn = document.getElementById("minimize-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");
  
  let chatVisible = true;
  
  if (minimizeBtn) {
    minimizeBtn.onclick = () => {
      if (chatVisible) {
        // Keep header visible but hide the rest
        chatMessages.style.display = "none";
        document.querySelector(".chat-input").style.display = "none";
        minimizeBtn.textContent = "➕";
        chatVisible = false;
      } else {
        chatMessages.style.display = "flex";
        document.querySelector(".chat-input").style.display = "flex";
        minimizeBtn.textContent = "➖";
        chatVisible = true;
      }
    };
  }
  
  // Add a welcome message
  if (chatMessages) {
    const welcomeMsg = document.createElement("div");
    welcomeMsg.className = "chat-message bot-message";
    welcomeMsg.textContent = "Hello! I'm your BetterWeb Assistant. How can I help make your browsing experience more accessible today?";
    chatMessages.appendChild(welcomeMsg);
  }
  
  if (sendBtn && userInput) {
    sendBtn.onclick = async () => {
      const input = userInput.value.trim();
      if (!input) return;
      
      await sendMessage(input);
    };
    
    userInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const input = userInput.value.trim();
        if (!input) return;
        
        await sendMessage(input);
      }
    });
  }
  
  async function sendMessage(input) {
    // Show user message
    const userMsgDiv = document.createElement("div");
    userMsgDiv.className = "chat-message user-message";
    userMsgDiv.textContent = input;
    chatMessages.appendChild(userMsgDiv);
    
    userInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Show loading
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "chat-message bot-message";
    loadingDiv.textContent = "Typing...";
    chatMessages.appendChild(loadingDiv);
    
    try {
      const enrichedQuery = `
      You are an AI-powered accessibility assistant for BetterWeb, a Chrome extension designed to make the internet inclusive for everyone—especially users with ADHD, dyslexia, visual impairments, autism, epilepsy, and other neurodivergent or sensory needs.
      
      Your role is to guide users through BetterWeb's features, including personalized accessibility profiles, dyslexia-friendly fonts, dark mode toggling, text-to-speech, and AI-driven page modifications. You understand how to help users customize fonts, colors, layouts, and interactions to meet their unique needs using natural language commands.
      
      You are also capable of interpreting and executing accessibility-related changes via real-time JavaScript DOM manipulation, enabling non-technical users to adapt any webpage. When users describe issues like "too much brightness" or "small text," respond with actionable solutions or execute relevant commands.
      
      If the user asks about this platform, explain that BetterWeb empowers users to:
      - Create custom accessibility profiles
      - Instantly adjust pages with an AI chatbot
      - Use voice support for reading text aloud
      - Apply calming pastel themes for reduced sensory overload
      - Control motion and flashing effects for photosensitivity
      
      For users interested in advanced customization or real-time accessibility auditing, mention that premium features are in development.
      
      If users ask unrelated or general questions, respond helpfully but redirect them toward accessibility, web customization, or BetterWeb's core features when possible.
      
      User Query: ${input}
      `;
      const API_KEY='AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo'
      const response = await axios.post(
        //`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: enrichedQuery }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      loadingDiv.remove();
      
      const botText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't understand.";
      
      const botMsgDiv = document.createElement("div");
      botMsgDiv.className = "chat-message bot-message";
      botMsgDiv.textContent = botText;
      chatMessages.appendChild(botMsgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      loadingDiv.remove();
      const errorMsgDiv = document.createElement("div");
      errorMsgDiv.className = "chat-message bot-message";
      errorMsgDiv.textContent =
      "Something went wrong. Please try again later.";
      chatMessages.appendChild(errorMsgDiv);
      console.error("API Error:", error);
    }
  }
  
  // Speech recognition setup
  if (micBtn) {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      
      recognition.onstart = () => {
        micBtn.textContent = "🎙️"; // recording
        micBtn.classList.add("recording");
      };
      
      recognition.onend = () => {
        micBtn.textContent = "🎤"; // done recording
        micBtn.classList.remove("recording");
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
      };
      
      micBtn.onclick = () => {
        recognition.start();
      };
    } else {
      micBtn.disabled = true;
      micBtn.title = "Speech recognition not supported";
      micBtn.style.opacity = "0.5";
    }
  }
}





// document.addEventListener("DOMContentLoaded", () => {
//   const enableBtn = document.getElementById("enableBtn");
//   const disableBtn = document.getElementById("disableBtn");
//   const openOptionsButton = document.getElementById("openOptions");
//   const sendCommandButton = document.getElementById("sendCommand");

//   if (enableBtn) {
//     enableBtn.addEventListener("click", () => {
//       chrome.storage.sync.set({ extensionEnabled: true }, () => {
//         alert("BetterWeb has been enabled!");
//       });
//     });
//   }

//   if (disableBtn) {
//     disableBtn.addEventListener("click", () => {
//       chrome.storage.sync.set({ extensionEnabled: false }, () => {
//         alert("BetterWeb has been disabled.");
//       });
//     });
//   }

//   if (openOptionsButton) {
//     openOptionsButton.addEventListener("click", () => {
//       chrome.runtime.openOptionsPage();
//     });
//   }

//   if (sendCommandButton) {
//     sendCommandButton.addEventListener("click", async () => {
//       const userCommand = document.getElementById("userCommand")?.value;
//       if (!userCommand) {
//         alert("Please enter a command.");
//         return;
//       }

//       console.log("User input:", userCommand);

//       const fix = await getAccessibilityFix(userCommand);
//       console.log("Fix received from API:", fix);

//       if (fix && Array.isArray(fix)) {
//         const [tab] = await chrome.tabs.query({
//           active: true,
//           currentWindow: true,
//         });

//         if (tab?.id) {
//           console.log("Sending message to tab:", tab.id);
//           chrome.tabs.sendMessage(tab.id, { type: "applyFix", data: fix });
//           console.log("Message sent to content script.");
//         } else {
//           console.warn("No active tab found.");
//         }
//       } else {
//         console.warn("No fix returned from the API.");
//         alert("No fix returned from the API.");
//       }

//       document.getElementById("userCommand").value = "";
//     });
//   }

//   async function getAccessibilityFix(userPrompt) {
//     const apiKey = 'FdSNITT5WANFBPHHXj645GonfiFZzdMyqkiZ49ha'; // Move this to secure backend in production

//     try {
//       const response = await fetch("https://api.cohere.ai/v2/chat", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//           "Cohere-Version": "2023-09-28"
//         },
//         body: JSON.stringify({
//           model: "626f3d0b-210f-4e53-a86b-0d747950d57d-ft",
//           messages: [
//             {
//               role: "user",
//               content: `You are a function that returns only JSON instructions to modify a webpage's DOM.
// If the user request is accessibility-related (e.g., "make font bigger"), return JSON like:
// [{"selector":"body","property":"fontSize","value":"150%"}]
// If the prompt is unrelated, return an empty array: []
// Do not explain anything and if a user asks to change the contents of a page, like text color or font spacing,
// please change it for all elements unless otherwise stated by the user.
// Just output the JSON.

// Use the following DOM schema as a reference for the page structure:
// {...}  // (schema omitted for brevity)

// Now here is the prompt: ${userPrompt}`,
//             },
//           ],
//         }),
//       });

//       const data = await response.json();
//       console.log("Cohere raw response:", data);

//       let text = data?.text || data?.message?.content || data?.message?.content?.[0]?.text;

//       if (typeof text !== "string") {
//         console.warn("No text returned by LLM.");
//         return null;
//       }

//       try {
//         const parsed = JSON.parse(text);
//         return parsed;
//       } catch (e) {
//         console.error("Error parsing LLM response as JSON:", e);
//         return null;
//       }
//     } catch (err) {
//       console.error("Failed API call:", err);
//       return null;
//     }
//   }
// });






