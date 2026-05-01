# 🌱 AI 文科生 30 天

> 为文科生 / 律师 / 市场 / 金融 / 教育 / 咨询从业者打造的 30 天 AI 通识课。
> 零代码、零基础、全实战。月底搭出你自己的 AI Agent。

🌐 **在线学习**：https://dannyling111.github.io/ai-for-humanities-30days/

## ✨ 课程特色

- **30 天分 4 周**：心智地基 → Prompt 工程 → 工具全家桶 → Agent 搭建
- **7 大行业案例**：律师 / 市场 / 金融 / 数据 / 教育 / 翻译 / 咨询
- **可复制模板**：30+ 节课、35+ 个开箱即用 Prompt
- **集成 DeepSeek**：网页内直接对话（自配 API Key）
- **课文朗读**：浏览器原生 TTS，倍速可调
- **游戏化**：进度条 / 积分 / 9 个徽章 / 连续打卡
- **思维导图**：每节课配 Mermaid 脑图
- **配套视频**：精选 B 站 / YouTube 优质视频

## 🚀 快速开始

### 在线使用
直接访问：https://dannyling111.github.io/ai-for-humanities-30days/

### 本地运行
```bash
git clone https://github.com/dannyling111/ai-for-humanities-30days.git
cd ai-for-humanities-30days
# 任何静态服务器即可
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 📚 课程目录

### 第 1 周 · 心智模型 · 看懂 AI 的脾气
- Day 1：AI 不是搜索引擎，它是会聊天的大脑
- Day 2：ChatGPT / DeepSeek / 豆包 / Claude 怎么选
- Day 3：第一次正经对话 · 5 个魔法句式
- Day 4：AI 为什么会一本正经胡说八道
- Day 5：把 AI 当实习生用 · Persona 心法
- Day 6：复制即用 · 50 个生活场景提示词
- Day 7：第一周复盘

### 第 2 周 · Prompt 工程 · 让 AI 听懂你
- Day 8：万能 4 件套 RTGO 公式
- Day 9：Chain of Thought 让 AI 一步步思考
- Day 10：Few-shot 给 AI 看几个例子
- Day 11：Self-Critique 让 AI 自己挑刺
- Day 12：输出格式控制
- Day 13：长文写作的拆段法
- Day 14：周末实战

### 第 3 周 · 工具全家桶
- Day 15：写作类 AI · 5 个写作伙伴
- Day 16：翻译 + 多语言
- Day 17：图片生成 · 即梦 / 可灵 / Midjourney
- Day 18：视频生成 · Sora / 可灵 / Runway
- Day 19：PPT 自动生成 · Gamma
- Day 20：数据处理 · 让 AI 帮你看 Excel
- Day 21：搜索升级 · Perplexity / 秘塔

### 第 4 周 · 搭你自己的 Agent
- Day 22：什么是 AI Agent
- Day 23：Coze 实战 · 30 分钟搭出第一个 Agent
- Day 24：Dify · 可视化工作流
- Day 25：n8n · 把 AI 接到所有工具
- Day 26：实战 1 · 个人助理 Agent
- Day 27：实战 2 · 内容创作 Agent
- Day 28：实战 3 · 客户服务 Agent
- Day 29：部署上线
- Day 30：毕业 · 90 天进阶路线图

## 💼 7 大行业案例

| 行业 | 痛点 | AI 方案 |
|------|------|---------|
| ⚖️ 律师 | 查法条费时 / 起草慢 | 案件初审 + 合同审查 + 客户咨询 三件套 |
| 📢 市场营销 | 选题枯竭 / 文案撞车 | 全链路 Agent 矩阵 |
| 💰 金融投资 | 财报阅读慢 / 信号繁杂 | 财报解读 + 公司画像 + 宏观雷达 |
| 📊 数据分析 | 不会 SQL / Python | AI 是文科生的"超级翻译器" |
| 📚 教育培训 | 备课耗时 / 个性化难 | 备课 + 答疑 + 学情分析 三件套 |
| 🌐 翻译语言 | 初稿慢 / 术语不一致 | AI 加速器 + 术语守卫者 |
| 🎯 战略咨询 | 案头研究累 / 报告慢 | BCG/麦肯锡式研究助理 |

## 🛠️ 技术栈

- **纯静态站点**：HTML + CSS + 原生 JavaScript
- **依赖**：[Mermaid](https://mermaid.js.org/) (脑图) + [marked](https://marked.js.org/) (Markdown)
- **AI 接口**：[DeepSeek Chat API](https://platform.deepseek.com/)
- **TTS**：浏览器原生 Web Speech API
- **存储**：localStorage（进度 + API Key 仅本地）

## 📂 目录结构

```
ai-for-humanities-30days/
├── index.html              # 入口
├── assets/
│   ├── css/main.css        # 全局样式
│   └── js/
│       ├── data.js         # 30 天课程数据
│       ├── cases.js        # 7 个行业案例
│       ├── templates.js    # 模板库
│       ├── game.js         # 游戏化系统
│       ├── tts.js          # 朗读
│       ├── deepseek.js     # AI 对话集成
│       ├── mindmap.js      # Mermaid 渲染
│       └── app.js          # 主路由 + 渲染
└── README.md
```

## 🔒 隐私

- **不收集任何用户数据**
- **DeepSeek API Key**：仅保存在你本地浏览器 localStorage，从未上传
- **学习进度**：仅本地浏览器，不同步到服务器
- **AI 对话**：直接调用 DeepSeek 官方 API，本站无中间服务器

## 🤝 贡献

欢迎 PR！如发现内容错误 / 有更好的案例 / 想加新行业，请提交 Issue 或 PR。

## 📜 License

MIT — 开源公益课程，欢迎转载、二次开发、商用，但请保留出处。

## 💡 致谢

- 灵感来源：Andrej Karpathy 的 LLM 教学系列
- Prompt 框架：OpenAI Prompt Engineering Guide
- 课程理念：受《最短路径教学法》启发

---

**🌟 觉得有用，给我们一个 star，让更多文科生不被时代落下。**
