/* ============================================
   TTS · 文本朗读（基于浏览器 Web Speech API）
   ============================================ */

const TTS = (() => {
  let utter = null;
  let isPlaying = false;
  let isPaused = false;
  let currentText = "";

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    // 优先中文女声
    const zh = voices.find(v => /zh-CN/i.test(v.lang) && /Female|女|Yaoyao|Tracy|Ting/i.test(v.name));
    if (zh) return zh;
    return voices.find(v => /zh/i.test(v.lang)) || voices[0];
  }

  function speak(text, rate) {
    stop();
    if (!("speechSynthesis" in window)) {
      alert("您的浏览器不支持朗读功能。请用 Chrome / Edge 最新版。");
      return;
    }

    currentText = text;
    utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = parseFloat(rate || 1);
    utter.pitch = 1;
    utter.volume = 1;

    const v = pickVoice();
    if (v) utter.voice = v;

    utter.onstart = () => { isPlaying = true; isPaused = false; updateUI(); };
    utter.onend = () => { isPlaying = false; isPaused = false; updateUI(); };
    utter.onerror = () => { isPlaying = false; updateUI(); };

    speechSynthesis.speak(utter);
  }

  function pause() {
    if (isPlaying && !isPaused) {
      speechSynthesis.pause();
      isPaused = true;
      updateUI();
    } else if (isPaused) {
      speechSynthesis.resume();
      isPaused = false;
      updateUI();
    }
  }

  function stop() {
    speechSynthesis.cancel();
    isPlaying = false;
    isPaused = false;
    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById("ttsPause");
    if (btn) btn.textContent = isPaused ? "▶" : "⏸";
  }

  function readPage() {
    // 抓取主内容区可读文本
    const main = document.querySelector("#app .article") || document.querySelector("#app");
    if (!main) return;
    const text = main.innerText.replace(/\s+/g, " ").trim();
    const rate = document.getElementById("ttsRate").value;
    speak(text, rate);
  }

  return { speak, pause, stop, readPage };
})();

// 全局事件
document.addEventListener("DOMContentLoaded", () => {
  // Voice list 异步加载
  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = () => {};
  }

  const ttsBar = document.getElementById("ttsBar");
  const ttsToggle = document.getElementById("ttsToggle");
  const ttsPlay = document.getElementById("ttsPlay");
  const ttsPause = document.getElementById("ttsPause");
  const ttsStop = document.getElementById("ttsStop");

  if (ttsToggle) {
    ttsToggle.addEventListener("click", () => {
      ttsBar.classList.toggle("hidden");
    });
  }
  if (ttsPlay) ttsPlay.addEventListener("click", () => TTS.readPage());
  if (ttsPause) ttsPause.addEventListener("click", () => TTS.pause());
  if (ttsStop) ttsStop.addEventListener("click", () => TTS.stop());
});
