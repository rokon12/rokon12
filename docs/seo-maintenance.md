# SEO maintenance

The shared head template emits one canonical URL, description, social preview, and article JSON-LD record. Article headings keep their original wording. Use `seo_title` only when a shorter search title helps.

## Publishing an article

Add an accurate, page-specific `description` to the front matter. Choose a `featured_image` that exists in the repository and give meaningful content images descriptive alt text. Use `last_modified_at` when an article receives a substantial content update, keeping its original publication date.

The image optimization workflow creates WebP and resized assets. The final build selects existing variants, adds intrinsic dimensions, and makes later images lazy. Transparent or animated images and existing picture elements are preserved. New images without variants remain usable and acquire responsive markup after optimization runs.

The curated reading paths live in `_data/guides.json`. Add relevant articles there as the topic develops. Links within article prose should help readers follow the subject.

## Checks

Build into a temporary directory to avoid overwriting a local preview:

```sh
bundle exec jekyll build --destination /tmp/bazlur-seo-site
node scripts/render-code-blocks.mjs /tmp/bazlur-seo-site
node --test tests/responsive-images.test.mjs
bundle exec ruby -rbundler/setup scripts/check-seo.rb /tmp/bazlur-seo-site
```

The deployment workflow runs the same checks before publishing. They verify canonical metadata, article structured data, sitemap exclusions, redirect targets, topic links, and responsive image assets. A local Ruby installation must have a Nokogiri build compatible with its architecture.

## Legacy URLs

Old article paths are declared with `redirect_from` on the destination post. GitHub Pages serves the generated zero-second meta-refresh pages with canonical links. These are client-side redirects, not HTTP 301 responses. Backup content and development pages are excluded from the build and sitemap.

`legacy-url-redirects.csv` maps the old bazlur.ca URLs to their bazlur.com destinations. Apply permanent HTTP redirects at the service hosting bazlur.ca once that service is accessible. Where old and new slugs differ, preserve the explicit mapping instead of forwarding every request to the homepage.

## Search Console

Verify bazlur.com in Google Search Console, then submit `https://bazlur.com/sitemap.xml`. A domain property needs a DNS verification record. For a URL-prefix property using an HTML tag, set `google_site_verification` in `_config.yml` to the verification token from Google.

After verification, inspect the homepage, new articles, topic guides, and representative redirected URLs. Monitor indexing and Core Web Vitals there. The build checks validate site output; they do not confirm Google indexing or field performance.
