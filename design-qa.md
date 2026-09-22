# Site design verification

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
