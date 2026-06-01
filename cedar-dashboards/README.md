# Cedar Training Center — Dashboards

Interactive prototype of the role-based dashboards (Admin, Staff, Student, Parent),
built as a self-contained HTML + React (via in-browser Babel) app.

## Files
```
Cedar Dashboards.html      ← open this in a browser
dash/
  data.js                  ← sample data (students, payments, etc.) + toast helper
  icons.jsx                ← line-icon set
  shared.jsx               ← shared UI: cards, charts, table, modal, avatar…
  tweaks-panel.jsx         ← the on-screen Tweaks panel (nav pattern / accent / density)
  admin.jsx                ← Admin pages
  staff.jsx                ← Instructor pages
  student.jsx              ← Student portal pages
  parent.jsx               ← Parent portal pages
  app.jsx                  ← login / role-select + app shell (sidebar & top-nav layouts)
logo.png                   ← brand mark (referenced by the header)
```

## Run it
Just open `Cedar Dashboards.html` in any modern browser. No build step or server needed.
(If your browser blocks local file scripts, serve the folder with any static server,
e.g. `python3 -m http.server` and visit the printed URL.)

## Notes
- This is a front-end prototype with mock data — it is not wired to Supabase.
  Use it as the visual/UX reference for the real dashboards in the Next.js app.
- The Tweaks panel (toolbar) lets you switch between sidebar and top-nav layouts,
  change the accent color, and adjust density.
