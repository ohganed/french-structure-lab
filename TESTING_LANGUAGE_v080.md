# Language mode integration, v0.8.0

## Scope

- Single selection across `index.html`, `exam.html`, `cognition.html`: 日本語 / English / Français + · immersion.
- Persistent preference `french-structure-lab:v1:lang`, retaining previous ja/en values.
- Legacy CEFR questions, exam IDs and learning history are untouched.
- French immersion mode uses **French-first contextual cues** rather than automatically translating 1,200 unique grammar explanations.
- Japanese/English detailed explanations remain available in expandable helper sections.

## Verification

- JS syntax checks: app, exam, cognition, language-mode, cognition-language.
- Main app mock-DOM boot test: JA → FR updates hero and `html[lang]`, no startup error.
- Exam mock-DOM boot test: JA / EN / FR switches; no startup error.
- Cognition learning workflow: 11 units × 3 modes × 3 assessment steps = 99 stored answers, 99 correct in scripted test, 0 missing scene texts; persisted final language = FR.
- iPhone Safari and Web Speech voice output remain untested on physical device.

## Known limitations

- The Français + mode introduces simplified original French guidance; some secondary copy falls back to English rather than being translated individually.
- Detailed source explanations in the 1,200-question bank remain authored in Japanese and English and are visible on demand; a complete manual French explanation for every question is future work.
- No automatic level adjustment / measured immersion proficiency yet.
- Browser storage remains local; no iCloud automatic sync.
