# French Structure Lab v1.1.0 — Course expansion and QA

## Content

- Preexisting: 18 units × 4 questions = 72 questions; 36 legacy course/practice questions.
- New: A1, A2, B1, B2, C1, C2 each receives 6 units × 4 questions = 36 new units / 144 new questions.
- Totals: 54 units, 216 questions in the structured course, plus 36 previous general practice questions = **252 CEFR-side questions**.
- The separate Futsuken exam bank (1,200 questions, grades 4–1) is unchanged.
- Content includes varied communicative situations, grammatical reasoning, alternative structures, reading with translation, a short productive task, and topic-based review.
- New units have IDs unique from legacy units. Old IDs and storage keys remain intact.

## Implementation

- New independent files: course-a1.js, course-a2.js, course-b1.js, course-b2.js, course-c1.js, course-c2.js, course-expansion.js.
- They load immediately after curriculum.js (defer order), before learning-insights.js and app.js.
- The loader validates grade, unit counts, exercise structure, unique IDs, correct indexes and duplicated options. It fails loudly instead of silently hiding missing content.
- Original course units get the new guided-structure panel, and all 54 units have JA/EN/FR title mappings.
- New panel: explicit learning goal, structural explanation, contrastive examples, production prompt and locally stored learner sentence, related-unit navigation and existing 4-question exercise action.
- Listening-first option temporarily hides reading text without affecting the audio button; the learner can reveal it immediately.
- Audio.js adds speech buttons to new French contrast examples; reading already has per-sentence and per-word playback.
- New storage: french-structure-lab:v1:courseDrafts; included in full backup/import and AI-ready report. Previous backups remain importable; notes are preserved if absent in older backups.
- The PWA service worker pre-caches the expansion scripts.

## Tests performed

1. JavaScript syntax checks: six packs, loader and modified app.js.
2. 6 × 6 new unit counts; 4 options and exactly one stored correct answer index per question; non-empty Japanese/English explanation; unique question IDs.
3. Full bank aggregates to 54 units and 252 CEFR questions with all three paths intact.
4. Exact model-answer comparison: 144 new questions examined. Fixed apostrophe spacing, erroneous double negatives and redundant prepositions; a small number intentionally show a longer contextual prompt and a shorter modeled answer.
5. Mock browser boot and Courses render pass; 9 unit cards per A1–C2 level.
6. All six levels: select last added unit → guided lesson visible → listen without text → reveal text → input and persist an original French sentence → enter 4-question lesson practice. Six of six flows passed.
7. Mode switching JA / EN / FR all shows guided panel; French titles and course level labels present.
8. New files included in cache and HTML load order. Existing Futsuken data untouched.

## Limits and next QA priorities

- All 144 new questions were authored and structurally checked. They have not undergone independent expert peer review. Multiple-answer ambiguity and French stylistic nuance merit continuing manual audits.
- Current lesson texts are short model readings, not a complete C1/C2 literary or professional corpus.
- Short productive tasks save the learner's own work without claiming automatic correctness or assessing real speaking/writing ability.
- The UI tests simulate browser behavior. iPhone Safari real-device audio/offline testing has not been completed.
- CEFR skill descriptors describe communicative capability across reception, production, interaction and mediation, not a certification obtainable just from these quizzes.
