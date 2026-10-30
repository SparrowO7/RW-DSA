# RW DSA — learn through stories

## English / हिन्दी

Use the EN / हिन्दी toggle in the main header or inside a lesson. All 20 stories include concise everyday Hindi using respectful आप language, alongside the English version. Technical names and pseudocode stay in English. Switching keeps your current lesson chapter and your own note unchanged. Your language choice is remembered in localStorage under `rw-dsa-language`.

`hindi.js` contains the Hindi lesson content; `language.js` translates interface labels and connects both toggles; `language.css` styles the controls and Hindi typography. No translation API or account is needed. This is a static HTML, CSS and JavaScript site with a locally bundled Three.js background.

Bilingual verification: all 20 translated lessons and their six chapters passed local checks. Browser checks confirmed a draft survives a language switch, the same chapter stays open, and Hindi returns after refresh. The Hindi reader was checked at 390px without horizontal page overflow. Temporary test notes were cleared.

This version replaces the multiple-choice / correct-answer lesson engine with a story-first reader for all 20 lessons. The visual homepage, tricolor palette, generated artwork and Three.js background remain available.

## Learning journey

1. The story: an engaging everyday question in easy English.
2. Our first idea: try the obvious approach and see what it misses.
3. Learn from zero: an analogy, a plain-language definition and important properties. Complexity notation has an expandable explanation.
4. See it work: a small example explained one change at a time; move backward or reveal all steps.
5. The algorithm: numbered plain-English instructions, pseudocode, reasoning and limits.
6. Your takeaway: write an explanation in your own words and save it to My notebook. A new situation with an optional reasoning reveal supports transfer.

Every chapter is directly accessible. There are no scores, timed tests, multiple-choice gates or claims of mastery for clicking through. Progress counts saved takeaways rather than right answers. A draft autosaves locally; Save my takeaway records a reflection. Clearing a note removes its saved-takeaway status.

## The first story: the ₹500 question

The hook asks whether simultaneous online and ATM requests can spend the same ₹500 twice. A simplified model compares an unsafe stale-balance sequence with a coordinated serial order. The lesson explicitly distinguishes:

- Two genuinely different withdrawals: shared-account checks/debits need transaction coordination.
- One payment delivered again after a lost reply: stable request identity and atomic, durable idempotency handling prevent treating it as a new operation.

A hash table alone does not coordinate a bank balance. The chapter introduces keys, values, hash functions, buckets, collisions, sets, maps and expected lookup time. The interactive four-bucket toy uses character-code sums modulo four. TX41 and TX50 collide but are distinct keys; repeating TX41 is a duplicate. The algorithm chapter contains both a simplified locked-account/idempotency model and the smaller sequential hash-set duplicate-detection algorithm. These are teaching models, not deployable banking or ATM software.

Technical references:
- https://www.postgresql.org/docs/current/transaction-iso.html
- https://docs.adyen.com/development-resources/api-idempotency

## Files and technologies

- index.html: entry point and load order.
- app.js: original six mission records, dashboard, search, filters and notebook. Old quiz engine functions removed.
- more.js: remaining 14 mission records (example data, worked steps, pseudocode).
- stories.js: all 20 lessons' hook, story, first attempt, concept basics, properties, algorithm steps, takeaways and reflection prompts.
- story-reader.js: six-chapter reader, worked-example controls, cash/hash demonstrations, copy-code action and reflection persistence.
- story-reader.css: desktop/mobile reading layout and light/dark styles.
- approved.css, style.css, night.css: page styling and original visual layers; later styles override earlier ones.
- design.js: scroll reveals and reading-position line.
- particles.js / particles.css: Three.js decorative scene, cursor response, pause/resume and mobile/reduced-motion behavior.
- vendor/: locally bundled Three.js 0.180.0 and MIT license.
- assets/: locally bundled generated photographs.
- netlify.toml: static hosting configuration.

Stack: plain HTML, CSS and JavaScript. Native HTML dialog, inline interaction logic, localStorage and Three.js/WebGL. Google Fonts has system fallbacks. No React, backend, AI API, database or API key is required. Pseudocode is educational text; the app does not execute arbitrary learner code.

## Editing or adding a story

Use a unique mission ID shared between its mission record and stories.js entry. Required story fields:

- hook, scene (paragraph array)
- first, naive, failure
- conceptTitle, basics (paragraph array), properties (array)
- steps (plain-English algorithm array)
- learned (takeaway array), note (personal reflection prompt)
- apply, applyAnswer (unscored transfer situation and explanation)
- optional sources: array of [label, URL] pairs

Mission records provide title, world, level, time estimate, desc, data, tokens, frames, code and why. Keep assumptions and the worked answer consistent. Existing unused legacy quiz metadata in old records is not rendered or used to gate learning. Add topic-specific interactive demonstrations in story-reader.js only when they explain a concept better than a worked example.

## Netlify

Extract RW-DSA-Hindi-English-Netlify.zip. Upload the complete folder whose root contains index.html to Netlify Drop. For Git deployment use that folder as the repository root, leave build command blank and use publish directory `.`. No install step is required. A local HTTP server is needed for module loading; double-clicking index.html may block Three.js imports.

This package is prepared locally. No upload to the user's Netlify account has been performed.

## Notes and data

Progress, personal notes, theme and pause preference stay in localStorage for this browser/origin. Existing notes remain. Legacy quiz completion is retained separately; it is not counted as a story reflection. No cross-device sync or account exists. Moving from the old domain to Netlify does not automatically migrate notes.

## Verification

- All 20 story records contain a complete six-part learning journey.
- Local checks exercise every chapter, unrestricted navigation, worked-example steps, note drafts/saves/reloads, the saved-takeaway filter, and the cash/hash simulations.
- Browser/IAB verified story opening, simulation output, repeated-key handling and personal reflection appearing in My notebook. Temporary verification text was cleared afterward.
- A mobile navigation overflow was found and fixed; at 390px both page and dialog bounds were verified without horizontal overflow. The chapter rail scrolls horizontally by design.
- Existing Three.js scenery and static assets remain packaged. WebGL degrades to a CSS background when unsupported; reduced-motion preferences are respected.

The goal is explainable reasoning, not a guarantee that reading a lesson proves mastery. The next useful test is watching a learner explain one new situation without the lesson open.
