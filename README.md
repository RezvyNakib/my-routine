# My Routine ✧

A calm, Bengali-first daily routine tracker that celebrates effort instead of punishing missed days.
Live: **https://rezvynakib.github.io/my-routine/**

> তুমি চেষ্টা করছো — এটাই তোমার সবচেয়ে বড় জয়।

## What it does

- **আজ** — today's routine + university classes, a live "now / next class" strip, and an appreciation card that changes with your progress (0% → 100%).
- **সপ্তাহ** — the full week at a glance, with every day expandable, per-day progress, classes, and your win note.
- **যাত্রা** — total XP, level, perfect days, best streak, a 90-day heatmap, a star jar, 15 achievements, and your wins journal.

Extras:

- XP & levels (10 XP per task/class, +30 XP per perfect day)
- Streaks, perfect-day stars, and confetti when the day is complete
- Class attendance tracking with live class status and countdowns
- Daily quote, rotating affirmations, and a "small win" journal
- Light / dark / auto theme
- Add your own tasks and edit the routine per weekday
- Export / import a JSON backup, or reset everything
- Everything is stored locally in your browser — no account, no server

## Current class schedule

| Day | Class | Section | Time | Room |
| --- | --- | --- | --- | --- |
| Sunday | Computer Aided Design & Drafting | B | 10:20 – 12:40 | DN0209 |
| Sunday | Network Security | D | 13:00 – 14:30 | 3119 |
| Sunday | Software Architecture & Design Patterns | A | 14:40 – 16:10 | 3103 |
| Monday | Engineering Management | D | 09:40 – 11:10 | 2102 |
| Monday | Software Quality & Testing | C | 11:20 – 12:50 | 3115 |
| Tuesday | Network Security | D | 13:00 – 14:30 | 3119 |
| Tuesday | Software Architecture & Design Patterns | A | 14:40 – 16:10 | 3103 |
| Wednesday | Engineering Management | D | 09:40 – 11:10 | 2102 |
| Wednesday | Software Quality & Testing | C | 11:20 – 12:50 | 3115 |
| Thursday – Saturday | — no classes — | | | |

## Editing the schedule

Open `assets/app.js` and look for `COURSES` and `SCHEDULE` near the top.

```js
const COURSES = {
  ns: { name: "Network Security", short: "NS", section: "D", room: "3119", color: "#6366f1", ink: "#4f46e5" },
  // ...
};

/* 0 = Sunday … 6 = Saturday */
const SCHEDULE = {
  2: [
    { course: "ns", start: "13:00", end: "14:30" },
    { course: "sad", start: "14:40", end: "16:10" },
  ],
  // ...
};
```

`COURSES` holds the display name, short badge, room, section, and colors.
`SCHEDULE` lists which courses happen on which weekday and at what time (24-hour `HH:MM`).
Days without classes simply use an empty array.

### Routine items

Use the ⚙️ button → **রুটিন সাজাও** to add or remove routine items for each weekday.
Defaults: sleep on time, academic study, Phitron 2 hours, nap/rest (Friday: time with your girlfriend).

## Run locally

No build step, no dependencies.

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000/
```

## Deploy

The site is plain static files. Push to `master` and GitHub Pages serves it directly:

```
index.html
assets/styles.css
assets/app.js
```

## Data & backups

State lives in `localStorage` under `my-routine-v3`. Older data in `routine-entries` / `routine-best-streak` is migrated automatically on first load.
Use ⚙️ → **ব্যাকআপ নামাও** before clearing your browser, and **ব্যাকআপ লোড করো** to restore.

## Files

- `index.html` — markup, hero, tabs, settings dialog
- `assets/styles.css` — design system, layout, light/dark themes
- `assets/app.js` — schedule, state, XP/levels, achievements, rendering, celebration
