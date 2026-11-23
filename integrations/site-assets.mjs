// 构建前处理静态资源，让网站在慢网络下也能快一些：
//
// 1. 字体：从 fonts/ 里的霞鹜文楷裁出网站标题实际用到的字，生成一个约 200KB 的字体文件。
// 2. 照片：给 public/images 里的每张照片生成 200 / 400 / 960 宽的缩略图，记下原图尺寸和主色。
//
// 生成的文件放在 public/fonts、public/thumbs（不进 git），
// 页面通过 `virtual:site-assets` 拿到字体地址和图片信息。
// Markdown 正文里的图片由 responsiveImages 插件自动加上 srcset、尺寸和懒加载。

import { createHash } from 'node:crypto';
import { existsSync, globSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import subsetFont from 'subset-font';

export const THUMB_WIDTHS = [200, 400, 960];

const FONT_SOURCE = 'fonts/LXGWWenKaiGBScreen-GB2312.woff2';
const BASE_CHARS =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
  '，。、：；？！“”‘’（）《》〈〉【】「」·…—～' +
  '一二三四五六七八九十年月日周';

const VIRTUAL_ID = 'virtual:site-assets';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/** 构建期间共享的结果，rehype 插件也会读它。 */
const state = { fontUrl: '', images: {} };

/** 缩略图地址：/thumbs/400/images/cats/huahua.webp */
export const thumbPath = (src, width) => `/thumbs/${width}${src.replace(/\.\w+$/, '.webp')}`;

/* ---------- 字体 ---------- */

function collectChars(root) {
  let text = BASE_CHARS;
  for (const file of globSync('content/**/*.md', { cwd: root })) {
    const raw = readFileSync(join(root, file), 'utf8');
    const front = raw.split(/^---$/m)[1] ?? '';
    // 标题、名字、花色、关系、出场猫咪会用手写字体显示
    for (const match of front.matchAll(/^\s*-?\s*(title|name|cast|appearance|label):\s*(.+)$/gm)) text += match[2];
    for (const match of raw.matchAll(/^#{1,4}\s+(.+)$/gm)) text += match[1];
  }
  // 页面里写死的文字（导航、标题、按钮）
  for (const file of globSync('src/**/*.{astro,ts}', { cwd: root })) text += readFileSync(join(root, file), 'utf8');
  return [...new Set(text)].filter((char) => char.codePointAt(0) >= 0x20).join('');
}

async function buildFont(root, logger) {
  const source = readFileSync(join(root, FONT_SOURCE));
  const chars = collectChars(root);
  const font = await subsetFont(source, chars, { targetFormat: 'woff2' });
  const hash = createHash('sha256').update(font).digest('hex').slice(0, 10);
  const dir = join(root, 'public/fonts');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `wenkai-${hash}.woff2`), font);
  logger.info(`标题字体：${chars.length} 个字符，${Math.round(font.length / 1024)} KB`);
  return `/fonts/wenkai-${hash}.woff2`;
}

/* ---------- 照片 ---------- */

async function processImage(root, file, cached) {
  const src = `/${file.slice('public/'.length)}`;
  const full = join(root, file);
  const mtime = statSync(full).mtimeMs;
  const outputs = (info) => info.thumbs.map((width) => join(root, 'public', thumbPath(src, width)));
  if (cached && cached.mtime === mtime && outputs(cached).every((path) => existsSync(path))) return [src, cached];

  const image = sharp(full).rotate(); // 按 EXIF 方向摆正
  const meta = await image.metadata();
  const swap = (meta.orientation ?? 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;
  const [r, g, b] = await image.clone().resize(1, 1, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const color = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

  // 每种宽度都生成（原图更小时不放大），这样缩略图地址总是固定的
  const thumbs = THUMB_WIDTHS;
  for (const w of thumbs) {
    const out = join(root, 'public', thumbPath(src, w));
    mkdirSync(dirname(out), { recursive: true });
    await image.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 70, effort: 5 }).toFile(out);
  }
  return [src, { mtime, width, height, color, thumbs }];
}

async function buildImages(root, logger) {
  const cacheFile = join(root, 'node_modules/.cache/site-assets/images.json');
  const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {};
  const files = globSync('public/images/**/*.{webp,jpg,jpeg,png}', { cwd: root }).map((f) => f.replaceAll('\\', '/'));
  const images = {};
  const started = Date.now();
  // 一次处理 4 张，避免占满内存
  for (let i = 0; i < files.length; i += 4) {
    const batch = await Promise.all(
      files.slice(i, i + 4).map((file) => processImage(root, file, cache[`/${file.slice('public/'.length)}`])),
    );
    for (const [src, info] of batch) images[src] = info;
  }
  mkdirSync(dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(images));

  // Astro 会缓存渲染好的 Markdown。图片信息变了，就清掉这份缓存，让正文重新生成。
  const key = createHash('sha256')
    .update(JSON.stringify([THUMB_WIDTHS, Object.entries(images).map(([src, i]) => [src, i.width, i.height, i.color])]))
    .digest('hex');
  const keyFile = join(dirname(cacheFile), 'render-key');
  if (!existsSync(keyFile) || readFileSync(keyFile, 'utf8') !== key) {
    for (const dir of ['.astro', 'node_modules/.astro']) {
      rmSync(join(root, dir, 'data-store.json'), { force: true });
      rmSync(join(root, dir, 'data-store'), { recursive: true, force: true });
    }
    writeFileSync(keyFile, key);
  }
  logger.info(`照片缩略图：${files.length} 张，用时 ${((Date.now() - started) / 1000).toFixed(1)} 秒`);
  return images;
}

/* ---------- Markdown 图片 ---------- */

/**
 * Markdown 处理器（Sätteri）的插件：给正文里的 /images/ 图片
 * 加上 srcset、真实尺寸、懒加载和占位底色。
 */
export const responsiveImages = {
  name: 'responsive-images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      for (const [key, value] of Object.entries(imageProps(node.properties?.src))) ctx.setProperty(node, key, value);
    },
  },
};

function imageProps(src) {
  const props = { loading: 'lazy', decoding: 'async' };
  const info = state.images[src];
  if (!info) return props;
  Object.assign(props, { width: info.width, height: info.height, style: `background-color:${info.color}` });
  if (info.thumbs.length) {
    // 最大用 960 宽：手机上已经足够清楚，也省流量
    props.srcSet = info.thumbs.map((w) => `${thumbPath(src, w)} ${Math.min(w, info.width)}w`).join(', ');
    props.sizes = '(min-width: 800px) 720px, calc(100vw - 40px)';
    props.src = thumbPath(src, info.thumbs.at(-1));
  }
  return props;
}

/* ---------- Astro 集成 ---------- */

export default function siteAssets() {
  return {
    name: 'site-assets',
    hooks: {
      'astro:config:setup': async ({ config, logger, updateConfig }) => {
        const root = fileURLToPath(config.root);
        state.fontUrl = await buildFont(root, logger);
        state.images = await buildImages(root, logger);
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'site-assets',
                resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
                load: (id) =>
                  id === RESOLVED_ID
                    ? `export const fontUrl = ${JSON.stringify(state.fontUrl)};\nexport const images = ${JSON.stringify(state.images)};`
                    : undefined,
              },
            ],
          },
        });
      },
    },
  };
}
