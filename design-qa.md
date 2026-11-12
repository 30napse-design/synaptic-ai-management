# Home design verification

Source visual truth: the user's first inline dashboard image (1672 × 941 pixels). The second inline image controls existing sidebar labels/structure. The first image's menu entries are explicitly excluded by the user's clarification.

Implementation screenshots: `outputs/home-qa/home-1672x941.png`, `home-1440x900.png`, `home-1366x768.png`, `home-768x1024.png`, `home-375x812.png`, plus employee empty state. All are browser-rendered at deviceScaleFactor 1. Synthetic records are isolated local fixtures, never product constants.

Functional browser result: passed. TypeScript/build and the related logical tests also passed. See `docs/home-redesign-verification.txt` and screenshots/metrics.json in the delivery bundle.

## Visual surfaces reviewed

- Typography: existing Vazirmatn family preserved, navy headings, readable task copy, natural wrapping; actual names and roles replace the reference's sample person and photo. No invented user photo.
- Layout: title on the right and sunrise ribbon on the left; three summary cards; priorities and shortcuts on the right; next plan and important notice on the left. On mobile the content stacks and scrolls naturally. Existing sidebar is fixed independently, with its existing labels and permissions.
- Colors/tokens: very pale blue background, white/cyan cards, indigo sidebar and purple selected navigation, semantic green/orange/red summaries, separate state labels and priority accents.
- Images: generated raster sunrise/mountain and blue architectural campus assets, existing actual brand logo. The campus vignette is omitted at small/short viewports. Assets follow the reference's subject/palette; they are not pixel-identical crops of it.
- Copy/content: role and data come from the current user and existing authorized APIs. No reference counters, appointments or task titles are embedded in the product. Home shows three priorities (within the requested maximum five) with a real full-list link.

## Iteration history

1. P2: first desktop render overflowed vertically with five priority rows. Fixed by making the summary three rows, matching the reference, and using compact spacing at shorter desktop heights. New browser evidence confirms document heights exactly equal viewport heights at 1672×941, 1440×900 and 1366×768.
2. P2: the existing backdrop breakpoint did not cover the new tablet sidebar mode at 768px. Added a home-scoped backdrop up to 1000px. Retested actual opening and closing on tablet and phone; content width/position stays independent of menu groups.
3. Automated checks confirm no horizontal page overflow at all five widths and no JavaScript page exceptions. The screenshots were opened and visually reviewed, including 375px and 1366px views.

## Deliberate functional differences

- Reference menu entries are not copied; the user's existing sidebar wins.
- No unread badge is invented for internal correspondence, because its backend has no per-user read state. Its functional list and real destination are preserved.
- Search explicitly covers authorized work and operations records; it does not claim every database/file is indexed.
- Actual data and empty states differ from the reference's fictional sample content.

## Formal visual comparison limitation

The reference is available visually inline in the conversation, but not as an accessible local source file. A combined same-input source/render comparison artifact and automated pixel comparison were not produced. Separate inline source and rendered screenshots are not claimed to be a side-by-side comparison. Functional/responsive browser QA passed, but the stricter Product Design comparison gate remains unverified for this reason. The requested source/Patch/ZIP is delivered for review; no pixel-perfect or production-live verification is claimed.

P3 follow-up: optional review of art crop/typography against an exported original reference at exactly the same content state. No known functional P0/P1/P2 issue remains in the tested states.

final result: blocked
