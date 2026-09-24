# Talks ledger — September 24, 2026

final result: passed

Preview: http://127.0.0.1:4182/conference/

## Source and comparison evidence

Source visual truth: `/Users/bazlur/Downloads/design_handoff_bazlur_jekyll 4/design/Talks v2.dc.html`, interpreted with `HANDOFF-talks.md`. The mock's missing `support.js` was replaced only in a temporary reference renderer by expanding its own data and bindings; its layout and inline styles were preserved. Rendered reference: `/private/tmp/bazlur-talks-reference/index.html`.

The source and revised implementation were presented together in the same browser comparison input at a 1440 × 1000 CSS viewport, light theme, unfiltered opening state, DPR 1. The browser applies identical capture scaling to both: 1425 × 990 raster pixels. No independent resizing was used.

Evidence under `/private/tmp/bazlur-talks-qa/`:
- `reference-desktop.jpg` and `talks-desktop.jpg`: paired desktop comparison. Typography, rules, controls, column alignment and individual rows are readable at this size, so an additional crop was not necessary.
- `talks-full.jpg`: complete implementation capture.
- `talks-mobile.jpg` and `talks-mobile-dark.jpg`: 390 × 844 CSS viewport, both themes; captures are 375 × 812 pixels.
- `talks-320.jpg`: narrow viewport, 320 × 740 CSS pixels.

## Findings and iteration

No actionable P0/P1/P2 visual differences remain. An initial implementation review found the longer MCP event label wrapping to two lines. The supplied shorter display label now keeps that upcoming row compact; the final paired capture verifies the correction. Stable year grouping also preserves the existing record order within each year instead of letting equal-year sorting rearrange sessions.

Intentional adaptations: the written handoff specifies a 680px header/footer and 960px ledger, although the mock widens its header too. The implementation follows the written handoff and retains Books in the existing navigation. All 55 existing sessions, full titles, exact event dates, event URLs and nine distinct recording URLs remain in the existing `speaking.json` data source. Within each year, existing session order is preserved rather than adopting the mock's reordered and sometimes shortened content. Short display names and supplied locations are added only where needed. The existing “write to me” email link label is retained. The homepage now lists upcoming sessions, as requested in the handoff.

## Fidelity surfaces

- Fonts: EB Garamond at 36px/500 for the heading, 21px intro, 19px/1.3 talk titles and 17px event text. Fira Mono 12px is used for labels, years, places and counts. Existing font loading and fallbacks remain.
- Layout: 960px table, 56px year column, 48px recording column, 12px row padding, 88px opening gap, 40px gap before the table and 300px filter column follow the reference. Below 640px the heading/filter stack and the table scrolls inside its own region.
- Colors: existing paper, ink, oxblood links, dividers and hover background match the handoff palette. Previously approved higher-contrast metadata colors are intentionally retained in both themes.
- Assets: there are no raster assets in the target. The recording control uses the official Heroicons solid play asset, stored locally with its MIT license and tinted with the existing link color.
- Copy: intro, column labels, filter placeholder and session count follow the handoff. Full talk details remain intact. Missing event URLs render plain text, avoiding the mock's placeholder links. An explicit empty state and screen-reader year labels improve filtering accessibility.

## Verification

- Isolated Jekyll build and Shiki/image processing passed; tracked `_site` files were not modified by this work.
- SEO checks passed for 124 articles and 183 sitemap URLs; all four responsive-image tests passed. JavaScript syntax and `git diff --check` passed.
- Static checks confirmed 55 rows, all original titles and field values, nine recording URLs, two upcoming sessions, no placeholder links and no speaker-kit page in the build.
- Browser filtering: `loom` 7 results, case/whitespace-insensitive `conFOO` 6, `Toronto` 4, `2026` 11, and visible place alias `Norway` 1. Year labels move to each first visible group row. An unmatched query shows the empty message and zero count; Backspace and native Escape clearing restore all 55 rows.
- Keyboard focus is visible, the table region accepts horizontal arrow-key scrolling, and 320px/390px layouts have no document overflow. The full table remains available through horizontal scrolling.
- Dark mode works, light mode was restored, viewport override reset, and the preview remains open.
- Homepage shows both upcoming talks and its “All talks” link opens the new table. Browser error/warning logs are empty.
- External recording URLs were preserved and checked in rendered markup; playback on third-party sites was not retested.

## Implementation checklist

- [x] Remove the unpublished speaker-kit draft.
- [x] Implement the handoff's table, filter, year groups, recording controls and counts.
- [x] Preserve all sessions and update homepage upcoming previews.
- [x] Complete desktop comparison, mobile/dark checks and build/SEO validation.

No commit or push performed.

---

# Site design verification

## Interviews addition — September 22, 2026

final result: passed

Preview: http://127.0.0.1:4176/interviews/

### Source and evidence

Source visual truth: `/Users/bazlur/Downloads/design_handoff_bazlur_jekyll 3/design/Interviews.dc.html` and the Media section of `design/Home.dc.html`. Implementation follows `HANDOFF-interviews.md`, retaining the site's previously approved accessible metadata colors and private contact preference.

References were rendered with their supplied inline styles and data loops, using temporary scripts in `/private/tmp/bazlur-interviews-qa/`; the missing handoff `support.js` was not shipped. All screenshot paths below are relative to `/private/tmp/bazlur-interviews-qa/screenshots/`.

- Paired desktop comparison in the same image input: `reference-desktop.jpg` and `interviews-desktop.jpg`. Both use a 1440 × 1000 CSS viewport, light theme, page opening, and identical browser capture scaling to 1425 × 990 pixels. No separate resizing was applied.
- Complete page inspection: `interviews-full.jpg`, 1425 × 2926 pixels, covering all three interviews and thumbnails.
- Focused Media comparison: `home-media-reference-crop.jpg`, `home-media-implementation-crop.jpg`, and the revised `home-media-final-crop.jpg`. These capture the 680px content region at the same desktop viewport. Different heights reflect the full supplied interview titles used in production, versus shorter teaser titles in the HTML mock.
- Mobile evidence: `interviews-mobile.jpg`, `interviews-mobile-dark.jpg`, and `interviews-320.jpg`. The light 390px capture is scrolled; the dark and 320px captures include the navigation.

### Fidelity and iteration

Fonts and typography match the reference: EB Garamond 36px page title, 26px/1.25 interview headings, 20px/1.5 summaries, and Fira Mono labels and metadata. The 680px layout uses the 72px label rail, 24px gap, 40px entry padding and 16px content gaps. Videos retain the real supplied YouTube thumbnails, 16:9 crop, grayscale/contrast treatment, square edges and dark watch label.

The first Interviews comparison found no actionable P0/P1/P2 differences. A separate Media comparison found extra metadata leading and space before the archive link. These were tightened to 1.3 line height and 16px top margin, then rebuilt and compared again in `home-media-final-crop.jpg`. No actionable P0/P1/P2 differences remain.

Intentional adaptations: the press/podcast contact sentence was removed at the user’s request; metadata uses the previously approved higher-contrast tokens; the watch label uses plain text; existing footer destinations remain. Homepage titles and metadata come from the same YAML records as the Interviews page, as specified by the Jekyll handoff, rather than duplicating the mock's shorter teaser copy. On narrow screens, the six navigation controls form two balanced rows with 44px tap heights; the interview rail collapses into one column.

### Verification and limits

- Jekyll build and Shiki processing passed in the isolated preview directory. `git diff --check` passed.
- All three YAML entries exactly match the handoff. Verified the titles, complete summaries, thumbnail URLs and six watch links in generated HTML.
- Homepage renders three Media previews between Talks and Letter. Both the header and “All interviews” link reach `/interviews/`, with the correct active navigation state.
- The first watch link opened the expected YouTube URL in a new tab. All three thumbnails loaded successfully. Full playback was not tested; external video availability remains controlled by YouTube.
- All external video links use `noopener noreferrer` and accessible new-tab announcements. No embedded player or email link was introduced.
- Checked 320px, 390px, 600px and desktop layouts: no document overflow, clear mobile navigation, readable headings and working light/dark controls. Restored light theme and reset the viewport override.
- The new route has a canonical URL and sitemap entry. Six main routes have the Interviews header link, one H1 and unique IDs. Final browser error/warning log was empty.
- Regression checks preserve 123 post bodies and canonical URLs, 54 talks, five series, the eight homepage articles, three newsletter previews, About email privacy, and all 13 highlighted blocks in the latest article.

- [x] Shared interview data, dedicated page, homepage Media section and navigation.
- [x] Desktop/reference comparisons and responsive checks.
- [x] Build and core interactions verified; local preview retained.

No commit or push performed.

---

## Second handoff implementation — September 22, 2026

final result: passed

Preview: http://127.0.0.1:4176/

### Source and comparison evidence

Source visual truth: `/Users/bazlur/Downloads/design_handoff_bazlur_jekyll 2/design/Home.dc.html`, with the supplied Archive and Article layouts as supporting references. The Home file depends on a missing `support.js`; a temporary renderer expanded only its supplied data loops, preserving its original inline layout, CSS and copy. The rendering script is `/private/tmp/bazlur-handoff-2-implementation/render-reference.mjs`, and the rendered reference is `/private/tmp/bazlur-handoff-2-review/reference-site/home-visual-reference.html`.

All new evidence is in `/private/tmp/bazlur-handoff-2-implementation/`. Screenshot paths below are relative to its `screenshots/` directory.

Reference and implementation were presented together in the same comparison input at a 1440 × 1000 CSS viewport, light theme, page opening. Both viewport captures are 1425 × 990 raster pixels; the browser applies the same output scaling to both, so no independent resizing was used. Full-page captures use the same CSS viewport and equal 1425px raster width, with different heights because the real talk details and newsletter links add content.

- First comparison: `home-reference.jpg` and `home-desktop.jpg`.
- Revised comparison: `home-reference.jpg` and `home-desktop-v2.jpg`.
- Full-page comparison: `home-full-reference.jpg` (1425 × 1724) and `home-full-final.jpg` (1425 × 1863).
- Focused lower-page and form inspection: `home-newsletter.jpg`, `newsletter-320-final.jpg`.
- Archive and series: `archive-desktop.jpg`, `archive-mobile-dark.jpg`, `series-desktop.jpg`.
- Responsive/light/dark: `home-mobile.jpg`, `home-mobile-dark.jpg`, `home-320-final.jpg`.

The opening captures are legible enough to compare the fonts, metadata, title wrapping and book row directly. The full-page source capture blurred the small book image, so image fidelity was judged from the clear opening capture instead. Browser extension controls visible on some article screenshots are outside the site.

### Findings and fixes

- [Resolved P2] Excessive metadata and book-copy line height made the first homepage pass taller than the reference. Tightened book-title/caption leading and homepage metadata leading; added the reference's subtle book-cover shadow. The second paired comparison confirms the intended rhythm and matching title wrapping.
- [Resolved P2] At 320px, the theme control wrapped to a third header row. A narrow-screen 12px navigation size and 12px gaps keep all five controls on the second row, retaining 44px tap heights. `home-320-final.jpg` verifies the correction.
- [Resolved P2] Article tables squeezed column headings into fragments on a narrow screen. Tables now retain a 480px minimum width inside their existing keyboard-focusable horizontal scrolling region. `article-table-320-before.jpg` and `article-table-320-after.jpg` show the correction; document width stays within the viewport.
- [Resolved delivery issue] Previously cached local pages and CSS could show the old design. Versioned changed assets and retired the existing cache-first service worker. Retirement deletes only caches named `bazlur-blog-*`, claims existing clients, unregisters, and leaves requests to the network. A focused lifecycle simulation verified that unrelated caches remain untouched. Final browser verification used a fresh local origin with caching disabled.

### Fidelity review and intentional adaptations

- **Typography:** EB Garamond for editorial text and Fira Mono for navigation/metadata; 680px column, 21px homepage article titles, italic 19px book title. The approved article retains its 21px body and 52px desktop title, with its existing mobile scale and italic title clause.
- **Layout:** The book row aligns with the article column after the 72px year rail and 24px gap. The homepage uses four articles from each of the latest two years, then selected talks and the newsletter. Mobile collapses the rail and stacks article dates below metadata.
- **Colors:** Paper, ink, rules and oxblood links follow the handoff. Metadata is intentionally darker for readability: light contrast 4.99:1 and dark contrast 6.45:1 against the page background, replacing the source's faint values.
- **Assets:** The existing optimized real book artwork and About portrait remain. No substitutes or generated imagery were introduced.
- **Content:** Real primary topics replace generic sample labels. Archive counts and its 2017 start year come from the actual posts. Featured talks are the upcoming MCP session and the September 19 Tamilnadu talk. The newsletter uses the existing three feed entries and makes no unverified publishing-frequency promise. The existing footer destinations and newsletter archive link remain.

No actionable P0/P1/P2 visual findings remain in this scope.

### Verification

- Final Jekyll build and Shiki processing passed in an isolated destination; existing tracked `_site` changes were not overwritten.
- All 123 post bodies are byte-for-byte unchanged from the pre-implementation backup, which already contains the pending code-fence fix. All 123 canonical article URLs remain valid.
- Seven primary topics cover the archive: AI & LLMs 8; Career & Community 39; Concurrency 27; JVM & Performance 11; Java 23; Personal 10; Tools 5.
- Five real series have 25 articles in total. Checked all generated series destinations and browser navigation from Part 15 to Part 14 and to the 15-part archive.
- Browser checks passed for topic filtering, live counts, URL reload, browser Back, empty topic/series intersections, recovery to all articles, and invalid parameters. Search includes category text while preserving its existing tag behavior.
- Checked 54 main, legacy-tag, pagination and utility pages for one H1, duplicate IDs and missing local link/asset targets. All 54 talk records remain rendered. About retains Oracle ACE Pro and no email link.
- Six main routes passed 320px viewport checks; homepage and archive were also inspected at 390px in both themes. Dark mode persists after reload, and light mode was restored. Keyboard focus is a visible 2px outline.
- Newsletter required-email validation passed. No subscription was submitted; provider-side completion is not tested.
- Latest article has 13 colored code blocks. Code-copy feedback works; reading progress moves from zero with scrolling. Article fonts and code containment remain correct.
- JavaScript syntax checks and `git diff --check` passed. No application console errors or warnings; one warning came from the installed Grammarly extension.

The service-worker upgrade has a simulated lifecycle check, not a production upgrade test; deployment has not occurred. The old worker's offline cache is intentionally retired, consistent with the editorial layout no longer registering a worker.

### Implementation checklist

- [x] Homepage, shared navigation and newsletter previews.
- [x] Primary topics, archive filtering and series navigation.
- [x] Reading progress, accessible contrast and responsive table/header fixes.
- [x] Final build, browser interactions and paired design comparison.
- [x] Local preview retained for review; no commit or push performed.

---

final result: passed

## About-page rendering correction

The initial About-page check missed a lower-page rendering error. The mixed Markdown/HTML source escaped the closing prose wrapper and the Now, Focus, and Contact sections into visible text. The earlier top-of-page comparison did not establish that these sections were rendered correctly.

Converted the page to `about.html` with explicit HTML paragraphs and links, preserving `/about/`, all biography text, credentials, and contact destinations. A fresh Jekyll build and Shiki processing passed. The generated page now has five biography paragraphs, three actual sections with Now/Focus/Contact headings, and ten list items; a text-content check found no visible HTML tags. Desktop screenshots confirm the section rules, lists, and contact links render correctly; the 320px viewport has no horizontal overflow.

Evidence: `/private/tmp/bazlur-about-fix/before.jpg`, `after-desktop.jpg`, `after-contact.jpg`, and `after-mobile.jpg`. This correction supersedes the initial About-page pass.

## Site-wide follow-up — September 21, 2026

The approved article design now supplies the shared header, footer, fonts, palette, and theme behavior. The homepage, Talks, About, archive, search, topics, existing tag pages, pagination, Categories, About this site, 404, and offline pages use the editorial design.

Preview: `http://127.0.0.1:4174/`

Visual references: the supplied `/Users/bazlur/Downloads/design_handoff_bazlur_jekyll` handoff, rendered with the real archive at `http://127.0.0.1:4173/handoff/`, and the previously approved article screenshot below.

### Visual comparison

Paired reference/implementation screenshots were inspected together at the same 1440 × 1000 desktop viewport, light theme, page opening:

- `/private/tmp/bazlur-site-qa/home-comparison.jpg`
- `/private/tmp/bazlur-site-qa/talks-comparison.jpg`
- `/private/tmp/bazlur-site-qa/about-comparison.jpg`

Comparison sheets crop both captures around the 680px reading column and normalize the screenshot width to the CSS viewport. The source Talks page has no scrollbar because it contains three sample sessions; the real implementation has all 53 sessions. This produces a small scrollbar-centering difference in that pair. Captures with still-loading images were discarded and replaced.

Typography, paper/ink colors, page width, header, intro, book row, page headings, and portrait crop follow the handoff. The main article stylesheet is unchanged. Article runtime verification confirms the 680px column, EB Garamond 21px body, 52px title, italic clause, and original metadata. Article-only pages do not load the new page stylesheet.

Intentional content adaptations:

- Homepage shows up to six articles from each of the three latest years (16 currently), with a link to the complete 123-article archive. Compact 40px year spacing avoids the handoff stylesheet's extra separators and padding.
- Talks use all existing session records and recording/event links, with existing upcoming flags preserved. Sample event dates and placeholder contact information were not imported.
- About retains the existing biography, professional/community links, and configured contact email. The existing optimized WebP portrait replaces the 17MB source image; a 17.5KB book-cover derivative serves the small homepage slot.
- Search, topic browsing, and utility pages extend the same type and spacing system. Existing tag routes remain usable; the 60 topics without a dedicated page use exact topic filtering in search, covering all 97 topics.
- Existing numbered archive URLs show their corresponding posts instead of duplicating the homepage.

### Functional and responsive verification

- Full repository Jekyll build to an isolated destination passed, followed by Shiki processing. The user's existing `_site` changes were preserved.
- Parsed 55 main, tag, and pagination pages: one H1, no duplicate IDs, no missing local link/asset targets, and no legacy stylesheet.
- Verified all 123 article pages retain their article body, stylesheet, canonical URL, and BlogPosting structured data; 53 talk entries are rendered.
- Browser search returned 43 articles for “virtual threads.” Tested no-results state, clearing input, exact topic filtering with spaces, clearing a topic filter, and navigation from a search result to the approved article and back. Search data is safely JSON-encoded and results use DOM text nodes.
- Newsletter required-email validation works and the form points to the handoff's existing Substack subscribe URL. No subscription was submitted; provider-side completion was not tested.
- Dark selection persists through navigation and reload. Light mode restored after testing.
- At 390px, visually checked homepage, newsletter, talks, and About in dark mode. At 320px, checked all 12 representative routes, including long titles and search terms. Final document widths stay within the viewport.
- Fixed long Java class-name overflow in archive titles, pagination, search excerpts, and result status; captured the corrected states. Evidence: `archive-320.jpg`, `search-long-title-320.jpg`, and `responsive-checks.json` in `/private/tmp/bazlur-site-qa/`.
- No application console errors or warnings. One warning came from the installed Grammarly browser extension.
- JavaScript syntax checks and `git diff --check` passed.

No actionable P0/P1/P2 visual mismatches remain in this scope. The handoff's faint metadata remains a P3 contrast consideration, as recorded in the original article review. No publication or deployment was performed.

## Original approved article pass

Source visual truth: `/Users/bazlur/Desktop/Screenshot 2026-09-21 at 8.08.55 PM.png`

Implementation: `http://127.0.0.1:4174/2026/09/21/java-virtual-threads-under-load-three-limits-to-make-explicit/`

Implementation screenshot: `/private/tmp/bazlur-article-preview/screenshots/article-desktop.png` (the browser supplied JPEG bytes).

Full comparison: `/private/tmp/bazlur-article-preview/screenshots/reference-comparison.jpg`

Focused typography comparison: `/private/tmp/bazlur-article-preview/screenshots/typography-comparison.jpg`

## Comparison setup

- Source: 1936 × 1696 pixels; normalized at 2× to a 968 × 848 CSS-pixel crop. Its reading column measures approximately 680 CSS pixels.
- Implementation: 1728 × 936 CSS viewport, devicePixelRatio 2. Browser capture was delivered as a 1713 × 928 raster. The comparison scales the raster back to 1728px wide, then aligns the same 680px column to the source crop. The source has cropped outer margins and roughly 16px less space above the header, so outer screenshot edges were not treated as site-layout requirements.
- Comparison browser viewport: 1980 × 910, showing both normalized captures together. A separate close-up shows the metadata, heading, italic title clause and subtitle together.
- State: light theme, article opening, fonts loaded visually, no menus or dialogs. Dark mode was checked separately.
- Content: the actual article keeps its original paragraphs, bullet list and diagrams. The reference contains different sample body text. The matching title, metadata and subtitle were compared directly; differing paragraph wraps and a V rather than W drop cap follow the preserved article text.

## Findings and required fidelity surfaces

- Fonts and typography: EB Garamond at 21px/1.55 for reading text; 52px/1.1 regular desktop title with italic second clause; 24px/1.45 italic subtitle; Fira Mono at 13px for navigation and metadata. The title and subtitle wrapping match the reference at the normalized reading width. Drop cap uses 3.6em, weight 500 and .8 line height.
- Spacing and layout: 680px reading column, 24px page gutters, 36px header top padding, 88px article top padding, 20px metadata gap, 24px title gap, and 56px gap below the subtitle. No hero image, cards, sidebar or tag badges compete with the article opening.
- Colors and tokens: reference values retained, including #FFFCF5 paper, #111 ink, #4A4640 subtitle and #8F887C metadata. Dark palette matches the handoff. The reference's muted metadata has limited contrast; this fidelity pass is not a WCAG certification.
- Image quality: the reference has no above-the-fold image assets. The decorative lead image was removed from this article's rendered opening; its social image metadata and technical diagram remain. The author portrait uses the existing small WebP asset.
- Copy and content: original article wording preserved; reference subtitle, Concurrency label and explicit title-emphasis metadata added to the selected article. Other posts use their own titles, dates and category/tag values; absent subtitles do not leave empty space.

No actionable P0/P1/P2 visual mismatches remain within the requested article-style scope.

## Comparison history

1. Implemented the article shell and typography from the supplied handoff, retaining the existing SEO include and code-copy script.
2. Compared the saved desktop screenshot beside the normalized user reference, then inspected the focused typography capture. The visible title and subtitle treatment matches; existing body-copy differences are intentional. No visual correction was needed after the first accepted, fully loaded comparison. An initially loading comparison capture was rejected and replaced.
3. Checked light/dark and mobile states. Captures: `article-dark.png`, `article-mobile.png` (390px), and `article-320.png` under `/private/tmp/bazlur-article-preview/screenshots/`. At 320px and 390px, the document stays within the viewport and code scrolls within its own block. The header wraps deliberately onto a second line.

## Verification

- Jekyll build succeeded using a separate temporary source/destination, preserving the existing `_site` changes.
- Shiki post-processing succeeded for the generated site, with light and dark syntax colors.
- Inspected all 123 generated article pages: one article title, article body, canonical URL, BlogPosting structured data, and the dedicated article stylesheet; no legacy stylesheet on article pages.
- Selected article has a single H1, italic title clause, subtitle, and 13 working code-copy controls. Copy feedback became visible after the clipboard promise resolved.
- Dark theme changes the page and code colors; selection survives reload. Returned the preview to light mode.
- Articles navigation reaches the existing archive and browser Back returns to the article.
- Browser warning/error log was empty during the checked states.
- JavaScript syntax checks and `git diff --check` passed.

## Implementation checklist

- [x] Apply the article-only shell and exact font families.
- [x] Add optional subtitle and title-emphasis front matter.
- [x] Remove the duplicate heading and decorative lead image from the selected article.
- [x] Preserve technical content, metadata, URLs and code copying.
- [x] Verify the reference comparison, dark theme, and narrow viewports.
- [x] Leave the local article preview running for inspection.

## Follow-up polish

The reference has intentionally faint metadata; a future accessibility pass could increase its contrast if a visual departure is desired. Older posts can receive curated subtitles and title-emphasis metadata independently. No publication or deployment was performed.
