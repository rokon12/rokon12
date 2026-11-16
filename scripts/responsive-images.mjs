import fs from 'node:fs/promises';
import path from 'node:path';

const imageCache = new Map();
const escapeAttribute = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

// Read intrinsic dimensions without recompressing or changing any image assets.
export function imageInfo(bytes) {
  if (bytes.length >= 26 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), convertible: ![4, 6].includes(bytes[25]) && !bytes.includes(Buffer.from('tRNS')) && !bytes.includes(Buffer.from('acTL')) };
  }
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const kind = bytes.toString('ascii', 12, 16);
    if (kind === 'VP8X' && bytes.length >= 30) return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3), convertible: false };
    if (kind === 'VP8 ' && bytes.length >= 30) return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff, convertible: false };
    if (kind === 'VP8L' && bytes.length >= 25) {
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, convertible: false };
    }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 0xff) break;
      const marker = bytes[offset + 1];
      if (marker === 0xff) { offset++; continue; }
      if (marker === 0xd9 || marker === 0xda) break;
      const length = bytes.readUInt16BE(offset + 2);
      if (length < 2 || offset + length + 2 > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker) && length >= 7) {
        return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5), convertible: true };
      }
      offset += length + 2;
    }
  }
  return null;
}

async function inspect(siteDir, url) {
  const key = `${siteDir}:${url}`;
  if (!imageCache.has(key)) {
    imageCache.set(key, (async () => {
      try {
        const file = path.resolve(siteDir, '.' + decodeURI(url));
        if (!file.startsWith(path.resolve(siteDir) + path.sep)) return null;
        const bytes = await fs.readFile(file);
        const info = imageInfo(bytes);
        return info ? { ...info, bytes: bytes.length } : null;
      } catch { return null; }
    })());
  }
  return imageCache.get(key);
}

function attributes(tag) {
  const attrs = new Map();
  for (const match of tag.slice(4, -1).matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function tagFor(attrs) {
  // Existing attribute values are already HTML-escaped by Jekyll/Markdown.
  return '<img ' + [...attrs].map(([key, value]) => `${key}="${value.replaceAll('"', '&quot;')}"`).join(' ') + '>';
}

export async function responsiveImages(html, siteDir) {
  let output = '', cursor = 0, imageIndex = 0;
  for (const match of html.matchAll(/<picture\b[\s\S]*?<\/picture>|<img\b[^>]*>/gi)) {
    output += html.slice(cursor, match.index);
    cursor = match.index + match[0].length;
    if (/^<picture/i.test(match[0])) { output += match[0]; imageIndex++; continue; }
    const attrs = attributes(match[0]);
    const src = attrs.get('src') || '';
    const first = imageIndex++ === 0;
    if (!attrs.has('loading')) attrs.set('loading', first || attrs.get('fetchpriority') === 'high' ? 'eager' : 'lazy');
    if (!attrs.has('decoding')) attrs.set('decoding', 'async');
    if (!/^\/(?:images|assets)\//.test(src) || /[?#&]/.test(src)) { output += tagFor(attrs); continue; }
    const original = await inspect(siteDir, src);
    if (!original) { output += tagFor(attrs); continue; }
    if (!attrs.has('width') && !attrs.has('height')) {
      attrs.set('width', String(original.width)); attrs.set('height', String(original.height));
    }
    if (!original.convertible || attrs.has('srcset') || !/\.(?:jpe?g|png)$/i.test(src)) { output += tagFor(attrs); continue; }
    const stem = src.replace(/\.[^.]+$/, '');
    const candidates = [];
    for (const suffix of ['-small', '-medium', '-large', '']) {
      const url = stem + suffix + '.webp';
      const info = await inspect(siteDir, url);
      if (info && info.width <= original.width && (suffix || info.bytes < 300000 || !candidates.length) && !candidates.some(candidate => candidate.width === info.width)) candidates.push({ url, width: info.width });
    }
    if (!candidates.length) { output += tagFor(attrs); continue; }
    candidates.sort((a, b) => a.width - b.width);
    const displayWidth = Math.min(Number(attrs.get('width')) || original.width, original.width, 680);
    const sizes = attrs.get('sizes') || (displayWidth <= 200 ? `${displayWidth}px` : `(max-width: ${displayWidth + 48}px) calc(100vw - 48px), ${displayWidth}px`);
    const srcset = candidates.map(candidate => `${candidate.url} ${candidate.width}w`).join(', ');
    const fallbacks = [];
    const extension = path.extname(src);
    for (const suffix of ['-small', '-medium', '-large']) {
      const url = stem + suffix + extension;
      const info = await inspect(siteDir, url);
      if (info && !fallbacks.some(candidate => candidate.width === info.width)) fallbacks.push({ url, width: info.width });
    }
    if (fallbacks.length) {
      fallbacks.sort((a, b) => a.width - b.width);
      attrs.set('src', escapeAttribute(fallbacks.at(-1).url));
      attrs.set('srcset', escapeAttribute(fallbacks.map(candidate => `${candidate.url} ${candidate.width}w`).join(', ')));
      attrs.set('sizes', escapeAttribute(sizes));
    }
    output += `<picture><source type="image/webp" srcset="${escapeAttribute(srcset)}" sizes="${escapeAttribute(sizes)}">${tagFor(attrs)}</picture>`;
  }
  return output + html.slice(cursor);
}
