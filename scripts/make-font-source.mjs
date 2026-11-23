// 生成 fonts/LXGWWenKaiGBScreen-GB2312.woff2：网站标题字体的“原料”。
// 只需要在换字体版本时运行一次，平时构建会从它裁出网站真正用到的字。
//
// 用法：
//   1. 从 https://github.com/lxgw/LxgwWenKai-Screen/releases 下载 LXGWWenKaiGBScreen.ttf
//   2. node scripts/make-font-source.mjs path/to/LXGWWenKaiGBScreen.ttf
//
// 保留 GB2312 的 6763 个汉字、常用标点和网站现有内容用到的字，压成 WOFF2（约 2MB）。

import { readFileSync, writeFileSync, globSync } from 'node:fs';
import subsetFont from 'subset-font';

const input = process.argv[2];
if (!input) {
  console.error('用法：node scripts/make-font-source.mjs LXGWWenKaiGBScreen.ttf');
  process.exit(1);
}

const decoder = new TextDecoder('gb18030');
let chars = '';
for (let hi = 0xa1; hi <= 0xf7; hi++) {
  for (let lo = 0xa1; lo <= 0xfe; lo++) {
    const char = decoder.decode(new Uint8Array([hi, lo]));
    if (char !== '�') chars += char;
  }
}
for (let code = 0x20; code < 0x7f; code++) chars += String.fromCodePoint(code);
for (let code = 0x3000; code < 0x3040; code++) chars += String.fromCodePoint(code); // 中文标点
for (let code = 0xff00; code < 0xfff0; code++) chars += String.fromCodePoint(code); // 全角符号
chars += '—–…·‘’“”•′″℃';
for (const file of globSync('{content,src}/**/*.{md,astro,ts}')) chars += readFileSync(file, 'utf8');

const unique = [...new Set(chars)].join('');
const font = await subsetFont(readFileSync(input), unique, { targetFormat: 'woff2' });
writeFileSync('fonts/LXGWWenKaiGBScreen-GB2312.woff2', font);
console.log(`已写入 fonts/LXGWWenKaiGBScreen-GB2312.woff2：${unique.length} 个字符，${(font.length / 1048576).toFixed(2)} MB`);
