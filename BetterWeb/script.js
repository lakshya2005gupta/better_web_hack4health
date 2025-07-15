const API_KEY = "AIzaSyCsA7wL-Xusb21c8oS37CQ9FpwlSGtQf_k";

const openBtn = document.getElementById("open-btn");
const closeBtn = document.getElementById("close-btn");
const chatWindow = document.getElementById("chat-window");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

openBtn.onclick = () => {
  chatWindow.classList.remove("hidden");
  openBtn.classList.add("hidden");
};

closeBtn.onclick = () => {
  chatWindow.classList.add("hidden");
  openBtn.classList.remove("hidden");
};

sendBtn.onclick = async () => {
  const input = userInput.value.trim();
  if (!input) return;

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

Your role is to guide users through BetterWeb’s features, including personalized accessibility profiles, dyslexia-friendly fonts, dark mode toggling, text-to-speech, and AI-driven page modifications. You understand how to help users customize fonts, colors, layouts, and interactions to meet their unique needs using natural language commands.

You are also capable of interpreting and executing accessibility-related changes via real-time JavaScript DOM manipulation, enabling non-technical users to adapt any webpage. When users describe issues like “too much brightness” or “small text,” respond with actionable solutions or execute relevant commands.

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






    const response = await axios.post(
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
  }
};



const micBtn = document.getElementById("mic-btn");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    micBtn.textContent = "🎙️"; // recording
  };

  recognition.onend = () => {
    micBtn.textContent = "🎤"; // done recording
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
}
