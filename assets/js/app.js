/* ============================================
   主应用 · 路由 + 渲染
   ============================================ */

const App = (() => {
  const root = document.getElementById("app");

  // ---------- 工具 ----------
  function html(strings, ...values) {
    return strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ""), "");
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[m]);
  }

  // 兜底 Markdown 渲染器（在 marked.js 没加载时用）
  function fallbackMd(text) {
    var html = escape(text);
    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // 代码块
    html = html.replace(/```([\s\S]*?)```/g, function (_, c) {
      return '<pre><code>' + c + '</code></pre>';
    });
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 粗体 / 斜体
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    // 列表（粗略）
    html = html.replace(/^(\s*)- (.+)$/gm, '<li>$2</li>');
    html = html.replace(/^(\s*)\d+\. (.+)$/gm, '<li>$2</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, function (m) { return '<ul>' + m + '</ul>'; });
    // 引用
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // 段落
    html = html.split(/\n{2,}/).map(function (p) {
      if (/^<(h\d|ul|ol|pre|blockquote|table)/.test(p.trim())) return p;
      return p.trim() ? '<p>' + p.replace(/\n/g, '<br>') + '</p>' : '';
    }).join('\n');
    return html;
  }

  function md(text) {
    if (window.marked && typeof marked.parse === "function") return marked.parse(text);
    if (window.marked && typeof marked === "function") return marked(text);
    return fallbackMd(text);
  }

  function setActive(routeName) {
    document.querySelectorAll(".nav a").forEach(a => {
      a.classList.toggle("active", a.dataset.route === routeName);
    });
  }

  function updateProgress() {
    const fill = document.getElementById("progressFill");
    if (fill) fill.style.width = GAME.progressPct() + "%";
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add("copied");
      btn.textContent = "✓ 已复制";
      GAME.bumpTemplate();
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.textContent = "复制";
      }, 1800);
    });
  }

  function bindCopy(scope) {
    scope.querySelectorAll("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.previousElementSibling?.querySelector("code") || btn.previousElementSibling;
        const text = target?.innerText || btn.dataset.copyText || "";
        copyText(text, btn);
      });
    });
  }

  function renderTemplates(items) {
    if (!items || !items.length) return "";
    return items.map(t => `
      <div class="template-block">
        <span class="label">${escape(t.label || t.title)}</span>
        <pre><code>${escape(t.body)}</code></pre>
        <button class="copy-btn" data-copy>复制</button>
      </div>
    `).join("");
  }

  function renderVideos(items) {
    if (!items || !items.length) return "";
    return `
      <h3>📺 配套视频</h3>
      <div class="video-grid">
        ${items.map(v => `
          <a href="${escape(v.url)}" target="_blank" class="video-item">
            <div class="thumb">📺</div>
            <div class="info">
              <h4>${escape(v.title)}</h4>
              <span class="src">${escape(v.src || "视频")}</span>
            </div>
          </a>
        `).join("")}
      </div>
    `;
  }

  function renderMindmap(code) {
    if (!code) return "";
    return `
      <h3>🗺️ 知识脑图</h3>
      <div class="mermaid-wrap">
        <div data-mermaid="${escape(code)}">${escape(code)}</div>
      </div>
    `;
  }

  function renderQuiz(quiz, day) {
    if (!quiz) return "";
    return `
      <h3>📝 课后小测</h3>
      <div class="callout callout-tip" id="quiz-${day}">
        <p><strong>${escape(quiz.q)}</strong></p>
        <ul style="list-style:none;padding-left:0;margin-top:8px;">
          ${quiz.opts.map((o, i) => `
            <li style="margin-bottom:6px;">
              <button class="btn-secondary" data-quiz-opt="${i}" style="text-align:left;width:100%;">${String.fromCharCode(65 + i)}. ${escape(o)}</button>
            </li>
          `).join("")}
        </ul>
        <div class="quiz-result hidden" style="margin-top:10px;"></div>
      </div>
    `;
  }

  function bindQuiz(scope, quiz) {
    if (!quiz) return;
    scope.querySelectorAll("[data-quiz-opt]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.quizOpt);
        const result = scope.querySelector(".quiz-result");
        result.classList.remove("hidden");
        if (idx === quiz.ans) {
          result.innerHTML = `<strong style="color:var(--success)">✅ 答对！</strong><br>${escape(quiz.why || "")}`;
        } else {
          result.innerHTML = `<strong style="color:var(--primary-dark)">❌ 再想想</strong><br>${escape(quiz.why || "")}`;
        }
      });
    });
  }

  // ---------- 视图：首页 ----------
  function viewHome() {
    setActive("");
    const s = GAME.get();
    const done = s.completedDays.length;
    return `
      <div class="hero">
        <h1>1 个月学会 AI 全面操作</h1>
        <p class="lead">为文科生 / 律师 / 市场 / 金融 / 教育 / 咨询从业者打造的 30 天通识课。<br>零代码、零基础、零术语。每天 10 分钟，月底搭出你自己的 AI Agent。</p>
        <div class="cta">
          <a href="#/lesson/${done > 0 ? Math.min(done + 1, 30) : 1}" class="btn-primary">▶ ${done > 0 ? `继续 Day ${Math.min(done + 1, 30)}` : "从 Day 1 开始"}</a>
          <a href="#/path" class="btn-secondary">📖 查看完整学习地图</a>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-card"><span class="num">${done}</span><span class="label">已完成天数</span></div>
        <div class="stat-card"><span class="num">${s.points}</span><span class="label">学习积分</span></div>
        <div class="stat-card"><span class="num">${s.streak}</span><span class="label">连续天数</span></div>
        <div class="stat-card"><span class="num">${s.earnedBadges.length}</span><span class="label">已获徽章</span></div>
      </div>

      <h2 class="article" style="text-align:center;border:none;padding:0;margin:40px 0 20px;font-size:24px;">🗺️ 4 周路线图</h2>
      <div class="card-grid">
        ${COURSE.weeks.map(w => `
          <a href="#/path" class="card">
            <div style="font-size:32px;">${w.icon}</div>
            <h3>第 ${w.n} 周 · ${escape(w.title)}</h3>
            <p class="desc">${escape(w.summary)}</p>
          </a>
        `).join("")}
      </div>

      <h2 class="article" style="text-align:center;border:none;padding:0;margin:40px 0 20px;font-size:24px;">💼 7 大行业案例</h2>
      <div class="card-grid">
        ${CASES.map(c => `
          <a href="#/cases/${c.id}" class="card">
            <div style="font-size:28px;">${c.icon}</div>
            <h3>${escape(c.name)}</h3>
            <p class="meta">😩 ${escape(c.pain)}</p>
            <p class="desc">✅ ${escape(c.aiSolution)}</p>
          </a>
        `).join("")}
      </div>

      <h2 class="article" style="text-align:center;border:none;padding:0;margin:40px 0 20px;font-size:24px;">✨ 这门课的特别之处</h2>
      <div class="card-grid">
        <div class="card"><h3>🔊 课文可朗读</h3><p class="desc">不想看字？点右上角喇叭，直接朗读全文，倍速可调。</p></div>
        <div class="card"><h3>💬 内置 DeepSeek 对话</h3><p class="desc">看课中遇到问题？直接问右下角小机器人，立刻得到回答。</p></div>
        <div class="card"><h3>📋 模板一键复制</h3><p class="desc">每节课都有可直接拿走的 Prompt 模板，看到就复制。</p></div>
        <div class="card"><h3>🗺️ 自动脑图</h3><p class="desc">每节课配 Mermaid 思维导图，用图记知识点。</p></div>
        <div class="card"><h3>🏆 游戏化进度</h3><p class="desc">完成有积分、连击有奖励、毕业有徽章。</p></div>
        <div class="card"><h3>🎬 精选视频</h3><p class="desc">配套 B 站 / YouTube 优质视频，看完不够就去看。</p></div>
      </div>
    `;
  }

  // ---------- 视图：学习地图 ----------
  function viewPath() {
    setActive("path");
    const lessons = COURSE.lessons;
    return `
      <div class="article">
        <h1>🗺️ 30 天完整学习地图</h1>
        <p class="meta-row">从认知地基到搭出 Agent · 每天 10-25 分钟 · 累计完成度 ${GAME.progressPct()}%</p>
      </div>

      ${COURSE.weeks.map(w => {
        const weekLessons = lessons.filter(l => l.week === w.n);
        return `
          <div class="path-week">
            <h3>${w.icon} 第 ${w.n} 周 · ${escape(w.title)}</h3>
            <p class="summary">${escape(w.summary)}</p>
            <div class="path-days">
              ${weekLessons.map(l => `
                <a href="#/lesson/${l.day}" class="path-day ${GAME.isDone(l.day) ? "done" : ""}">
                  <div class="dnum">Day ${l.day} · ${l.minutes}min</div>
                  <div>${escape(l.title)}</div>
                </a>
              `).join("")}
            </div>
          </div>
        `;
      }).join("")}
    `;
  }

  // ---------- 视图：课程列表 ----------
  function viewLessons() {
    setActive("lessons");
    return `
      <div class="article">
        <h1>📚 课程目录</h1>
        <p class="meta-row">共 30 节 · 已完成 ${GAME.get().completedDays.length} 节</p>
      </div>
      <div class="card-grid">
        ${COURSE.lessons.map(l => `
          <a href="#/lesson/${l.day}" class="card lesson-card ${GAME.isDone(l.day) ? "done" : ""}">
            <span class="day-badge">Day ${l.day}</span>
            <h3>${escape(l.title)}</h3>
            <p class="meta">第 ${l.week} 周 · ${l.minutes} 分钟</p>
            <p class="desc">${escape(l.summary)}</p>
          </a>
        `).join("")}
      </div>
    `;
  }

  // ---------- 视图：单节课 ----------
  function viewLesson(day) {
    setActive("lessons");
    const lesson = COURSE.lessons.find(l => l.day === parseInt(day));
    if (!lesson) return `<div class="article"><h1>未找到第 ${escape(day)} 天</h1></div>`;

    const prev = COURSE.lessons.find(l => l.day === lesson.day - 1);
    const next = COURSE.lessons.find(l => l.day === lesson.day + 1);
    const isDone = GAME.isDone(lesson.day);

    return `
      <article class="article">
        <h1>Day ${lesson.day} · ${escape(lesson.title)}</h1>
        <p class="meta-row">
          <span>📅 第 ${lesson.week} 周</span>
          <span>⏱ ${lesson.minutes} 分钟</span>
          <span>💡 ${escape(lesson.sub || "")}</span>
        </p>

        <div class="callout callout-info">
          <strong>💎 一句话核心：</strong>${escape(lesson.summary)}
        </div>

        <div class="lesson-content">
          ${md(lesson.content)}
        </div>

        ${lesson.templates && lesson.templates.length ? `
          <h2>📋 可复制模板</h2>
          ${renderTemplates(lesson.templates)}
        ` : ""}

        ${renderMindmap(lesson.mindmap)}
        ${renderVideos(lesson.videos)}
        ${renderQuiz(lesson.quiz, lesson.day)}

        <div class="callout ${isDone ? "callout-info" : "callout-tip"}" style="text-align:center;">
          ${isDone
            ? `<strong>✅ 你已完成这一天</strong> · <a href="#" id="undoBtn">取消标记</a>`
            : `<strong>完成这一节后 →</strong> <button class="btn-primary" id="doneBtn">✓ 标记完成 (+10 分)</button>`}
        </div>

        <div class="lesson-nav">
          ${prev
            ? `<a href="#/lesson/${prev.day}" class="btn-secondary prev">← Day ${prev.day} ${escape(prev.title.slice(0, 14))}</a>`
            : `<span></span>`}
          ${next
            ? `<a href="#/lesson/${next.day}" class="btn-primary next">Day ${next.day} ${escape(next.title.slice(0, 14))} →</a>`
            : `<a href="#/profile" class="btn-primary next">查看毕业进度 →</a>`}
        </div>
      </article>
    `;
  }

  function bindLesson(day) {
    const lesson = COURSE.lessons.find(l => l.day === parseInt(day));
    if (!lesson) return;
    const doneBtn = document.getElementById("doneBtn");
    const undoBtn = document.getElementById("undoBtn");
    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        GAME.markDone(lesson.day);
        updateProgress();
        render();
      });
    }
    if (undoBtn) {
      undoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        GAME.unmarkDone(lesson.day);
        updateProgress();
        render();
      });
    }
    bindQuiz(root, lesson.quiz);
  }

  // ---------- 视图：行业案例 ----------
  function viewCases(activeId) {
    setActive("cases");
    activeId = activeId || CASES[0].id;
    GAME.visitCase(activeId);
    const c = CASES.find(x => x.id === activeId) || CASES[0];

    return `
      <div class="article">
        <h1>💼 7 大行业 AI 应用案例</h1>
        <p class="meta-row">挑你的职业 → 拿走可直接用的 Prompt 和 Agent 路线图</p>
      </div>

      <div class="tabs">
        ${CASES.map(c2 => `
          <a href="#/cases/${c2.id}" class="tab ${c2.id === activeId ? "active" : ""}">${c2.icon} ${escape(c2.name)}</a>
        `).join("")}
      </div>

      <article class="article">
        <div class="callout callout-info">
          <strong>${c.icon} ${escape(c.name)}</strong><br>
          <strong>痛点：</strong>${escape(c.pain)}<br>
          <strong>AI 方案：</strong>${escape(c.aiSolution)}
        </div>
        ${md(c.content)}
      </article>
    `;
  }

  // ---------- 视图：模板库 ----------
  function viewTemplates() {
    setActive("templates");
    // 汇总：精选包 + 全部课程模板 + 案例模板
    const lessonTemplates = [];
    COURSE.lessons.forEach(l => {
      if (l.templates && l.templates.length) {
        l.templates.forEach(t => lessonTemplates.push({ ...t, source: `Day ${l.day} · ${l.title}` }));
      }
    });

    return `
      <div class="article">
        <h1>📋 模板库 · 一键复制就能用</h1>
        <p class="meta-row">复制 ${GAME.get().copiedTemplates} 次 · 解锁 10 次得"模板收藏家"徽章</p>
      </div>

      ${TEMPLATE_PACKS.map(pack => `
        <h2 class="article">${escape(pack.title)}</h2>
        <p class="article" style="color:var(--text-soft);margin-bottom:14px;">${escape(pack.desc)}</p>
        ${renderTemplates(pack.items)}
      `).join("")}

      <h2 class="article">📚 课程内嵌模板（${lessonTemplates.length} 条）</h2>
      ${lessonTemplates.map(t => `
        <div class="template-block">
          <span class="label">${escape(t.source)} · ${escape(t.label || t.title)}</span>
          <pre><code>${escape(t.body)}</code></pre>
          <button class="copy-btn" data-copy>复制</button>
        </div>
      `).join("")}
    `;
  }

  // ---------- 视图：Agent ----------
  function viewAgent() {
    setActive("agent");
    return `
      <article class="article">
        <h1>🤖 AI Agent 搭建专区</h1>
        <p class="meta-row">第 4 周内容预览 + 完整工具对比 + 30 分钟入门指南</p>

        <div class="callout callout-info">
          <strong>什么是 AI Agent？</strong><br>
          ChatGPT 是助手（你问它答），Agent 是员工（你给目标，它自己拆任务、调工具、执行、交付）。
        </div>

        <h2>3 大主流平台对比</h2>
        <table>
          <thead>
            <tr><th>平台</th><th>难度</th><th>适合场景</th><th>是否需翻墙</th><th>推荐指数</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Coze</strong>（字节）</td><td>★ 入门</td><td>对话型 Bot / 公众号 / 飞书机器人</td><td>否</td><td>⭐⭐⭐⭐⭐</td></tr>
            <tr><td><strong>Dify</strong>（开源）</td><td>★★ 进阶</td><td>知识库问答 / 多步工作流</td><td>否</td><td>⭐⭐⭐⭐⭐</td></tr>
            <tr><td><strong>n8n</strong>（开源）</td><td>★★★ 中级</td><td>跨平台自动化 / 接 Gmail+Slack+...</td><td>否</td><td>⭐⭐⭐⭐</td></tr>
            <tr><td>FastGPT</td><td>★★ 进阶</td><td>知识库 + 国产模型</td><td>否</td><td>⭐⭐⭐⭐</td></tr>
            <tr><td>OpenAI Custom GPTs</td><td>★ 入门</td><td>个人 GPT 商店</td><td>是</td><td>⭐⭐⭐</td></tr>
          </tbody>
        </table>

        <h2>30 分钟搭出第一个 Agent · 路径图</h2>
        <div class="mermaid-wrap">
          <div data-mermaid="graph LR
            A[注册 Coze 账号] --> B[创建 Bot]
            B --> C[写人设]
            C --> D[加插件]
            D --> E[加知识库]
            E --> F[测试调优]
            F --> G[一键发布]
            G --> 飞[飞书]
            G --> 公[公众号]
            G --> API[API]"></div>
        </div>

        <h2>3 个文科生最该先做的 Agent</h2>
        <div class="card-grid">
          <a href="#/lesson/26" class="card">
            <h3>1. 个人早报 Agent</h3>
            <p class="desc">每天 8:00 自动推送"今日 3 大事 + 关心赛道新闻 + 关键 1 件事"</p>
          </a>
          <a href="#/lesson/27" class="card">
            <h3>2. 内容创作 Agent</h3>
            <p class="desc">输入主题，自动生成小红书/公众号/抖音 3 版 + 配图 prompt</p>
          </a>
          <a href="#/lesson/28" class="card">
            <h3>3. 客户服务 Agent</h3>
            <p class="desc">7×24 小时基于知识库答客户咨询，复杂的转人工</p>
          </a>
        </div>

        <h2>常见问题</h2>
        <h3>Q1：搭 Agent 需要会编程吗？</h3>
        <p>不需要。Coze / Dify 都是拖拽式的，整个 30 天课程里我们一行代码都不写。</p>

        <h3>Q2：免费的够用吗？</h3>
        <p>对个人用户 90% 场景够用。Coze 免费有大量调用额度。Dify 可以本地部署完全免费。</p>

        <h3>Q3：搭好了能商用吗？</h3>
        <p>可以。Coze 有商店可发布；Dify 自部署后完全自主；n8n 直接对接你的业务系统。</p>

        <div class="lesson-nav">
          <a href="#/lesson/22" class="btn-secondary prev">← Day 22 · 什么是 Agent</a>
          <a href="#/lesson/23" class="btn-primary next">Day 23 · Coze 实战 →</a>
        </div>
      </article>
    `;
  }

  // ---------- 视图：Playground ----------
  function viewPlayground() {
    setActive("playground");
    return `
      <article class="article">
        <h1>💬 AI 对话练习场</h1>
        <p class="meta-row">用 DeepSeek 实时回答任何问题 · 你的 API Key 只保存在自己浏览器</p>

        <div class="callout callout-tip">
          <strong>第一次使用？</strong>
          <ol>
            <li>点右下角紫色 💬 按钮</li>
            <li>注册 <a href="https://platform.deepseek.com/api_keys" target="_blank">DeepSeek API Key</a>（新用户有免费额度）</li>
            <li>粘贴 Key → 开始对话</li>
          </ol>
        </div>

        <h2>试试这些 Prompt</h2>
        <div class="card-grid">
          <div class="card"><h3>📝 写作助手</h3><p class="desc">"帮我写一封拒绝同事帮忙的微信，要委婉但坚定"</p></div>
          <div class="card"><h3>🧠 学习辅导</h3><p class="desc">"用 5 岁小孩能懂的话解释什么是通货膨胀"</p></div>
          <div class="card"><h3>🎯 决策助手</h3><p class="desc">"我在 Offer A 和 Offer B 之间纠结，用决策矩阵帮我打分"</p></div>
          <div class="card"><h3>📊 数据分析</h3><p class="desc">"我有这份销售数据，帮我用麦肯锡风格做诊断"</p></div>
          <div class="card"><h3>🌐 翻译润色</h3><p class="desc">"把这段中文翻成 SCI 期刊风英文摘要，250 词以内"</p></div>
          <div class="card"><h3>🎨 创意激发</h3><p class="desc">"给我 10 个适合做小红书的'秋天'选题，按潜力排"</p></div>
        </div>

        <div class="callout callout-warn" style="margin-top:24px;">
          <strong>⚠️ 隐私提醒</strong><br>
          - API Key 仅保存在你本地浏览器 localStorage<br>
          - 你输入的对话直接发送到 DeepSeek 官方 API（不经过本站服务器）<br>
          - 涉及隐私 / 敏感数据，请勿输入
        </div>
      </article>
    `;
  }

  // ---------- 视图：我的进度 ----------
  function viewProfile() {
    setActive("profile");
    const s = GAME.get();
    return `
      <article class="article">
        <h1>📊 我的学习进度</h1>
      </article>

      <div class="stat-row">
        <div class="stat-card"><span class="num">${s.completedDays.length} / 30</span><span class="label">完成天数</span></div>
        <div class="stat-card"><span class="num">${s.points}</span><span class="label">总积分</span></div>
        <div class="stat-card"><span class="num">${s.streak}</span><span class="label">连续天数</span></div>
        <div class="stat-card"><span class="num">${s.copiedTemplates}</span><span class="label">复制模板</span></div>
        <div class="stat-card"><span class="num">${s.visitedCases.length} / 7</span><span class="label">行业案例</span></div>
        <div class="stat-card"><span class="num">${s.earnedBadges.length} / ${COURSE.badges.length}</span><span class="label">徽章</span></div>
      </div>

      <h2 class="article">🏆 我的徽章</h2>
      <div class="badge-grid">
        ${COURSE.badges.map(b => `
          <div class="badge ${s.earnedBadges.includes(b.id) ? "earned" : "locked"}">
            <span class="icon">${b.icon}</span>
            <div class="name">${escape(b.name)}</div>
            <div class="desc">${escape(b.desc)}</div>
          </div>
        `).join("")}
      </div>

      <h2 class="article">📅 已完成的课程</h2>
      <div class="card-grid">
        ${s.completedDays.length === 0
          ? `<p class="article" style="grid-column:1/-1;color:var(--text-soft);">还没有完成课程。<a href="#/lesson/1">从 Day 1 开始 →</a></p>`
          : s.completedDays.sort((a,b) => a-b).map(d => {
              const l = COURSE.lessons.find(x => x.day === d);
              return l ? `
                <a href="#/lesson/${d}" class="card">
                  <span class="day-badge">Day ${d}</span>
                  <h3>${escape(l.title)}</h3>
                  <p class="desc">${escape(l.summary)}</p>
                </a>
              ` : "";
            }).join("")}
      </div>

      <div class="article" style="margin-top:40px;text-align:center;">
        <button class="btn-secondary" onclick="GAME.reset()">⚠️ 重置所有进度</button>
      </div>
    `;
  }

  // ---------- 路由 ----------
  function route() {
    const hash = location.hash.replace(/^#\/?/, "") || "";
    const [name, ...args] = hash.split("/");

    switch (name) {
      case "":
      case "home":
        return viewHome();
      case "path":
        return viewPath();
      case "lessons":
        return viewLessons();
      case "lesson":
        return viewLesson(args[0]);
      case "cases":
        return viewCases(args[0]);
      case "templates":
        return viewTemplates();
      case "agent":
        return viewAgent();
      case "playground":
        return viewPlayground();
      case "profile":
        return viewProfile();
      default:
        return viewHome();
    }
  }

  function render() {
    GAME.bumpStreak();
    root.innerHTML = route();
    bindCopy(root);
    updateProgress();

    // 单课页面绑定
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash.startsWith("lesson/")) {
      const day = hash.split("/")[1];
      bindLesson(day);
    }

    // 渲染脑图
    setTimeout(() => MM.render(root), 100);

    // 滚回顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    window.addEventListener("hashchange", render);

    // 移动端菜单
    const menuBtn = document.getElementById("menuToggle");
    const nav = document.querySelector(".nav");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        nav.classList.toggle("mobile-open");
      });
    }
    document.querySelectorAll(".nav a").forEach(a => {
      a.addEventListener("click", () => nav.classList.remove("mobile-open"));
    });

    render();
  }

  return { init, render };
})();

// 立刻启动（不等 CDN）
document.addEventListener("DOMContentLoaded", function () {
  App.init();
  // marked / mermaid 后续加载完成后，重新渲染当前页以升级体验
  window.addEventListener("markedReady", function () {
    console.log("[CDN] marked 已加载，重新渲染");
    App.render();
  });
  window.addEventListener("mermaidReady", function () {
    console.log("[CDN] mermaid 已加载");
    if (window.MM) MM.render(document.getElementById("app"));
  });
});

// 如果 DOMContentLoaded 已经过了（极端情况），立即跑
if (document.readyState !== "loading") {
  setTimeout(function () { if (!window.__appStarted) { window.__appStarted = true; App.init(); } }, 0);
}
