---
layout: page
title: About this site
permalink: /uses/
---
This is a reading-first home for my writing, talks, and notes on Java.

## Publishing

Articles are written in Markdown. Jekyll and Liquid turn them into static pages, with GitHub Actions handling the build and deployment to GitHub Pages.

## Typography and code

The reading typeface is EB Garamond. Navigation, dates, and code use Fira Mono. Shiki highlights code during the build, with separate colors for light and dark themes.

## Finding things

The [article archive]({{ '/archive/' | relative_url }}) groups writing by year. [Topics]({{ '/tags/' | relative_url }}) collect related posts, and [search]({{ '/search/' | relative_url }}) runs in your browser across the article archive.

## Content tools

A Java import script uses JBang, JSoup, and FlexMark to bring existing writing into Markdown. The site itself serves static HTML, CSS, and a little JavaScript.

You can [browse the source on GitHub](https://github.com/rokon12/rokon12) or [subscribe by RSS]({{ '/feed.xml' | relative_url }}).
