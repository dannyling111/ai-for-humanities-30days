/* ============================================
   Mermaid 脑图渲染辅助
   ============================================ */

const MM = (() => {
  let initialized = false;

  function init() {
    if (initialized || !window.mermaid) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      flowchart: { curve: "basis", padding: 20 },
      themeVariables: {
        primaryColor: "#fff5e0",
        primaryTextColor: "#2c2418",
        primaryBorderColor: "#ff7a3d",
        lineColor: "#e85a1a",
        secondaryColor: "#e3f0ff",
        tertiaryColor: "#fffaf5",
      },
    });
    initialized = true;
  }

  async function render(container, retryCount) {
    retryCount = retryCount || 0;
    init();
    if (!window.mermaid) {
      // 限制轮询次数（最多 10 次共 3 秒），避免 CDN 失败时死循环
      if (retryCount < 10) {
        setTimeout(() => render(container, retryCount + 1), 300);
      } else {
        // 兜底：把 mermaid 代码当代码块展示
        container.querySelectorAll(".mermaid-wrap [data-mermaid]").forEach(block => {
          if (block.querySelector("svg")) return;
          block.innerHTML = '<pre style="color:#888;font-size:12px;">脑图代码（mermaid 库未能加载）：\n' + (block.dataset.mermaid || "") + '</pre>';
        });
      }
      return;
    }
    const blocks = container.querySelectorAll(".mermaid-wrap [data-mermaid]");
    for (const block of blocks) {
      if (block.querySelector("svg")) continue; // 已渲染过
      try {
        const code = block.dataset.mermaid;
        const id = "mm-" + Math.random().toString(36).slice(2, 9);
        const { svg } = await mermaid.render(id, code);
        block.innerHTML = svg;
      } catch (e) {
        block.innerHTML = `<pre style="color:#c00;">脑图渲染失败：${e.message}</pre>`;
      }
    }
  }

  return { render, init };
})();
