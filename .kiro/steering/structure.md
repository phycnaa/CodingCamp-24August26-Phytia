---
inclusion: always
---

# Project Structure

## Repository Layout

```
CodingCamp-24August26-Phytia/
├── .kiro/
│   └── steering/
│       ├── product.md      # What the product is and why
│       ├── tech.md         # Stack, constraints, and APIs
│       └── structure.md    # This file — layout and conventions
├── todo-life-dashboard/
│   ├── css/
│   │   └── style.css       # All styles — exactly one CSS file
│   ├── js/
│   │   └── script.js       # All logic — exactly one JS file
│   └── index.html          # Entry point — open directly in a browser
└── README.md
```

## Rules

- **One CSS file only** inside `css/`. Do not add a second stylesheet.
- **One JS file only** inside `js/`. Do not add a second script.
- Do not create `node_modules/`, `package.json`, or any build artefacts.
- Do not create additional HTML pages — the app is a single page.

## script.js Organisation

The JavaScript file is divided into eight clearly labelled sections:

1. **Local Storage Keys** — constant declarations.
2. **Greeting, Date & Time** — clock and greeting logic.
3. **Theme** — light/dark toggle and persistence (Challenge 1).
4. **Custom Name** — name save/load and greeting update (Challenge 2).
5. **Pomodoro Timer** — countdown, controls, duration selector (Challenge 3).
6. **To-Do List** — CRUD operations and edit modal.
7. **Quick Links** — add, open, delete, URL validation.
8. **Event Listeners** — all DOM event bindings in one place.
9. **Initialisation** — `init()` called on `DOMContentLoaded`.

## Naming Conventions

- HTML element IDs use `kebab-case` (e.g. `task-input`, `timer-minutes`).
- CSS classes use `kebab-case` (e.g. `.card-title`, `.btn-primary`).
- JS functions use `camelCase` (e.g. `addTask`, `renderLinks`, `loadTheme`).
- Local Storage keys use the prefix `dashboard_` followed by `snake_case`.

## How to Run

Open `todo-life-dashboard/index.html` directly in any modern browser. No server, no install step required.
