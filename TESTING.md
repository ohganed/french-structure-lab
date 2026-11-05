# French Structure Lab v0.3.0 — Test report

Tested 2026-11-05, offline-injected Chromium desktop (1280x850), Chromium mobile emulation (390x844), and static JS validators.

## Passed

- 108 exercises: unique IDs, 4 distinct options, answer-to-sentence alignment (including French elision); six CEFR levels with 12 curriculum questions each, 18 four-question units.
- Start A1 unit, answer incorrectly, end session, see mistake topic and per-question answer trace.
- Revisit the same question from next-session advice, answer correctly and see the `× → ✓` learning trajectory.
- Export AI-learning-report JSON with the same question's chronological incorrect/correct history.
- Export full backup with schema version 3.0.
- Launch topic-focused practice and verify the session mode and four answer choices.
- Reload and preserve events/sessions; resume practice session.
- Toggle A+ font size and check for horizontal overflow at both desktop/mobile widths.
- No JavaScript page errors in tested paths.

## Not confirmed

- On-device iPhone Safari speech availability, home-screen install, offline/online transitions, and backup import from Files.
- HTTP localhost-based offline Service Worker test was blocked by the test browser's network policy (ERR_BLOCKED_BY_ADMINISTRATOR); this is **not** evidence of an application error or success.
- GitHub Pages publishing is **not** completed; instructions are supplied separately.

## v0.4.0 additions (2026-11-05)

- New Futsuken path provides 6 grades (4, 3, j2, 2, j1, 1), 12 original items per grade (72 total).
- Node syntax checks: `app.js`, `exam.js`, `exam-data.js`, `sw.js` passed.
- Headless Chromium mobile test (390×844) using offline HTML/CSS/JS injection: grade selection, MC error → feedback, next item, correct answer, session summary, learning ledger, grade 1 typed answer, manual rewrite grading. No page errors in tested flows.
- Static consistency tests: unique IDs and expected per-grade counts.
- Main CEFR records remain separate; Futsuken progress and logs use distinct keys and are included in exported full backups.
- Local browser navigation, Service Worker installation, sound and actual iPhone Safari have not yet been verified against live GitHub Pages after publication.
