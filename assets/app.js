/* ============================================================
   My Routine — app logic
   Data lives only in this browser (localStorage).
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Constants
     ------------------------------------------------------------ */

  const STORAGE_KEY = "my-routine-v3";
  const LEGACY_ENTRIES = "routine-entries";
  const LEGACY_BEST = "routine-best-streak";

  const DAY_NAMES = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
  const DAY_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
  const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const MONTHS_SHORT = ["জানু", "ফেব্রু", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
  const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

  const bn = (v) => String(v).replace(/\d/g, (d) => BN_DIGITS[+d]);
  const esc = (v) =>
    String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const COURSES = {
    ns: { name: "Network Security", short: "NS", section: "D", room: "3119", color: "#6366f1", ink: "#4f46e5" },
    sad: { name: "Software Architecture & Design Patterns", short: "SAD", section: "A", room: "3103", color: "#8b5cf6", ink: "#7c3aed" },
    em: { name: "Engineering Management", short: "EM", section: "D", room: "2102", color: "#f59e0b", ink: "#8a5a00" },
    sqt: { name: "Software Quality & Testing", short: "SQT", section: "C", room: "3115", color: "#14b8a6", ink: "#0f766e" },
    cad: { name: "Computer Aided Design & Drafting", short: "CAD", section: "B", room: "DN0209", color: "#f43f5e", ink: "#be123c" },
  };

  /* 0 = Sunday … 6 = Saturday */
  const SCHEDULE = {
    0: [
      { course: "cad", start: "10:20", end: "12:40" },
      { course: "ns", start: "13:00", end: "14:30" },
      { course: "sad", start: "14:40", end: "16:10" },
    ],
    1: [
      { course: "em", start: "09:40", end: "11:10" },
      { course: "sqt", start: "11:20", end: "12:50" },
    ],
    2: [
      { course: "ns", start: "13:00", end: "14:30" },
      { course: "sad", start: "14:40", end: "16:10" },
    ],
    3: [
      { course: "em", start: "09:40", end: "11:10" },
      { course: "sqt", start: "11:20", end: "12:50" },
    ],
    4: [],
    5: [],
    6: [],
  };

  const PRAISE = [
    "একটা কাজ শেষ! ✨",
    "দারুণ যাচ্ছে!",
    "এটাই ছন্দ! ⚡",
    "তুমি পারছো!",
    "আরেক ধাপ এগিয়ে! 🚀",
    "নিজের জন্য সময় দিলে! 💛",
    "ছোট জয়, বড় অর্থ।",
    "এই তো — চালিয়ে যাও!",
    "গর্বের ব্যাপার! 🌟",
    "একটু একটু করেই হবে।",
  ];

  const AFFIRMATIONS = [
    "আমি প্রতিদিন নিজের চেয়ে একটু ভালো হচ্ছি।",
    "আমি আমার গতি নিয়ে গর্বিত।",
    "I'm proud of you for showing up today.",
    "আজ আমি যথেষ্ট করেছি।",
    "My consistency is my superpower.",
    "আমি চাপের মধ্যেও শিখছি।",
    "One step at a time is still forward.",
    "আমার ছোট ছোট জয়গুলো গুরুত্বপূর্ণ।",
    "আমি নিজের জন্য সময় বের করি।",
    "তুমি অনেক দূর এসেছো — থামো না।",
    "Perfect নয়, present হলেই হবে।",
    "আমি নিজের প্রতি দয়ালু থাকি।",
  ];

  const QUOTES = [
    { t: "ছোট ছোট ধাপ, অনেক দূরের যাত্রা।", a: "— My Routine" },
    { t: "Success is the sum of small efforts repeated day in and day out.", a: "— Robert Collier" },
    { t: "Perfect নয়, consistent হলেই হবে।", a: "— My Routine" },
    { t: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", a: "— Will Durant" },
    { t: "তুমি আজ যা করছো, কাল সেটাই তোমার ভিত্তি।", a: "— My Routine" },
    { t: "It does not matter how slowly you go as long as you do not stop.", a: "— Confucius" },
    { t: "একটা দিন খারাপ গেলে পুরো যাত্রা খারাপ হয় না।", a: "— My Routine" },
    { t: "You do not rise to the level of your goals. You fall to the level of your systems.", a: "— James Clear" },
    { t: "Discipline is choosing between what you want now and what you want most.", a: "— Abraham Lincoln" },
    { t: "ভয় পেলেও এগিয়ে যাওয়া — এটাই সাহস।", a: "— My Routine" },
    { t: "The secret of getting ahead is getting started.", a: "— Mark Twain" },
    { t: "Rest is part of the routine, not a break from it.", a: "— My Routine" },
    { t: "Fall seven times, stand up eight.", a: "— Japanese proverb" },
    { t: "আজকের 'পারছি না' কালকের 'পেরেছি' হবে।", a: "— My Routine" },
    { t: "Focus on the next step, not the whole staircase.", a: "— My Routine" },
    { t: "তুমি যতটা ভাবো, তার চেয়ে বেশি করছো।", a: "— My Routine" },
  ];

  const LEVEL_TITLES = ["শুরু", "ছন্দে", "অভ্যাস", "গতি", "শৃঙ্খলা", "ফোকাস", "দুর্দম", "রুটিন মাস্টার", "লিজেন্ড", "মিথিক্যাল"];

  const ACHIEVEMENTS = [
    { id: "first", icon: "🌱", title: "প্রথম পদক্ষেপ", desc: "প্রথম কাজটি শেষ করো", test: (s) => s.done >= 1 },
    { id: "three", icon: "✨", title: "ছন্দে ফিরছি", desc: "একদিনে ৩টি কাজ শেষ করো", test: (s) => s.maxDay >= 3 },
    { id: "perfect", icon: "🏅", title: "নিখুঁত দিন", desc: "একদিনের সব কাজ শেষ করো", test: (s) => s.perfect >= 1 },
    { id: "streak3", icon: "🔥", title: "৩ দিনের আগুন", desc: "টানা ৩ দিন নিখুঁত থাকো", test: (s) => s.best >= 3 },
    { id: "streak7", icon: "⚡", title: "এক সপ্তাহ", desc: "টানা ৭ দিনের স্ট্রিক", test: (s) => s.best >= 7 },
    { id: "streak21", icon: "🌙", title: "অভ্যাস তৈরি", desc: "টানা ২১ দিনের স্ট্রিক", test: (s) => s.best >= 21 },
    { id: "streak30", icon: "👑", title: "এক মাস", desc: "টানা ৩০ দিনের স্ট্রিক", test: (s) => s.best >= 30 },
    { id: "tasks50", icon: "💪", title: "৫০টি কাজ", desc: "মোট ৫০টি কাজ শেষ করো", test: (s) => s.done >= 50 },
    { id: "tasks100", icon: "💯", title: "১০০টি কাজ", desc: "মোট ১০০টি কাজ শেষ করো", test: (s) => s.done >= 100 },
    { id: "week", icon: "🌈", title: "সাতের সাত", desc: "এক সপ্তাহে ৭টি নিখুঁত দিন", test: (s) => s.weekFull >= 7 },
    { id: "early", icon: "🌅", title: "সকালের মানুষ", desc: "সকাল ৮টার আগে কাজ শুরু করো", test: (s) => s.early },
    { id: "classhero", icon: "🎓", title: "ক্লাস হিরো", desc: "একদিনে সব ক্লাসে উপস্থিতি", test: (s) => s.classPerfect >= 1 },
    { id: "writer", icon: "📝", title: "জয়ের লেখক", desc: "৭টি \"আজকের জয়\" লেখো", test: (s) => s.wins >= 7 },
    { id: "level5", icon: "🚀", title: "লেভেল ৫", desc: "লেভেল ৫-এ পৌঁছাও", test: (s) => s.level.level >= 5 },
    { id: "level10", icon: "🌟", title: "লেভেল ১০", desc: "লেভেল ১০-এ পৌঁছাও", test: (s) => s.level.level >= 10 },
  ];

  /* ------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------ */

  const pad2 = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const todayKey = () => keyOf(new Date());

  function parseKey(k) {
    const [y, m, d] = String(k).split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  function startOfWeek(base, offset) {
    const x = startOfDay(base);
    x.setDate(x.getDate() - x.getDay() + offset * 7);
    return x;
  }

  const utcOf = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const dayDiff = (a, b) => Math.round((utcOf(b) - utcOf(a)) / 86400000);

  const minutesOf = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  function fmtTime(hhmm) {
    let [h, m] = hhmm.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${bn(h)}:${bn(pad2(m))} ${ap}`;
  }

  function countdownText(mins) {
    if (mins < 1) return "এখনই";
    if (mins < 60) return `${bn(mins)} মিনিট পর`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${bn(h)} ঘণ্টা ${bn(m)} মিনিট পর` : `${bn(h)} ঘণ্টা পর`;
  }

  function hashOf(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  const pctOf = (st) => (st.total ? Math.round((st.done / st.total) * 100) : 0);

  function dateLabel(k) {
    const d = parseKey(k);
    return `${DAY_NAMES[d.getDay()]}, ${bn(d.getDate())} ${MONTHS[d.getMonth()]}`;
  }

  function shortDate(k) {
    const d = parseKey(k);
    return `${bn(d.getDate())} ${MONTHS_SHORT[d.getMonth()]}`;
  }

  /* ------------------------------------------------------------
     Routine defaults
     ------------------------------------------------------------ */

  function defaultRoutine() {
    const base = (sleep) => [
      { id: "sleep", text: `ঘুম সময়মতো (${sleep})` },
      { id: "study", text: "একাডেমিক পড়া" },
      { id: "phitron", text: "Phitron ২ ঘণ্টা" },
    ];
    return {
      0: [...base("রাত ১১:৩০")],
      1: [...base("রাত ১১:৩০")],
      2: [...base("রাত ১১:৩০")],
      3: [...base("রাত ১১:৩০")],
      4: [...base("রাত ১২:০০")],
      5: [...base("রাত ১২:০০")],
      6: [...base("রাত ১২:০০")],
    };
  }

  function blankState() {
    return {
      v: 3,
      entries: {},
      routine: defaultRoutine(),
      unlocked: {},
      theme: "auto",
      levelSeen: 1,
      created: Date.now(),
    };
  }

  let state = blankState();
  const openDays = new Set([todayKey()]);
  let weekOffset = 0;
  let editorDay = new Date().getDay();
  let currentTab = "today";
  let saveTimer = 0;

  /* ------------------------------------------------------------
     DOM refs
     ------------------------------------------------------------ */

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const el = {
    greeting: $("#greeting"),
    heroSub: $("#heroSub"),
    heroFocus: $("#heroFocus"),
    levelRing: $("#levelRing"),
    levelNum: $("#levelNum"),
    levelName: $("#levelName"),
    xpText: $("#xpText"),
    xpFill: $("#xpFill"),
    levelHint: $("#levelHint"),
    themeBtn: $("#themeBtn"),
    settingsBtn: $("#settingsBtn"),

    progressPill: $("#progressPill"),
    todayDate: $("#todayDate"),
    appreciationTitle: $("#appreciationTitle"),
    appreciationText: $("#appreciationText"),
    streakLine: $("#streakLine"),
    affirmText: $("#affirmText"),
    todayRing: $("#todayRing"),
    todayRingPct: $("#todayRingPct"),
    taskSub: $("#taskSub"),
    taskList: $("#taskList"),
    addTaskForm: $("#addTaskForm"),
    addTaskInput: $("#addTaskInput"),
    winInput: $("#winInput"),
    winStatus: $("#winStatus"),
    saveWin: $("#saveWin"),

    classCount: $("#classCount"),
    classSub: $("#classSub"),
    nowStrip: $("#nowStrip"),
    classList: $("#classList"),
    quoteText: $("#quoteText"),
    quoteAuthor: $("#quoteAuthor"),

    weekPrev: $("#weekPrev"),
    weekNext: $("#weekNext"),
    weekToday: $("#weekToday"),
    weekLabel: $("#weekLabel"),
    weekRange: $("#weekRange"),
    weekSummary: $("#weekSummary"),
    weekDays: $("#weekDays"),

    statsGrid: $("#statsGrid"),
    heatmap: $("#heatmap"),
    heatRange: $("#heatRange"),
    starJar: $("#starJar"),
    starCount: $("#starCount"),
    achievementsList: $("#achievementsList"),
    winsList: $("#winsList"),

    eventsCard: $("#eventsCard"),
    eventsDate: $("#eventsDate"),
    eventType: $("#eventType"),
    eventSubject: $("#eventSubject"),
    eventText: $("#eventText"),
    eventAddForm: $("#eventAddForm"),
    eventsList: $("#eventsList"),

    dialog: $("#settingsDialog"),
    closeSettings: $("#closeSettings"),
    themeSeg: $("#themeSeg"),
    routineDayChips: $("#routineDayChips"),
    routineEditor: $("#routineEditor"),
    routineAddForm: $("#routineAddForm"),
    routineAddInput: $("#routineAddInput"),
    exportBtn: $("#exportBtn"),
    importBtn: $("#importBtn"),
    importInput: $("#importInput"),
    resetBtn: $("#resetBtn"),

    toasts: $("#toasts"),
    confetti: $("#confetti"),
    footerYear: $("#footerYear"),
  };

  /* ------------------------------------------------------------
     Storage
     ------------------------------------------------------------ */

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Could not save routine", err);
    }
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 450);
  }

  function normalizeState(raw) {
    const base = blankState();
    const s = Object.assign(base, raw && typeof raw === "object" ? raw : {});
    s.v = 3;
    s.entries = raw && raw.entries && typeof raw.entries === "object" ? raw.entries : {};
    s.unlocked = raw && raw.unlocked && typeof raw.unlocked === "object" ? raw.unlocked : {};
    s.theme = raw && ["auto", "light", "dark"].includes(raw.theme) ? raw.theme : "auto";
    s.levelSeen = raw && Number.isFinite(raw.levelSeen) ? raw.levelSeen : 1;

    Object.keys(s.entries).forEach((k) => {
      const e = s.entries[k];
      if (!e || typeof e !== "object") return;
      if (!e.tasks || typeof e.tasks !== "object") e.tasks = {};
      if (!e.classes || typeof e.classes !== "object") e.classes = {};
      if (!Array.isArray(e.custom)) e.custom = [];
      if (typeof e.win !== "string") e.win = "";
      if (!e.events || typeof e.events !== "object") e.events = {};
    });

    const def = defaultRoutine();
    const routine = {};
    for (let i = 0; i < 7; i++) {
      const list = raw && raw.routine && Array.isArray(raw.routine[i]) ? raw.routine[i] : def[i];
      routine[i] = list
        .filter((item) => item && typeof item.text === "string" && item.text.trim())
        .map((item) => ({
          id: String(item.id || "t" + Math.random().toString(36).slice(2, 8)),
          text: String(item.text).slice(0, 90),
        }));
    }
    s.routine = routine;
    return s;
  }

  const openDays = new Set([todayKey()]);
  let weekOffset = 0;
  let editorDay = new Date().getDay();
  let currentTab = "today";
  let saveTimer = 0;

  function migrateLegacy() {
    let old = null;
    try {
      old = JSON.parse(localStorage.getItem(LEGACY_ENTRIES) || "null");
    } catch (err) {
      old = null;
    }
    if (!old || typeof old !== "object") return;

    const def = defaultRoutine();
    const entries = {};

    Object.keys(old).forEach((k) => {
      const v = old[k];
      if (!v || typeof v !== "object" || !/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      let weekday = 0;
      try {
        weekday = parseKey(k).getDay();
      } catch (err) {
        return;
      }
      const ids = (def[weekday] || []).map((x) => x.id);
      const tasks = {};
      (Array.isArray(v.checks) ? v.checks : []).forEach((checked, i) => {
        if (checked && ids[i]) tasks[ids[i]] = true;
      });
      const custom = (Array.isArray(v.extra) ? v.extra : []).map((x, i) => ({
        id: "m" + i,
        text: String(x && x.text ? x.text : "").slice(0, 90),
        done: !!(x && x.done),
      }));
      entries[k] = { tasks, classes: {}, custom, win: "", events: {} };
    });

    state = blankState();
    state.entries = entries;

    try {
      const best = JSON.parse(localStorage.getItem(LEGACY_BEST) || "null");
      if (Number.isFinite(best)) state.levelSeen = 1;
    } catch (err) {
      /* ignore */
    }
  }

  function loadState() {
    let raw = null;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (err) {
      raw = null;
    }
    if (raw && raw.entries) {
      state = normalizeState(raw);
    } else {
      state = blankState();
      try {
        migrateLegacy();
      } catch (err) {
        console.error("migration failed", err);
      }
    }
    applyTheme();
  }

  /* ------------------------------------------------------------
     Entries + stats
     ------------------------------------------------------------ */

  function getEntry(k, create) {
    let entry = state.entries[k];
    if (!entry) {
      if (!create) return null;
      entry = state.entries[k] = { tasks: {}, classes: {}, custom: [], win: "", events: {} };
    }
    if (!entry.tasks || typeof entry.tasks !== "object") entry.tasks = {};
    if (!entry.classes || typeof entry.classes !== "object") entry.classes = {};
    if (!Array.isArray(entry.custom)) entry.custom = [];
    if (typeof entry.win !== "string") entry.win = "";
    if (!entry.events || typeof entry.events !== "object") entry.events = {};
    return entry;
  }

  const routineFor = (k) => state.routine[parseKey(k).getDay()] || [];
  const classesFor = (k) => SCHEDULE[parseKey(k).getDay()] || [];

  function dayStats(k) {
    const e = getEntry(k);
    const routine = routineFor(k);
    const classes = classesFor(k);
    const custom = e ? e.custom : [];
    const doneR = e ? routine.filter((i) => e.tasks[i.id]).length : 0;
    const doneC = e ? classes.filter((c) => e.classes[c.course]).length : 0;
    const doneX = e ? custom.filter((c) => c.done).length : 0;
    const done = doneR + doneC + doneX;
    const total = routine.length + classes.length + custom.length;
    return {
      done,
      total,
      pct: total ? Math.round((done / total) * 100) : 0,
      doneR,
      totalR: routine.length,
      doneC,
      totalC: classes.length,
      doneX,
      totalX: custom.length,
    };
  }

  const isPerfect = (k) => {
    const s = dayStats(k);
    return s.total > 0 && s.done === s.total;
  };

  function currentStreak() {
    let cursor = startOfDay(new Date());
    if (!isPerfect(keyOf(cursor))) cursor = addDays(cursor, -1);
    let n = 0;
    for (let i = 0; i < 3650; i++) {
      if (!isPerfect(keyOf(cursor))) break;
      n++;
      cursor = addDays(cursor, -1);
    }
    return n;
  }

  function bestStreakFrom(perfectDates) {
    const sorted = Array.from(perfectDates).sort();
    let best = 0;
    let run = 0;
    let prev = null;
    sorted.forEach((k) => {
      run = prev && dayDiff(prev, k) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = k;
    });
    return best;
  }

  function levelFromXp(xp) {
    let level = 1;
    let need = 100;
    let floor = 0;
    while (xp >= floor + need && level < 50) {
      floor += need;
      level++;
      need = Math.round(need * 1.22) + 40;
    }
    const into = xp - floor;
    return {
      level,
      into,
      need,
      pct: Math.min(100, Math.round((into / need) * 100)),
      title: LEVEL_TITLES[level - 1] || "মিথিক্যাল",
    };
  }

  function collectStats() {
    let done = 0;
    let total = 0;
    let perfect = 0;
    let activeDays = 0;
    let wins = 0;
    let maxDay = 0;
    let classPerfect = 0;
    let early = false;
    const perfectDates = new Set();
    const weekCount = {};

    Object.keys(state.entries).forEach((k) => {
      const s = dayStats(k);
      done += s.done;
      total += s.total;

      const e = getEntry(k);
      if (s.total > 0 && s.done === s.total) {
        perfect++;
        perfectDates.add(k);
        const d = parseKey(k);
        const sunday = addDays(d, -d.getDay());
        const wk = keyOf(sunday);
        weekCount[wk] = (weekCount[wk] || 0) + 1;
      }
      if (s.done > 0) {
        activeDays++;
        maxDay = Math.max(maxDay, s.done);
        if (s.totalC > 0 && s.doneC === s.totalC) classPerfect++;
        if (e && e.first) {
          const h = new Date(e.first).getHours();
          if (h >= 4 && h < 8) early = true;
        }
      }
      if (e && typeof e.win === "string" && e.win.trim()) wins++;
    });

    let weekFull = 0;
    Object.keys(weekCount).forEach((wk) => {
      weekFull = Math.max(weekFull, weekCount[wk]);
    });

    const xp = done * 10 + perfect * 30;
    return {
      done,
      total,
      perfect,
      activeDays,
      wins,
      maxDay,
      classPerfect,
      early,
      best: bestStreakFrom(perfectDates),
      streak: currentStreak(),
      xp,
      level: levelFromXp(xp),
      weekFull,
      perfectDates,
    };
  }

  /* ------------------------------------------------------------
     Achievements
     ------------------------------------------------------------ */

  function syncAchievements(silent) {
    const s = collectStats();
    const newly = [];
    ACHIEVEMENTS.forEach((a) => {
      if (!state.unlocked[a.id] && a.test(s)) {
        state.unlocked[a.id] = Date.now();
        newly.push(a);
      }
    });
    if (newly.length) {
      save();
      if (!silent) {
        newly.slice(0, 3).forEach((a, i) => {
          setTimeout(() => toast(`অ্যাচিভমেন্ট: ${a.title}`, a.icon, 3800), i * 500);
        });
        celebrate();
      }
    }
    return newly;
  }

  function checkLevelUp(s) {
    if (s.level.level > (state.levelSeen || 1)) {
      state.levelSeen = s.level.level;
      save();
      toast(`লেভেল ${bn(s.level.level)} — ${s.level.title}! 🚀`, "🌟", 4200);
      celebrate();
    } else if (!state.levelSeen) {
      state.levelSeen = s.level.level;
    }
  }

  /* ------------------------------------------------------------
     Appreciation engine
     ------------------------------------------------------------ */

  const TIERS = {
    empty: [
      { title: "আজকের পাতা এখনো ফাঁকা", text: "নিচের কাজগুলো তোমার জন্য অপেক্ষা করছে। একটা ছোট কাজ বেছে নাও — শুরু করলেই বাকিটা সহজ লাগবে।" },
    ],
    zero: [
      { title: "শুরু করার সময় এখনই 🌱", text: "এখনো কোনো টিক পড়েনি — তাতে কিছু যায় আসে না। একটা কাজ বেছে নাও, মাত্র পাঁচ মিনিট দাও। শুরু করাটাই সবচেয়ে বড় সাহস।" },
      { title: "তুমি এখানে আছো — এটাই শুরু", text: "সব দিন সমান হয় না। আজ শুধু একটা ছোট কাজ করো। বাকি দিনটা তোমার নিজের জন্য।" },
    ],
    low: [
      { title: "শুরু করেছো — এটাই বড় কথা ✨", text: "শুরু করাটাই সবচেয়ে কঠিন অংশ ছিল। তুমি সেটা পারেছো। এখন শুধু একটা একটা করে এগোও, তাড়া নেই।" },
      { title: "প্রথম ধাপটা হয়ে গেছে", text: "লম্বা যাত্রাও এক ধাপ দিয়েই শুরু হয়। আজ যেটুকু পারছো, সেটুকুই যথেষ্ট — তুমি চেষ্টা করছো।" },
    ],
    mid: [
      { title: "অর্ধেকের বেশি — ছন্দে আছো ⚡", text: "তুমি এখন গতি ধরেছো। বাকি কাজগুলো একসাথে ভাবার দরকার নেই — শুধু পরের কাজটা করো।" },
      { title: "দারুণ এগোচ্ছো!", text: "অর্ধেক পথ পেরিয়ে এসেছো। এখন একটু পানি খাও, গভীর শ্বাস নাও, তারপর শেষ অংশটা। আমি জানি পারবে।" },
    ],
    high: [
      { title: "একদম শেষ ধাপে 🚀", text: "খুব অল্প বাকি! ক্লান্তি আসছে জানি, কিন্তু তুমি এত দূর এসেছো — শেষ টিকটাও দিয়ে দাও। আজকের তুমি কালকের তুমিকে ধন্যবাদ দেবে।" },
      { title: "প্রায় হয়ে গেছে!", text: "শেষ কয়েকটা কাজ বাকি। এখানেই বেশিরভাগ মানুষ থেমে যায় — তুমি তাদের একজন নও। শেষ করো।" },
    ],
    full: [
      { title: "আজ তুমি নিজের হিরো 🌟", text: "সবকিছু শেষ! এটা শুধু একটা টিক নয় — এটা নিজের সাথে করা প্রতিশ্রুতি রাখা। আজকের জন্য নিজেকে একটু প্রশংসা দাও।" },
      { title: "পুরো দিনটা তোমার ✅", text: "আজকের প্রতিটি কাজ শেষ। তুমি দেখিয়ে দিলে — ইচ্ছা থাকলে সময় বের হয়। আজ শুধু উপভোগ করো, কাল আবার শুরু।" },
  ],
  };

  function tierFor(pct, total) {
    if (!total) return "empty";
    if (pct === 0) return "zero";
    if (pct < 34) return "low";
    if (pct < 67) return "mid";
    if (pct < 100) return "high";
    return "full";
  }

  function renderAppreciation(s) {
    const t = dayStats(todayKey());
    const pct = pctOf(t);
    const tier = tierFor(pct, t.total);
    const options = TIERS[tier];
    const pick = options[hashOf(todayKey() + tier) % options.length];

    el.appreciationTitle.textContent = pick.title;
    el.appreciationText.textContent = pick.text;

    el.progressPill.textContent = `${bn(pct)}% সম্পন্ন`;
    el.todayRing.style.setProperty("--p", pct);
    el.todayRing.classList.toggle("is-full", pct === 100 && t.total > 0);
    el.todayRingPct.textContent = `${bn(pct)}%`;

    if (s.streak >= 2) {
      el.streakLine.hidden = false;
      el.streakLine.textContent = `🔥 ${bn(s.streak)} দিনের স্ট্রিক — অভ্যাসটা এখন তোমার হয়ে উঠছে।`;
    } else if (s.best >= 2) {
      el.streakLine.hidden = false;
      el.streakLine.textContent = `🏅 তোমার সেরা স্ট্রিক ${bn(s.best)} দিন — আবার সেখানে ফেরা যায়।`;
    } else {
      el.streakLine.hidden = true;
    }
  }

  /* ------------------------------------------------------------
     Class helpers
     ------------------------------------------------------------ */

  function classStatus(dateKey, entry) {
    const now = new Date();
    const isToday = keyOf(now) === dateKey;
    if (!isToday) {
      return parseKey(dateKey) < startOfDay(now)
        ? { label: "শেষ", past: true }
        : { label: "আসছে", future: true };
    }
    const mins = now.getHours() * 60 + now.getMinutes();
    const start = minutesOf(entry.start);
    const end = minutesOf(entry.end);
    if (mins >= start && mins < end) return { label: "চলছে", live: true };
    if (mins >= end) return { label: "শেষ", past: true };
    return { label: "আসছে" };
  }

  function nextClassFrom(now) {
    for (let off = 0; off < 8; off++) {
      const d = startOfDay(addDays(now, off));
      const list = SCHEDULE[d.getDay()] || [];
      const nowMin = off === 0 ? now.getHours() * 60 + now.getMinutes() : -1;
      for (let i = 0; i < list.length; i++) {
        if (minutesOf(list[i].start) > nowMin) {
          return { entry: list[i], date: d, days: off, minutes: off === 0 ? minutesOf(list[i].start) - nowMin : null };
        }
      }
    }
    return null;
  }

  function liveClassNow(now) {
    const list = SCHEDULE[now.getDay()] || [];
    const mins = now.getHours() * 60 + now.getMinutes();
    return list.find((c) => mins >= minutesOf(c.start) && mins < minutesOf(c.end)) || null;
  }

  function classRow(dateKey, entry) {
    const c = COURSES[entry.course];
    const e = getEntry(dateKey);
    const attended = !!(e && e.classes[entry.course]);
    const status = classStatus(dateKey, entry);
    const cls = ["class-row"];
    if (status.live) cls.push("is-live");
    if (status.past) cls.push("is-past");
    if (attended) cls.push("is-attended");
    const stateLabel = attended ? "উপস্থিত ✓" : status.label;

    return `<div class="${cls.join(" ")}" style="--course:${c.color};--course-ink:${c.ink}">
      <button class="class__toggle" type="button" data-task="class" data-date="${dateKey}" data-id="${entry.course}" aria-pressed="${attended}" title="${esc(c.name)} — উপস্থিতি টিক দাও">
        <span class="class__badge" aria-hidden="true">${c.short}</span>
        <span class="class__info">
          <span class="class__name">${esc(c.name)}</span>
          <span class="class__meta">${fmtTime(entry.start)} – ${fmtTime(entry.end)} · রুম ${bn(c.room)} · সেকশন ${esc(c.section)}</span>
        </span>
        <span class="class__state">${stateLabel}</span>
      </button>
    </div>`;
  }

  /* ------------------------------------------------------------
     Task rows
     ------------------------------------------------------------ */

  function taskRow(dateKey, kind, id, text, done, deletable) {
    return `<div class="task ${done ? "is-done" : ""}">
      <button class="task__toggle" type="button" data-task="${kind}" data-date="${dateKey}" data-id="${esc(id)}" aria-pressed="${done}">
        <span class="task__box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-11"/></svg></span>
        <span class="task__text">${esc(text)}</span>
      </button>
      <span class="task__xp">+${bn(10)} XP</span>
      ${deletable ? `<button class="task__del" type="button" data-del="${esc(id)}" data-date="${dateKey}" aria-label="মুছে ফেলো">×</button>` : ""}
    </div>`;
  }

  function dayBody(dateKey) {
    const e = getEntry(dateKey);
    const routine = routineFor(dateKey);
    const classes = classesFor(dateKey);
    const custom = e ? e.custom : [];
    let html = "";

    if (routine.length) {
      html += `<div class="task-group"><p class="task-group__label">প্রতিদিনের রুটিন</p>`;
      html += routine
        .map((it) => taskRow(dateKey, "routine", it.id, it.text, !!(e && e.tasks[it.id]), false))
        .join("");
      html += `</div>`;
    }

    if (classes.length) {
      html += `<div class="task-group"><p class="task-group__label">ক্লাস (${bn(classes.filter((c) => e && e.classes[c.course]).length)}/${bn(classes.length)})</p>`;
      html += classes.map((c) => classRow(dateKey, c)).join("");
      html += `</div>`;
    }

    if (custom.length) {
      html += `<div class="task-group"><p class="task-group__label">এক্সট্রা</p>`;
      html += custom.map((c) => taskRow(dateKey, "custom", c.id, c.text, c.done, true)).join("");
      html += `</div>`;
    }

    if (!routine.length && !classes.length && !custom.length) {
      html += `<div class="empty-note">এই দিনে এখনো কিছু নেই — সেটিংস থেকে রুটিন যোগ করো।</div>`;
    }

    if (e && e.win && e.win.trim()) {
      html += `<div class="day__note"><strong>আজকের জয়</strong>${esc(e.win)}</div>`;
    }

    return html;
  }

  /* ------------------------------------------------------------
     Smart focus / "what to do now"
     ------------------------------------------------------------ */

  function renderHeroFocus() {
    if (!el.heroFocus) return;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const day = now.getDay();
    const classes = SCHEDULE[day] || [];
    const live = classes.find((c) => mins >= minutesOf(c.start) && mins < minutesOf(c.end));
    if (live) {
      const c = COURSES[live.course];
      el.heroFocus.textContent = `এখন ক্লাস: ${c.name} · শেষ ${fmtTime(live.end)} · রুম ${bn(c.room)}`;
      return;
    }
    const next = nextClassFrom(now);
    if (next && next.days === 0) {
      const c = COURSES[next.entry.course];
      el.heroFocus.textContent = `পরবর্তী: ${c.name} · ${fmtTime(next.entry.start)} · ${countdownText(next.minutes)}`;
      return;
    }
    if (next && next.days === 1) {
      const c = COURSES[next.entry.course];
      el.heroFocus.textContent = `আগামীকাল: ${c.name} · ${DAY_NAMES[next.date.getDay()]} ${fmtTime(next.entry.start)}`;
      return;
    }
    const k = todayKey();
    const e = getEntry(k);
    const routine = routineFor(k);
    const pending = routine.find((it) => !(e && e.tasks[it.id]));
    if (pending) {
      el.heroFocus.textContent = `এখন করার কাজ: ${pending.text}`;
      return;
    }
    const st = dayStats(k);
    if (st.total > 0 && st.done === st.total) {
      el.heroFocus.textContent = "আজকের সব কাজ শেষ — ছোট্ট জয়টা উপভোগ করো ✨";
      return;
    }
    if (pending) return;
    el.heroFocus.textContent = "নিজের গতি অনুযায়ী আগাও — যতটুকু পারো, সেটাই যথেষ্ট";
  }

  function greetingFor(hour) {
    if (hour >= 5 && hour < 12) return "শুভ সকাল";
    if (hour >= 12 && hour < 16) return "শুভ দুপুর";
    if (hour >= 16 && hour < 19) return "শুভ বিকেল";
    if (hour >= 19 && hour < 22) return "শুভ সন্ধ্যা";
    return "শুভ রাত্রি";
  }

  function renderHero(s) {
    const now = new Date();
    el.greeting.textContent = `${greetingFor(now.getHours())}, Nakib`;

    const t = dayStats(todayKey());
    const pct = pctOf(t);
    if (!t.total) {
      el.heroSub.textContent = "আজকের ছোট ছোট ধাপগুলোই তোমাকে গড়ছে।";
    } else if (pct === 100) {
      el.heroSub.textContent = "আজকের সব কাজ শেষ — নিজেকে একটু গর্বিত বোধ করতে দাও।";
    } else {
      el.heroSub.textContent = `আজ ${bn(t.done)}/${bn(t.total)} কাজ শেষ — বাকিটা একটু একটু করেই।`;
    }
    renderHeroFocus();

    el.levelRing.style.setProperty("--p", s.level.pct);
    el.levelNum.textContent = bn(s.level.level);
    el.levelName.textContent = `লেভেল ${bn(s.level.level)} · ${s.level.title}`;
    el.xpText.textContent = `${bn(s.xp)} XP · ${bn(s.level.into)}/${bn(s.level.need)}`;
    el.xpFill.style.width = s.level.pct + "%";
    el.levelHint.textContent = `${bn(Math.max(0, s.level.need - s.level.into))} XP বাকি পরের লেভেলে`;
  }

  /* ------------------------------------------------------------
     Render: today
     ------------------------------------------------------------ */

  function renderToday(s) {
    const k = todayKey();
    const t = dayStats(k);
    const e = getEntry(k);

    el.todayDate.textContent = dateLabel(k);
    renderAppreciation(s);

    el.taskSub.textContent = t.total
      ? `${bn(t.done)} / ${bn(t.total)} সম্পন্ন · ${bn(t.totalR)} রুটিন + ${bn(t.totalC)} ক্লাস`
      : "আজকের রুটিন খালি";

    const routine = routineFor(k);
    const custom = e ? e.custom : [];
    let html = "";

    if (routine.length) {
      html += `<div class="task-group"><p class="task-group__label">প্রতিদিনের রুটিন</p>`;
      html += routine
        .map((it) => taskRow(k, "routine", it.id, it.text, !!(e && e.tasks[it.id]), false))
        .join("");
      html += `</div>`;
    }

    if (custom.length) {
      html += `<div class="task-group"><p class="task-group__label">আজকের এক্সট্রা</p>`;
      html += custom.map((c) => taskRow(k, "custom", c.id, c.text, c.done, true)).join("");
      html += `</div>`;
    }

    if (!routine.length && !custom.length) {
      html += `<div class="empty-note">আজকের রুটিন এখনো সাজানো হয়নি — সেটিংস থেকে আইটেম যোগ করো, অথবা নিচে একটা কাজ লেখো।</div>`;
    }

    el.taskList.innerHTML = html;

    const classes = classesFor(k);
    el.classCount.textContent = `${bn(classes.length)}টি`;
    el.classSub.textContent = classes.length
      ? `${bn(t.doneC)}/${bn(t.totalC)} উপস্থিতি · টিক দিলে গণনা হবে`
      : "আজ ক্লাস নেই";

    if (classes.length) {
      el.classList.innerHTML = classes.map((c) => classRow(k, c)).join("");
    } else {
      const next = nextClassFrom(new Date());
      let extra = "";
      if (next) {
        extra = `<div style="margin-top:10px;font-size:11.5px;color:var(--muted);">পরের ক্লাস: ${DAY_NAMES[next.date.getDay()]} · ${fmtTime(next.entry.start)} · ${COURSES[next.entry.course].name}</div>`;
      }
      el.classList.innerHTML = `<div class="class-empty"><span>🌿</span>আজ কোনো ক্লাস নেই — নিজের জন্য একটু সময়।${extra}</div>`;
    }

    el.nowStrip.innerHTML = renderNowStrip();

    if (document.activeElement !== el.winInput) {
      el.winInput.value = (e && e.win) || "";
      el.winStatus.textContent = e && e.win ? "সংরক্ষিত ✓" : "";
    }
  }

  function renderNowStrip() {
    const now = new Date();
    const live = liveClassNow(now);
    if (live) {
      const c = COURSES[live.course];
      return `<div class="now-strip now-strip--live">
        <span class="now-strip__dot" aria-hidden="true"></span>
        <span>এখন চলছে <strong>${esc(c.name)}</strong> · রুম ${bn(c.room)} · শেষ ${fmtTime(live.end)}</span>
      </div>`;
    }
    const next = nextClassFrom(now);
    if (!next) {
      return `<div class="now-strip"><span class="now-strip__dot now-strip__dot--idle" style="background:var(--muted);box-shadow:0 0 0 4px color-mix(in srgb, var(--muted) 16%, transparent)"></span><span>আজ আর কোনো ক্লাস নেই — নিজের জন্য একটু সময় নাও।</span></div>`;
    }
    const c = COURSES[next.entry.course];
    if (next.days === 0) {
      return `<div class="now-strip">
        <span class="now-strip__dot now-strip__dot--idle" style="background:var(--sun);box-shadow:0 0 0 4px color-mix(in srgb, var(--sun) 18%, transparent)" aria-hidden="true"></span>
        <span>পরের ক্লাস <strong>${esc(c.name)}</strong> · ${fmtTime(next.entry.start)} · ${countdownText(next.minutes)}</span>
      </div>`;
    }
    return `<div class="now-strip">
      <span class="now-strip__dot now-strip__dot--idle" style="background:var(--sun);box-shadow:0 0 0 4px color-mix(in srgb, var(--sun) 18%, transparent)" aria-hidden="true"></span>
      <span>পরের ক্লাস <strong>${esc(c.name)}</strong> · ${DAY_NAMES[next.date.getDay()]} ${fmtTime(next.entry.start)}</span>
    </div>`;
  }

  /* ------------------------------------------------------------
     Render: week
     ------------------------------------------------------------ */

  function renderWeek(s) {
    const start = startOfWeek(new Date(), weekOffset);
    const end = addDays(start, 6);
    const today = startOfDay(new Date());

    el.weekLabel.textContent = `${bn(start.getDate())} ${MONTHS_SHORT[start.getMonth()]} – ${bn(end.getDate())} ${MONTHS_SHORT[end.getMonth()]}`;
    el.weekRange.textContent =
      weekOffset === 0 ? "চলতি সপ্তাহ" : weekOffset < 0 ? `${bn(Math.abs(weekOffset))} সপ্তাহ আগে` : `${bn(weekOffset)} সপ্তাহ পরে`;
    el.weekToday.hidden = weekOffset === 0;

    let done = 0;
    let total = 0;
    let perfect = 0;
    let counted = 0;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const k = keyOf(d);
      const st = dayStats(k);
      const pct = pctOf(st);
      const full = st.total > 0 && st.done === st.total;
      const isFuture = d > today;
      const isToday = k === todayKey();

      if (d <= today) {
        counted++;
        done += st.done;
        total += st.total;
        if (full) perfect++;
      }

      days.push(`<details class="day ${isToday ? "is-today" : ""} ${full ? "is-perfect" : ""}" data-date="${k}" ${openDays.has(k) ? "open" : ""}>
        <summary>
          <span class="day__date"><strong>${DAY_NAMES[d.getDay()]}</strong><span>${bn(d.getDate())} ${MONTHS_SHORT[d.getMonth()]}${isToday ? " · আজ" : ""}</span></span>
          <span class="day__bar" aria-hidden="true"><i style="width:${isFuture ? 0 : pct}%"></i></span>
          <span class="day__pct">${isFuture ? "—" : `${bn(pct)}%`}</span>
          <span class="day__chev" aria-hidden="true">›</span>
        </summary>
        <div class="day__body">${dayBody(k)}</div>
      </details>`);
    }

    const pct = total ? Math.round((done / total) * 100) : 0;
    el.weekSummary.innerHTML = `
      <div class="mini-stat"><strong>${counted ? `${bn(pct)}%` : "—"}</strong><span>এই সপ্তাহের অগ্রগতি</span></div>
      <div class="mini-stat"><strong>${bn(perfect)}/${bn(counted || 7)}</strong><span>নিখুঁত দিন</span></div>
      <div class="mini-stat"><strong>${bn(done)}</strong><span>শেষ করা কাজ</span></div>
    `;

    el.weekDays.innerHTML = days.join("");
  }

  /* ------------------------------------------------------------
     Render: journey
     ------------------------------------------------------------ */

  function renderJourney(s) {
    const tiles = [
      { icon: "⚡", value: bn(s.xp), label: "মোট XP" },
      { icon: "✅", value: bn(s.done), label: "শেষ করা কাজ" },
      { icon: "🏅", value: bn(s.perfect), label: "নিখুঁত দিন" },
      { icon: "🔥", value: bn(s.best), label: "সেরা স্ট্রিক" },
    ];
    el.statsGrid.innerHTML = tiles
      .map((t) => `<div class="stat"><div class="stat__icon" aria-hidden="true">${t.icon}</div><strong>${t.value}</strong><span>${t.label}</span></div>`)
      .join("");

    renderHeatmap();

    el.starCount.textContent = `${bn(s.perfect)} তারা`;
    if (s.perfect > 0) {
      const shown = Math.min(s.perfect, 48);
      let html = "";
      for (let i = 0; i < shown; i++) {
        html += `<span style="animation-delay:${i * 16}ms" aria-hidden="true">⭐</span>`;
      }
      if (s.perfect > shown) html += `<span class="small muted">+${bn(s.perfect - shown)}</span>`;
      el.starJar.innerHTML = html;
    } else {
      el.starJar.innerHTML = `<div class="empty-note" style="flex:1;">প্রথম নিখুঁত দিনটা আসছে — আজই হতে পারে। 🌱</div>`;
    }

    el.achievementsList.innerHTML = ACHIEVEMENTS.map((a) => {
      const unlocked = !!state.unlocked[a.id];
      return `<div class="ach ${unlocked ? "is-unlocked" : ""}">
        <span class="ach__icon" aria-hidden="true">${a.icon}</span>
        <div class="ach__body">
          <p class="ach__title">${a.title}</p>
          <p class="ach__desc">${a.desc}</p>
        </div>
        <span class="ach__lock" aria-label="${unlocked ? "আনলকড" : "লকড"}">${unlocked ? "✓" : "🔒"}</span>
      </div>`;
    }).join("");

    const wins = Object.keys(state.entries)
      .filter((k) => {
        const e = state.entries[k];
        return e && typeof e.win === "string" && e.win.trim();
      })
      .sort()
      .reverse()
      .slice(0, 8);

    if (wins.length) {
      el.winsList.innerHTML = wins
        .map((k) => {
          const e = state.entries[k];
          return `<div class="win-item">
            <span class="win-item__star" aria-hidden="true">🌟</span>
            <div><p>${esc(e.win)}</p><time datetime="${k}">${shortDate(k)} · ${DAY_NAMES[parseKey(k).getDay()]}</time></div>
          </div>`;
        })
        .join("");
    } else {
      el.winsList.innerHTML = `<div class="empty-note">এখনো কোনো জয় লেখা হয়নি। আজ রাতে একটা ছোট জয় লিখে রাখো — ভবিষ্যতে পড়ে ভালো লাগবে।</div>`;
    }
  }

  function renderHeatmap() {
    const end = startOfDay(new Date());
    let start = addDays(end, -90);
    start = addDays(start, -start.getDay());

    const weeks = [];
    let cursor = new Date(start);

    while (cursor <= end) {
      const cells = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(cursor, i);
        const k = keyOf(d);
        const future = d > end;
        const st = dayStats(k);
        const pct = pctOf(st);
        let lvl = 0;
        if (!future && st.total) {
          if (pct >= 100) lvl = 4;
          else if (pct >= 67) lvl = 3;
          else if (pct >= 34) lvl = 2;
          else if (pct > 0) lvl = 1;
        }
        const label = future ? "" : `${bn(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} — ${bn(st.done)}/${bn(st.total)} কাজ`;
        cells.push(`<span class="hm-cell l${lvl}${future ? " is-future" : ""}" title="${esc(label)}" aria-label="${esc(label)}"></span>`);
      }
      weeks.push(`<div class="heatmap__week">${cells.join("")}</div>`);
      cursor = addDays(cursor, 7);
    }

    el.heatmap.innerHTML = weeks.join("");
    el.heatRange.textContent = `${bn(start.getDate())} ${MONTHS_SHORT[start.getMonth()]} – ${bn(end.getDate())} ${MONTHS_SHORT[end.getMonth()]}`;
  }

  /* ------------------------------------------------------------
     Events calendar / quizzes (per-date notes)
     ------------------------------------------------------------ */

  function getEvents(k) {
    const e = getEntry(k);
    if (!e.events || typeof e.events !== "object") e.events = {};
    return e.events;
  }

  function renderEventsPanel() {
    if (!el.eventsList || !el.eventsDate) return;
    const k = el.eventsDate.value || todayKey();
    const events = getEvents(k);
    const items = Object.keys(events).map((id) => ({ id, ...events[id] })).sort((a, b) => String(a.text).localeCompare(String(b.text), "bn"));
    if (!items.length) {
      el.eventsList.innerHTML = `<div class="empty-note">এই তারিখে কোনো ইভেন্ট/কুইজ যোগ করা হয়নি।</div>`;
      return;
    }
    el.eventsList.innerHTML = items.map((it) => `<div class="event-item">
      <div class="event-item__top">
        <span class="event-item__tag">${it.type === "quiz" ? "কুইজ" : "ইভেন্ট"}</span>
        <button class="task__del" type="button" data-del-event="${esc(it.id)}" data-event-date="${k}" aria-label="মুছে ফেলো">×</button>
      </div>
      <p class="event-item__text">${esc(it.text)}</p>
      <div class="event-item__meta">${it.subject ? `বিষয়: ${esc(it.subject)}` : ""}</div>
    </div>`).join("");
  }

  function renderAll() {
    const s = collectStats();
    renderHero(s);
    renderToday(s);
    renderWeek(s);
    renderJourney(s);
    checkLevelUp(s);
    renderHeroFocus();
    if (el.eventsDate) renderEventsPanel();
  }

  /* ------------------------------------------------------------
     Actions
     ------------------------------------------------------------ */

  function restoreFocus(info) {
    if (!info) return;
    try {
      const scope = document.querySelector(".panel.is-active") || document;
      const node = scope.querySelector(
        `[data-task="${info.kind}"][data-date="${info.dateKey}"][data-id="${CSS.escape(info.id)}"]`
      ) || document.querySelector(
        `[data-task="${info.kind}"][data-date="${info.dateKey}"][data-id="${CSS.escape(info.id)}"]`
      );
      if (node) node.focus({ preventScroll: true });
    } catch (err) {
      /* ignore */
    }
  }

  function toggleTask(dateKey, kind, id) {
    const e = getEntry(dateKey, true);
    let checked = false;

    if (kind === "routine") {
      e.tasks[id] = !e.tasks[id];
      checked = !!e.tasks[id];
    } else if (kind === "class") {
      e.classes[id] = !e.classes[id];
      checked = !!e.classes[id];
    } else if (kind === "custom") {
      const item = e.custom.find((x) => x.id === id);
      if (!item) return;
      item.done = !item.done;
      checked = item.done;
    } else {
      return;
    }

    if (checked && !e.first) e.first = new Date().toISOString();

    const beforePct = pctOf(dayStats(dateKey));
    save();

    if (checked) {
      const afterPct = pctOf(dayStats(dateKey));
      if (afterPct === 100 && beforePct < 100 && !e.celebrated) {
        e.celebrated = Date.now();
        save();
        celebrate();
        toast("আজকের সব কাজ শেষ! তুমি দুর্দান্ত 🌟", "🏆", 4400);
      } else if (beforePct < 50 && afterPct >= 50) {
        toast("অর্ধেকের বেশি শেষ — চালিয়ে যাও! 💪", "⚡", 2400);
      } else {
        toast(randomOf(PRAISE), "✨", 1500);
      }
    }

    const active = document.activeElement;
    const wasInsideTask = active && active.closest("[data-task]");
    const focusInfo = wasInsideTask
      ? { kind, id, dateKey }
      : null;

    syncAchievements();
    renderAll();
    restoreFocus(focusInfo);
  }

  function removeCustom(dateKey, id) {
    const e = getEntry(dateKey);
    if (!e) return;
    const idx = e.custom.findIndex((x) => x.id === id);
    if (idx === -1) return;
    e.custom.splice(idx, 1);
    save();
    renderAll();
    toast("কাজটা মুছে ফেলা হলো", "🗑️", 1800);
  }

  function addEvent() {
    if (!el.eventsDate || !el.eventText) return;
    const k = el.eventsDate.value;
    if (!k) return;
    const text = el.eventText.value.trim();
    if (!text) return;
    const e = getEntry(k, true);
    if (!e.events || typeof e.events !== "object") e.events = {};
    const id = "ev" + Date.now().toString(36);
    e.events[id] = {
      type: el.eventType ? el.eventType.value : "quiz",
      text: text.slice(0, 120),
      subject: el.eventSubject ? el.eventSubject.value.trim().slice(0, 40) : "",
      created: Date.now(),
    };
    save();
    if (el.eventText) el.eventText.value = "";
    if (el.eventSubject) el.eventSubject.value = "";
    renderEventsPanel();
    toast("ইভেন্ট/কুইজ যোগ করা হয়েছে", "📌", 2000);
  }

  function removeEvent(dateKey, id) {
    const e = getEntry(dateKey);
    if (!e || !e.events || !e.events[id]) return;
    delete e.events[id];
    save();
    renderEventsPanel();
    toast("মুছে ফেলা হয়েছে", "🗑️", 1600);
  }

  /* ------------------------------------------------------------
     Tabs
     ------------------------------------------------------------ */

  function switchTab(name, updateHash) {
    if (!["today", "week", "journey"].includes(name)) name = "today";
    currentTab = name;

    $$(".tab").forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
    });

    $$(".panel").forEach((panel) => {
      const on = panel.id === "panel-" + name;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });

    if (name === "journey") {
      const s = collectStats();
      renderJourney(s);
    }
    if (name === "week") {
      const s = collectStats();
      renderWeek(s);
    }

    if (updateHash) {
      try {
        history.replaceState(null, "", "#" + name);
      } catch (err) {
        /* ignore */
      }
    }
  }

  /* ------------------------------------------------------------
     Theme
     ------------------------------------------------------------ */

  function resolvedDark() {
    if (state.theme === "dark") return true;
    if (state.theme === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme() {
    const dark = resolvedDark();
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (el.themeBtn) {
      el.themeBtn.textContent = dark ? "☀️" : "🌙";
      el.themeBtn.title = dark ? "লাইট মোড" : "ডার্ক মোড";
      el.themeBtn.setAttribute("aria-label", dark ? "লাইট মোড" : "ডার্ক মোড");
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#121016" : "#6d5ae6");
    $$("[data-theme-choice]").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.themeChoice === state.theme);
    });
  }

  /* ------------------------------------------------------------
     Settings: routine editor
     ------------------------------------------------------------ */

  function renderRoutineEditor() {
    el.routineDayChips.innerHTML = DAY_NAMES.map(
      (name, i) =>
        `<button class="daychip ${i === editorDay ? "is-active" : ""}" type="button" data-day="${i}">${DAY_SHORT[i]}</button>`
    ).join("");

    const list = state.routine[editorDay] || [];
    if (!list.length) {
      el.routineEditor.innerHTML = `<div class="empty-note">এই দিনে কোনো রুটিন নেই — নিচে যোগ করো।</div>`;
    } else {
      el.routineEditor.innerHTML = list
        .map(
          (item) => `<div class="editor__row">
            <span>${esc(item.text)}</span>
            <button type="button" data-remove-routine="${esc(item.id)}" aria-label="মুছে ফেলো">×</button>
          </div>`
        )
        .join("");
    }
  }

  /* ------------------------------------------------------------
     Toast + confetti
     ------------------------------------------------------------ */

  function toast(text, icon, ms) {
    if (!el.toasts) return;
    const node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = `<span class="toast__icon" aria-hidden="true">${icon || "✨"}</span><span>${text}</span>`;
    el.toasts.appendChild(node);
    while (el.toasts.children.length > 3) el.toasts.firstElementChild.remove();
    requestAnimationFrame(() => node.classList.add("is-in"));
    setTimeout(() => {
      node.classList.remove("is-in");
      setTimeout(() => node.remove(), 320);
    }, ms || 2600);
  }

  const confetti = {
    canvas: el.confetti,
    ctx: null,
    raf: 0,
    parts: [],
  };

  function resizeConfetti() {
    if (!confetti.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confetti.canvas.width = Math.floor(window.innerWidth * dpr);
    confetti.canvas.height = Math.floor(window.innerHeight * dpr);
    confetti.canvas.style.width = window.innerWidth + "px";
    confetti.canvas.style.height = window.innerHeight + "px";
    if (!confetti.ctx) confetti.ctx = confetti.canvas.getContext("2d");
    confetti.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function confettiTick() {
    const ctx = confetti.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = confetti.parts.length - 1; i >= 0; i--) {
      const p = confetti.parts[i];
      p.vy += p.g;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.0055;

      if (p.life <= 0 || p.y > window.innerHeight + 40) {
        confetti.parts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }

    if (confetti.parts.length) {
      confetti.raf = requestAnimationFrame(confettiTick);
    } else {
      confetti.raf = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function celebrate() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    resizeConfetti();
    const colors = ["#6d5ae6", "#9b6dff", "#ff8a65", "#ffb020", "#1ea672", "#ec4899", "#38bdf8"];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.34;

    for (let i = 0; i < 130; i++) {
      confetti.parts.push({
        x: cx + (Math.random() - 0.5) * 160,
        y: cy + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 11 - 3,
        g: 0.2 + Math.random() * 0.14,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.32,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        shape: Math.random() < 0.4 ? "circle" : "rect",
      });
    }

    if (!confetti.raf) confettiTick();
  }

  /* ------------------------------------------------------------
     Quote + affirmations
     ------------------------------------------------------------ */

  function renderDailyQuote() {
    const now = new Date();
    const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const q = QUOTES[day % QUOTES.length];
    el.quoteText.textContent = q.t;
    el.quoteAuthor.textContent = q.a;
  }

  let affirmIdx = 0;
  function rotateAffirmation() {
    if (!el.affirmText) return;
    el.affirmText.classList.add("is-fading");
    setTimeout(() => {
      affirmIdx = (affirmIdx + 1) % AFFIRMATIONS.length;
      el.affirmText.textContent = AFFIRMATIONS[affirmIdx];
      el.affirmText.classList.remove("is-fading");
    }, 420);
  }

  /* ------------------------------------------------------------
     Export / import / reset
     ------------------------------------------------------------ */

  function exportData() {
    const payload = Object.assign({}, state, { exportedAt: new Date().toISOString() });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-routine-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("ব্যাকআপ ফাইল নামানো হয়েছে", "📦", 2400);
  }

  async function importData(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || !data.entries || typeof data.entries !== "object") {
        throw new Error("invalid");
      }
      if (!confirm("বর্তমান ডেটার জায়গায় এই ব্যাকআপ বসিয়ে দেওয়া হবে। নিশ্চিত?")) return;
      state = normalizeState(data);
      save();
      applyTheme();
      syncAchievements(true);
      renderAll();
      renderRoutineEditor();
      toast("ব্যাকআপ লোড হয়েছে ✓", "📥", 2600);
    } catch (err) {
      toast("ফাইলটা পড়া গেল না — সঠিক ব্যাকআপ ফাইল বেছে নাও", "⚠️", 3400);
    }
  }

  function resetData() {
    if (!confirm("সব ডেটা মুছে যাবে — কাজ, স্ট্রিক, জয়ের ডায়েরি সব। তুমি নিশ্চিত?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_ENTRIES);
      localStorage.removeItem(LEGACY_BEST);
    } catch (err) {
      /* ignore */
    }
    state = blankState();
    save();
    openDays.clear();
    openDays.add(todayKey());
    weekOffset = 0;
    applyTheme();
    renderAll();
    renderRoutineEditor();
    el.dialog.close();
    toast("নতুন করে শুরু — চলো, আবার এগোই 🌱", "🌱", 3000);
  }

  /* ------------------------------------------------------------
     Events
     ------------------------------------------------------------ */

  function initEvents() {
    $$(".tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab, true));
    });

    $(".tabs").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const tabs = $$(".tab");
      const idx = tabs.findIndex((b) => b.classList.contains("is-active"));
      const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      switchTab(tabs[next].dataset.tab, true);
    });

    if (el.eventAddForm) {
      el.eventAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addEvent();
      });
    }
    if (el.eventsDate) {
      el.eventsDate.value = todayKey();
      el.eventsDate.addEventListener("change", renderEventsPanel);
      renderEventsPanel();
    }

    document.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-task]");
      if (toggle) {
        e.preventDefault();
        toggleTask(toggle.dataset.date, toggle.dataset.task, toggle.dataset.id);
        return;
      }
      const del = e.target.closest("[data-del]");
      if (del && !e.target.closest("[data-del-event]")) {
        e.preventDefault();
        removeCustom(del.dataset.date, del.dataset.del);
        return;
      }
      const delE = e.target.closest("[data-del-event]");
      if (delE) {
        e.preventDefault();
        removeEvent(delE.dataset.eventDate, delE.dataset.delEvent);
      }
    });

    el.addTaskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (addCustom(el.addTaskInput.value)) {
        el.addTaskInput.value = "";
        renderAll();
        toast("নতুন কাজ যোগ হলো — তুমি পারবে!", "📝", 2200);
        el.addTaskInput.focus();
      }
    });

    el.saveWin.addEventListener("click", () => {
      const e2 = getEntry(todayKey(), true);
      e2.win = el.winInput.value.trim().slice(0, 240);
      save();
      el.winStatus.textContent = e2.win ? "সংরক্ষিত ✓" : "";
      renderJourney(collectStats());
      renderWeek(collectStats());
      toast(e2.win ? "জয়টা লিখে রাখা হলো 🌟" : "জয়ের ঘরটা খালি রাখা হলো", "💛", 2200);
    });

    el.winInput.addEventListener("input", () => {
      el.winStatus.textContent = "লেখা হচ্ছে...";
      const e2 = getEntry(todayKey(), true);
      e2.win = el.winInput.value.slice(0, 240);
      saveSoon();
    });

    el.winInput.addEventListener("blur", () => {
      const e2 = getEntry(todayKey(), true);
      e2.win = el.winInput.value.trim().slice(0, 240);
      save();
      el.winStatus.textContent = e2.win ? "সংরক্ষিত ✓" : "";
    });

    el.weekPrev.addEventListener("click", () => {
      weekOffset--;
      renderWeek(collectStats());
    });
    el.weekNext.addEventListener("click", () => {
      weekOffset++;
      renderWeek(collectStats());
    });
    el.weekToday.addEventListener("click", () => {
      weekOffset = 0;
      openDays.add(todayKey());
      renderWeek(collectStats());
    });

    el.weekDays.addEventListener(
      "toggle",
      (e) => {
        const d = e.target;
        if (!d || !d.dataset || !d.dataset.date) return;
        if (d.open) openDays.add(d.dataset.date);
        else openDays.delete(d.dataset.date);
      },
      true
    );

    el.themeBtn.addEventListener("click", () => {
      state.theme = resolvedDark() ? "light" : "dark";
      applyTheme();
      save();
      toast(state.theme === "dark" ? "ডার্ক মোড চালু 🌙" : "লাইট মোড চালু ☀️", "🎨", 1600);
    });

    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (state.theme === "auto") applyTheme();
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }

    /* settings */
    el.settingsBtn.addEventListener("click", () => {
      editorDay = new Date().getDay();
      renderRoutineEditor();
      if (typeof el.dialog.showModal === "function") el.dialog.showModal();
      else el.dialog.setAttribute("open", "");
    });

    el.closeSettings.addEventListener("click", () => el.dialog.close());

    el.dialog.addEventListener("click", (e) => {
      if (e.target === el.dialog) el.dialog.close();
    });

    el.themeSeg.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme-choice]");
      if (!btn) return;
      state.theme = btn.dataset.themeChoice;
      applyTheme();
      save();
    });

    el.routineDayChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-day]");
      if (!btn) return;
      editorDay = Number(btn.dataset.day);
      renderRoutineEditor();
    });

    el.routineEditor.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-routine]");
      if (!btn) return;
      const id = btn.dataset.removeRoutine;
      state.routine[editorDay] = state.routine[editorDay].filter((x) => x.id !== id);
      save();
      renderRoutineEditor();
      renderAll();
    });

    el.routineAddForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = el.routineAddInput.value.trim();
      if (!text) return;
      state.routine[editorDay].push({
        id: "t" + Date.now().toString(36),
        text: text.slice(0, 90),
      });
      el.routineAddInput.value = "";
      save();
      renderRoutineEditor();
      renderAll();
      toast("রুটিনে নতুন আইটেম যোগ হলো", "➕", 2000);
    });

    el.exportBtn.addEventListener("click", exportData);
    el.importBtn.addEventListener("click", () => el.importInput.click());
    el.importInput.addEventListener("change", () => {
      const file = el.importInput.files && el.importInput.files[0];
      importData(file).finally(() => {
        el.importInput.value = "";
      });
    });
    el.resetBtn.addEventListener("click", resetData);

    /* misc */
    window.addEventListener("resize", () => {
      if (confetti.parts.length) resizeConfetti();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        renderAll();
        renderDailyQuote();
      }
    });
  }

  /* ------------------------------------------------------------
     Boot
     ------------------------------------------------------------ */

  function boot() {
    loadState();
    save(); // persist defaults / migrated data

    if (el.footerYear) el.footerYear.textContent = `© ${bn(new Date().getFullYear())}`;

    renderDailyQuote();

    // Pick a random affirmation to start with, then rotate.
    affirmIdx = Math.floor(Math.random() * AFFIRMATIONS.length);
    el.affirmText.textContent = AFFIRMATIONS[affirmIdx];
    setInterval(rotateAffirmation, 13000);

    syncAchievements(true);
    renderAll();
    if (el.eventsDate) {
      el.eventsDate.value = todayKey();
      renderEventsPanel();
    }

    initEvents();

    const hash = (location.hash || "").replace("#", "");
    if (["week", "journey"].includes(hash)) switchTab(hash, false);

    // Keep class status / countdown fresh without touching inputs.
    setInterval(() => {
      if (currentTab !== "today") return;
      const active = document.activeElement;
      if (active && el.classList.contains(active)) return;

      const s = collectStats();
      const k = todayKey();
      el.nowStrip.innerHTML = renderNowStrip();
      const classes = classesFor(k);
      if (classes.length) el.classList.innerHTML = classes.map((c) => classRow(k, c)).join("");
      const st = dayStats(k);
      el.classSub.textContent = classes.length
        ? `${bn(st.doneC)}/${bn(st.totalC)} উপস্থিতি · টিক দিলে গণনা হবে`
        : "আজ ক্লাস নেই";
      el.todayDate.textContent = dateLabel(k);
      if (s.streak >= 2) {
        el.streakLine.hidden = false;
        el.streakLine.textContent = `🔥 ${bn(s.streak)} দিনের স্ট্রিক — অভ্যাসটা এখন তোমার হয়ে উঠছে।`;
      }
      renderHeroFocus();
    }, 45000);

    setInterval(() => {
      if (document.hidden) return;
      renderHeroFocus();
    }, 60000);
  }

  boot();
})();
