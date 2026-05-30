// =============================================
// KNOWLEDGE BASE — edit this with your clinic info
// =============================================
const SYSTEM_PROMPT = `You are a friendly and helpful assistant for Malviya Dental Clinic. Answer patient queries conversationally and concisely.

Doctor: Dr. Deepesh Agrawal (BDS, MDS)
Timings: Mon-Sat, 9PM-9AM. Sunday 9AM-1PM.
Location: H.H.-75, Main Calgiri Road, Near Spring Dale's Institute, Calgiri Marg, Malviya Nagar, Jaipur, Rajasthan — 302017
Phone & WhatsApp: +91 93140 90002

Services & Pricing:
- Consultation: Free
- Cleaning & Scaling: ₹800
- Tooth Extraction: ₹500-₹1,500
- Root Canal: ₹3,000-₹6,000
- Dental Filling: ₹600-₹1,200
- Teeth Whitening: ₹4,000
- Braces & Aligners: ₹25,000 onwards
- Dental Implants: ₹30,000 per tooth
- Pediatric Dentistry: ₹500 onwards

Rules:
- Only answer questions related to this dental clinic
- Keep replies short and friendly
- For booking, direct them to call or WhatsApp
- Do not make up any information not listed above`;


// =============================================
// MODELS — fallback chain for reliability
// =============================================
const MODELS = [
  "gemini-2.5-flash"
];

// =============================================
// CHATBOT LOGIC — no need to edit below this
// =============================================
const history = [];
const defaultChips = ["Timings", "Services", "Pricing", "Book appointment", "Location"];

function toggleChat() {
  const popup = document.getElementById("chat-popup");
  popup.style.display = popup.style.display === "flex" ? "none" : "flex";
}

function addMsg(text, sender) {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = `chat-msg ${sender}`;
  div.textContent = text;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function showTyping() {
  const win = document.getElementById("chat-window");
  const div = document.createElement("div");
  div.className = "chat-msg bot";
  div.id = "typing-indicator";
  div.textContent = "Typing...";
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("typing-indicator");
  if (t) t.remove();
}

function setChips(arr) {
  const c = document.getElementById("chat-chips");
  c.innerHTML = "";
  arr.forEach(label => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = label;
    btn.onclick = () => sendMessage(label);
    c.appendChild(btn);
  });
}

async function callGemini(payload) {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://loquacious-alpaca-d88409.netlify.app//api/chat?model=${model}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      // Don't retry on auth errors
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        throw new Error(`Auth error ${res.status}`);
      }

      // On 429 or 5xx, try the next model
      if (!res.ok) {
        console.warn(`${model} failed with ${res.status}, trying next...`);
        continue;
      }

      const data = await res.json();
      console.log(`Response from ${model}:`, data);
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply;

    } catch (err) {
      if (err.message.startsWith("Auth error")) throw err;
      console.warn(`${model} threw an error, trying next...`, err);
    }
  }
  return null;
}

async function sendMessage(text) {
  if (!text.trim()) return;

  document.getElementById("chat-input").value = "";
  document.getElementById("chat-send").disabled = true;
  document.getElementById("chat-chips").innerHTML = "";

  addMsg(text, "user");
  history.push({ role: "user", content: text });
  showTyping();

  try {
    const reply = await callGemini({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    });

    removeTyping();
    addMsg(reply || "Sorry, I couldn't respond right now. Please call +91 93140 90002.", "bot");
    if (reply) history.push({ role: "assistant", content: reply });

  } catch (err) {
    removeTyping();
    console.error("Chat error:", err);
    addMsg("Something went wrong. Please call us at +91 93140 90002.", "bot");
  }

  document.getElementById("chat-send").disabled = false;
  setChips(defaultChips);
}

function handleSend() {
  const val = document.getElementById("chat-input").value.trim();
  if (val) sendMessage(val);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("chat-input").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSend();
  });

  addMsg("Hi! Ask me anything about SmileCare Dental Clinic — services, pricing, timings and more!", "bot");
  setChips(defaultChips);
});
