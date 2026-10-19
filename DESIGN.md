# Phase 10 Tracker — design notes

Last updated: 19 Oct 2026 (v4)

The full design doc (house rules, screens, milestones, lessons) is Stuart's Claude doc "Phase 10 Tracker — Design Doc":
https://claude.ai/code/artifact/1d0d6d11-134c-4fba-97fd-f5ec57a9b50d

This file is the in-repo summary, kept up to date with each release.

## 1. What it is

A phone web app that tracks who is on which phase during a family game of Phase 10. One phone keeps track for the whole table; no live sync. Installed from GitHub Pages to the home screen and fully offline.

**House rule:** no points. Each hand records only who completed their phase. The first player to complete Phase 10 wins; if several complete it in the same hand, it's a shared win by default, with "Pick one winner" as an option.

Live at: https://sgoodwin-cloud.github.io/phase10-tracker/

## 2. Milestone status

| Milestone | Status |
|---|---|
| 1. Phase tracker (setup, standings, record hand, winner, undo, saves, Rules & FAQ) | Built in v1 |
| 2. Installable and offline (manifest, icons, service worker, update banner, Share button, install tip) | Built in v1; installed on Stuart's iPhone 13 |
| 3. History and corrections (hand grid, edit any hand, dealer marker refinements, rematch) | Not started (dealer badge and Rematch already in v1) |
| 4. Variants (first to N phases, even only, odd only) | Not started |
| 5. Polish (winner moment, remembered names, stats, past results) | Not started |
| 6. Optional points scoring | Parked; may never be built |

## 3. Files

| File | Purpose |
|---|---|
| `index.html` | The whole app: markup, CSS (Run & Set tokens), app script, then the service worker / update script at the bottom |
| `sw.js` | Service worker: offline cache, update handling |
| `manifest.webmanifest` | Home screen name ("Phase 10"), standalone, portrait |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons (white "Phase 10" card over the four-colour stripe) |
| `fonts/Jost-Variable.woff2` | Jost, bundled from the Run & Set design system |
| `DESIGN.md` | This file |
| `CLAUDE.md` | Pointer for Claude sessions |

## 4. Code structure (`index.html`)

- **Tokens** on `:root`: Run & Set "Box (navy)" theme only.
- **Screens** (`section.screen`): `scrSetup`, `scrBoard` (standings), `scrRecord`, `scrWinner`, `scrRules`. Only one is visible; `render()` picks it from `state.screen`, or Rules when `rulesOpen`.
- **Sheets** (built into the page, no browser pop-ups): `confirmSheet`, `shareSheet`.
- **Game logic** is derived from the list of hands: `completed()`, `currentPhase()`, `finishers()`, `dealerFor()`, `ranked()`. Nothing about a player's phase is stored.
- **Phase list**: `PHASES` (number → requirement) and `STANDARD` (1–10). The canonical wording is the reference card in Stuart's own deck (current Mattel edition), where Phase 10 is 1 set of 5 + 1 set of 3. Each game stores its own `phases` list so variants are just a different list.
- A small self-test of the win rule runs in the console on load.

### Save format (localStorage key `phase10-tracker`, `SAVE_VERSION` 1)

```json
{
  "v": 1,
  "screen": "setup | board | record | winner",
  "draft": ["names on the New game screen"],
  "game": {
    "id": "x1y2z3", "startedAt": 1760000000000,
    "phases": [1,2,3,4,5,6,7,8,9,10],
    "players": [{ "id": "p1", "name": "Stuart" }],
    "hands": [{ "made": ["p1"] }],
    "winner": null
  }
}
```

`winner` is `null` (the default: one finisher wins, several share), or a player id when the table picked one winner. Future versions upgrade old saves in `migrate()`, never wipe them. If points are added, each hand gains an optional `points` field.

## 5. Release process

1. Change `index.html` (and anything else).
2. Bump `APP_VERSION` in `index.html` and `VERSION` in `sw.js` together.
3. Add any new file to `CORE` in `sw.js`.
4. From Milestone 3: push to a test branch first; merge to `main` only after Stuart has tried it.
5. Update this file (status table, decision log, "Last updated") in the same commit.
6. Installed copies show "Update ready · tap to reload" next time they're opened online.

## 6. Lessons carried over from Swipe Snake and Flip 7

- Claude can't create repos or switch on Pages. Stuart does both; Pages via Safari at `github.com/sgoodwin-cloud/phase10-tracker/settings/pages` (the GitHub iOS app has no Pages setting, and the mobile menu hides it).
- `[hidden] { display: none !important; }` is global, so no layout rule can keep a hidden screen visible.
- No blanket `preventDefault()` on touches. Buttons use `touch-action: manipulation` to stop double-tap zoom.
- The service worker installs with `cache: 'reload'` so updates never store stale files.
- The update banner reloads only once the new worker reports `activated` (timer is a last resort).
- The first time the update mechanism itself changes, the phone may need a full close and reopen.
- Home screen apps keep their own storage, separate from Safari. Deleting the icon deletes the saved game.
- No `alert()` / `confirm()`: confirmations are built into the page.
- Fonts bundled, never loaded from Google, so the app works offline.
- Test headlessly before release: play a game, go offline, reload, check the game and rules survive.

## 7. Decision log

| Date | Decision |
|---|---|
| 19 Oct 2026 | House rule: track phase completion only; first to complete Phase 10 wins; a same-hand tie is a shared win by default |
| 19 Oct 2026 | Points scoring moved to an optional final milestone, which may never be built |
| 19 Oct 2026 | Styled with Stuart's Run & Set design system, navy theme only; Jost bundled for offline |
| 19 Oct 2026 | Rules & FAQ button and Share button carried over from Flip 7, both in v1 |
| 19 Oct 2026 | Milestones 1 and 2 shipped together as v1, straight to `main` as nothing was installed yet |
| 19 Oct 2026 | Standings sorted by progress (seat order breaks ties); Record round lists players in seat order |
| 19 Oct 2026 | Saving a hand where nobody made their phase asks for confirmation rather than blocking it |
| 19 Oct 2026 | v2: compact phone layout so six players, Record round and Undo fit on an iPhone 13 without scrolling; standings stripe moved to the foot of the screen. Pushed straight to `main` as a fix to v1 |
| 19 Oct 2026 | v3: the reference card in Stuart's deck is the canonical phase list. Only Phase 10 changed: 1 set of 5 + 1 set of 3 (the website's older list says a set of 4). Variants build on top of this list |
| 19 Oct 2026 | v4: rules and FAQ checked against the leaflet in Stuart's deck (2025 Mattel edition), which is now the rules source. Skip cards follow that edition (placed in front of the skipped player; no skipping someone who already has one). Removed the FAQ claiming you may hold back a phase you can lay down. House rule added: shuffle the discard pile into a new draw pile if it runs out. Deck is 112 cards including 4 reference cards. "Round" used throughout instead of "hand" |
| 19 Oct 2026 | Even/odd-phases-only variants aren't in Stuart's leaflet (it lists 10 rounds where everyone advances, and play to a set number of phases); Milestone 4 variants to be confirmed |
