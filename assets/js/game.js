/* ============================================
   游戏化系统：进度 + 徽章 + 积分
   持久化到 localStorage
   ============================================ */

const GAME = (() => {
  const KEY = "aih30_progress";
  const def = {
    completedDays: [],     // [1, 2, 3]
    points: 0,
    streak: 0,
    lastVisit: null,
    earnedBadges: [],
    copiedTemplates: 0,
    visitedCases: [],
  };

  function load() {
    try {
      return Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch (e) {
      return { ...def };
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function get() {
    return load();
  }

  function markDone(day) {
    const s = load();
    if (!s.completedDays.includes(day)) {
      s.completedDays.push(day);
      s.points += 10;
      checkBadges(s);
      save(s);
      celebrate(`🎉 完成 Day ${day}！+10 分`);
    }
    return s;
  }

  function unmarkDone(day) {
    const s = load();
    s.completedDays = s.completedDays.filter(d => d !== day);
    save(s);
    return s;
  }

  function isDone(day) {
    return load().completedDays.includes(day);
  }

  function bumpTemplate() {
    const s = load();
    s.copiedTemplates += 1;
    s.points += 2;
    checkBadges(s);
    save(s);
    return s;
  }

  function visitCase(id) {
    const s = load();
    if (!s.visitedCases.includes(id)) {
      s.visitedCases.push(id);
      checkBadges(s);
      save(s);
    }
    return s;
  }

  function bumpStreak() {
    const s = load();
    const today = new Date().toISOString().slice(0, 10);
    if (s.lastVisit !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      s.streak = s.lastVisit === yesterday ? s.streak + 1 : 1;
      s.lastVisit = today;
      save(s);
    }
    return s;
  }

  function checkBadges(s) {
    const c = s.completedDays.length;
    const map = [
      { id: "starter", cond: c >= 1 },
      { id: "week1",   cond: c >= 7 },
      { id: "week2",   cond: c >= 14 },
      { id: "week3",   cond: c >= 21 },
      { id: "week4",   cond: c >= 28 },
      { id: "graduate", cond: c >= 30 },
      { id: "templator", cond: s.copiedTemplates >= 10 },
      { id: "explorer", cond: s.visitedCases.length >= 7 },
    ];
    map.forEach(b => {
      if (b.cond && !s.earnedBadges.includes(b.id)) {
        s.earnedBadges.push(b.id);
        const badge = COURSE.badges.find(x => x.id === b.id);
        if (badge) celebrate(`🏆 解锁徽章：${badge.icon} ${badge.name}`);
      }
    });
  }

  function celebrate(text) {
    const div = document.createElement("div");
    div.textContent = text;
    div.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #ff7a3d, #4a90e2);
      color: white; padding: 14px 28px; border-radius: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 1000; font-weight: 600;
      animation: slideDown 0.4s ease-out;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  }

  function reset() {
    if (confirm("确认重置所有进度吗？所有徽章和积分会清零。")) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  }

  function progressPct() {
    const s = load();
    return Math.round((s.completedDays.length / 30) * 100);
  }

  return { get, markDone, unmarkDone, isDone, bumpTemplate, visitCase, bumpStreak, reset, progressPct };
})();

// 注入动画
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from { transform: translate(-50%, -40px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
`;
document.head.appendChild(style);
