# Phase 10 Tracker — notes for Claude

Read `DESIGN.md` first. It holds the milestone status, code structure, save format, release process and the lessons from Swipe Snake and Flip 7. The full design doc lives in Stuart's Claude doc linked from `DESIGN.md`.

- House rule: no points. Track phase completion only; first to complete Phase 10 wins; a same-hand tie is a shared win by default.
- Styled with Stuart's Run & Set design system (navy theme). Keep its colour meanings: red 1–3, blue 4–6, green 7–9, yellow 10–12; yellow marks "now".
- Keep the app fully offline: no runtime network calls, fonts bundled in `fonts/`.
- On every release, bump `APP_VERSION` in `index.html` and `VERSION` in `sw.js` together, to the same number: the service worker refuses to install if they differ.
- Add any new file to `CORE` in `sw.js`.
- From Milestone 3, each milestone goes to a test branch first; merge to `main` only after Stuart has tried it.
- Never `preventDefault()` touches on buttons; keep the global `[hidden]` rule. No `alert()`/`confirm()`.
- Saves carry a version number (`SAVE_VERSION`); upgrade old saves in `migrate()`, never wipe them.
- Rules and FAQ text in the app are written in our own words, not copied.
- Update `DESIGN.md` (status, decision log, "Last updated") in the same commit as the change.
- UK spelling throughout. Commits as Stuart Goodwin.
