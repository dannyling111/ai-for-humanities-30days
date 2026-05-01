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

  async function render(container) {
    init();
    if (!window.mermaid) {
      // wait then retry
      setTimeout(() => render(container), 300);
      return;
    }
    const blocks = container.querySelectorAll(".mermaid-wrap [data-mermaid]");
    for (const block of blocks) {
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
