import fs from 'node:fs/promises';
import path from 'node:path';
import { codeToHtml } from 'shiki';

const siteDir = path.resolve(process.cwd(), '_site');
const htmlFiles = await collectHtmlFiles(siteDir);

for (const filePath of htmlFiles) {
  const source = await fs.readFile(filePath, 'utf8');
  const withoutDuplicateHeading = removeDuplicatePostHeading(source);
  const rendered = await replaceCodeBlocks(withoutDuplicateHeading);

  if (rendered !== source) {
    await fs.writeFile(filePath, rendered);
  }
}

async function collectHtmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath);
    }
  }

  return files;
}

async function replaceCodeBlocks(html) {
  const pattern = /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;
  let output = '';
  let cursor = 0;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    output += html.slice(cursor, match.index);
    output += await renderHighlightedBlock(match[2], match[1] || 'text');
    cursor = match.index + match[0].length;
  }

  output += html.slice(cursor);
  return output;
}

async function renderHighlightedBlock(encodedCode, language) {
  const code = decodeHtmlEntities(encodedCode).replace(/\n$/, '');
  let highlighted;

  try {
    highlighted = await codeToHtml(code, {
      lang: normalizeLanguage(language),
      theme: 'catppuccin-latte'
    });
  } catch {
    highlighted = await codeToHtml(code, {
      lang: 'text',
      theme: 'catppuccin-latte'
    });
  }

  return [
    '<div class="code-block-wrapper">',
    '<button class="code-copy-button" type="button" aria-label="Copy code">',
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="9" y="9" width="13" height="13" rx="2"></rect>',
    '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    '</svg>',
    '</button>',
    '<span class="code-copy-tooltip" role="status" aria-live="polite">Copied!</span>',
    highlighted,
    '</div>'
  ].join('');
}

function normalizeLanguage(language) {
  const value = language.toLowerCase();

  if (value === 'plaintext' || value === 'text') {
    return 'text';
  }

  return value;
}

function removeDuplicatePostHeading(html) {
  return html.replace(
    /(<div class="post-content e-content" itemprop="articleBody">[\s\S]*?)(<h1\b[^>]*>[\s\S]*?<\/h1>)/,
    '$1'
  );
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
