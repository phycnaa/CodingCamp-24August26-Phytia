---
inclusion: always
---

# Tech Stack

## Languages

- **HTML5** — semantic markup, `aria-*` attributes for accessibility.
- **CSS3** — custom properties (CSS variables) for theming, CSS Grid and Flexbox for layout.
- **Vanilla JavaScript (ES6+)** — no frameworks, no build tools, no transpilation.

## Constraints

- No React, Vue, Angular, or any other JS framework.
- No npm, no bundlers, no external libraries or CDN scripts.
- No backend server. The application runs entirely in the browser.
- Must work in modern Chrome, Firefox, Edge, and Safari.

## Data Persistence

Browser **Local Storage API** only. Five separate keys are used:

| Key | Value |
|---|---|
| `dashboard_tasks` | JSON array of task objects `{ id, text, completed }` |
| `dashboard_links` | JSON array of link objects `{ id, label, url }` |
| `dashboard_name` | Plain string — the user's display name |
| `dashboard_theme` | `"light"` or `"dark"` |
| `dashboard_pomodoro_duration` | `"15"`, `"25"`, `"30"`, or `"45"` |

## Browser APIs Used

- `localStorage` — persistent data storage.
- `setInterval` / `clearInterval` — live clock and Pomodoro countdown.
- `Notification` API — timer completion alert (with `alert()` fallback).
- `window.open` with `noopener,noreferrer` — safe external link handling.
- `URL` constructor — URL validation and normalisation.
