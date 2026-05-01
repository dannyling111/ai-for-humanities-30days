/* ============================================
   DeepSeek API 集成
   API Key 仅保存在用户本地浏览器（localStorage）
   ============================================ */

const AI = (() => {
  const KEY_STORAGE = "aih30_deepseek_key";
  const ENDPOINT = "https://api.deepseek.com/chat/completions";
  const MODEL = "deepseek-chat";
  let messages = [];

  function getKey() {
    return localStorage.getItem(KEY_STORAGE) || "";
  }

  function setKey(k) {
    localStorage.setItem(KEY_STORAGE, k);
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE);
  }

  function ensureSystemPrompt() {
    if (messages.length === 0) {
      messages.push({
        role: "system",
        content: "你是「AI 文科生 30 天」课程的助教。用户都是非开发者文科生。请用温暖、清晰、生活化的语言回答，避免堆术语。回答简洁，必要时用 Markdown 列表 / 表格。回答中文。"
      });
    }
  }

  async function ask(userText) {
    const key = getKey();
    if (!key) throw new Error("未配置 API Key");

    ensureSystemPrompt();
    messages.push({ role: "user", content: userText });

    // 截断历史（保留 system + 最近 10 轮）
    if (messages.length > 22) {
      messages = [messages[0]].concat(messages.slice(-20));
    }

    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      throw new Error("API 错误：" + resp.status + " - " + errTxt.slice(0, 200));
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || "(空回复)";
    messages.push({ role: "assistant", content: reply });
    return reply;
  }

  function reset() {
    messages = [];
  }

  return { getKey, setKey, clearKey, ask, reset };
})();

// UI 绑定
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("aiFab");
  const modal = document.getElementById("aiModal");
  const closeBtn = document.getElementById("aiModalClose");
  const backdrop = modal?.querySelector(".modal-backdrop");
  const keyArea = document.getElementById("aiKeyArea");
  const chatArea = document.getElementById("aiChatArea");
  const keyInput = document.getElementById("apiKeyInput");
  const keySave = document.getElementById("apiKeySave");
  const sendBtn = document.getElementById("aiSend");
  const inputEl = document.getElementById("aiInput");
  const messagesEl = document.getElementById("aiMessages");

  function showChat() {
    keyArea.classList.add("hidden");
    chatArea.classList.remove("hidden");
  }
  function showKey() {
    keyArea.classList.remove("hidden");
    chatArea.classList.add("hidden");
  }

  function openModal() {
    modal.classList.remove("hidden");
    if (AI.getKey()) showChat(); else showKey();
  }
  function closeModal() {
    modal.classList.add("hidden");
  }

  fab?.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);

  keySave?.addEventListener("click", () => {
    const k = keyInput.value.trim();
    if (!k.startsWith("sk-")) {
      alert("API Key 格式错误，应以 sk- 开头");
      return;
    }
    AI.setKey(k);
    keyInput.value = "";
    showChat();
    appendMsg("ai", "✅ Key 已保存（仅在你本地浏览器）。问我任何问题吧～");
  });

  function appendMsg(role, text) {
    const div = document.createElement("div");
    div.className = "ai-msg " + role;
    if (window.marked && role === "ai") {
      div.innerHTML = marked.parse(text);
    } else {
      div.textContent = text;
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMsg("user", text);
    inputEl.value = "";
    const loadingMsg = appendMsg("ai", "思考中...");
    try {
      const reply = await AI.ask(text);
      loadingMsg.innerHTML = window.marked ? marked.parse(reply) : reply;
    } catch (e) {
      loadingMsg.classList.add("error");
      loadingMsg.textContent = "⚠️ 出错了：" + e.message;
    }
  }

  sendBtn?.addEventListener("click", sendMessage);
  inputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  });

  // 快捷 chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      inputEl.value = chip.dataset.q;
      inputEl.focus();
    });
  });
});
