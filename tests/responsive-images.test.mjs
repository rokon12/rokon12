import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { imageInfo, responsiveImages } from '../scripts/responsive-images.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('article hero uses real responsive assets; following remote images load lazily', async () => {
  const html = '<img src="/images/mysql-json-duality-views-java-ai.jpeg" alt="Tables &amp; JSON" fetchpriority="high"><img src="https://example.com/diagram.png" alt="Diagram">';
  const output = await responsiveImages(html, root);
  assert.match(output, /mysql-json-duality-views-java-ai-small.webp 400w/);
  assert.match(output, /mysql-json-duality-views-java-ai-medium.webp 800w/);
  assert.match(output, /width="2752" height="1536"/);
  assert.match(output, /alt="Tables &amp; JSON"/);
  assert.match(output, /fetchpriority="high" loading="eager"/);
  assert.match(output, /src="https:\/\/example.com\/diagram.png" alt="Diagram" loading="lazy"/);
  assert.equal(await responsiveImages(output, root), output, 'processing twice must not wrap pictures again');
});

test('existing picture markup and explicitly sized thumbnails are preserved', async () => {
  const picture = '<picture><source type="image/webp" srcset="/custom.webp"><img src="/custom.jpg" alt="Custom"></picture>';
  assert.equal(await responsiveImages(picture, root), picture);
  const thumbnail = await responsiveImages('<img src="/images/author_photo.jpg" width="56" height="56" loading="lazy" alt="Author">', root);
  assert.match(thumbnail, /sizes="56px"/);
  assert.match(thumbnail, /width="56" height="56" loading="lazy"/);
  assert.doesNotMatch(thumbnail, /author_photo\.webp \d+w/, 'do not send the 4.8 MB full-size portrait');
});

test('missing and animated sources do not produce invented alternatives', async () => {
  for (const src of ['/images/missing.jpg', '/images/animated.gif', '/images/../../outside.jpg']) {
    const output = await responsiveImages(`<img src="${src}" alt="Example">`, root);
    assert.doesNotMatch(output, /<picture|srcset=/);
  }
});

test('dimensions match the supplied original and generated WebP', async () => {
  const original = imageInfo(await fs.readFile(path.join(root, 'images/mysql-json-duality-views-java-ai.jpeg')));
  const webp = imageInfo(await fs.readFile(path.join(root, 'images/mysql-json-duality-views-java-ai-medium.webp')));
  assert.equal(original.width, 2752);
  assert.equal(original.height, 1536);
  assert.equal(webp.width, 800);
  assert.equal(webp.height, 446);
});
