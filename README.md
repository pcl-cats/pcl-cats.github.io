# PCL 猫猫

PCL 园区流浪猫的档案和照护日记：<https://pcl-cats.github.io>

网站由园区里照顾猫猫的学生和老师维护。每只猫一份档案，每天的照护写成日记，重要的日子标成大事记。

## 本地预览

需要 Node.js 22.12 或更新版本。

```bash
npm install
npm run dev          # 打开终端里显示的地址，改动会自动刷新
```

发布前检查：

```bash
npm run check:content   # 检查档案、日记里的图片路径和猫猫 id
npm run build           # 生成静态网站到 dist/
```

推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 目录

```
content/            网站内容（Markdown），日常更新只改这里
  cats/             每只猫一个文件
  diary/            每天一篇，YYYY-MM-DD.md
  comics/           每期漫画一个文件
  about.md          关于我们
  guide.md          和猫猫相处
public/
  images/           照片（已压缩成 WebP）
  art/months/       12 张月份插画，首页按月份自动换
  art/cats/         猫猫的卡通形象，<猫的 id>-1.webp … -6.webp
  sw.js             弱网缓存
fonts/              标题字体的原料（霞鹜文楷常用字版）
integrations/       构建时生成字体子集和照片缩略图
src/
  config.ts         站名、导航、外部链接
  lib/content.ts    读取内容、排序、日期格式
  components/       页头、页脚、卡片、贴纸等组件
  pages/            各个页面
  scripts/          页面上的小互动（摸猫、倾斜、出现动画）
  styles/global.css 颜色、字体和通用样式
```

更新内容的方法和文字风格见 [content/README.md](content/README.md)。

## 设计

- 颜色取自 logo 的藏青和暖金，底色是奶油纸色。颜色都定义在 `src/styles/global.css` 开头。
- 标题用 [霞鹜文楷](https://github.com/lxgw/LxgwWenKai-Screen)（SIL OFL 1.1），正文用系统字体。
- 插画来自 PCL-Cats 的文创和台历，背景已去掉。给一只猫加卡通形象，只要把图片按 `public/art/cats/<id>-1.webp` 的格式放进去，档案页会自动用上。
- 所有动画都会照顾系统的“减少动态效果”设置。

## 加载速度

网站主要在国内用手机打开，GitHub Pages 在国内比较慢，所以构建时做了这些处理（见 `integrations/site-assets.mjs`）：

- **字体**：`fonts/` 里放着霞鹜文楷的常用字版本。每次构建只裁出网站标题实际用到的字（约 700 字、180KB），页面一打开就预加载；没及时下载好时先用系统字体，不会中途跳动。换字体版本时运行 `scripts/make-font-source.mjs`。
- **照片**：自动给 `public/images` 里的照片生成 200、400、960 宽的缩略图（放在 `public/thumbs/`，不进 git），列表和卡片只加载小图，正文图片按屏幕挑合适的尺寸，加载前先显示照片的主色。
- **样式**直接写进页面，不再单独请求。
- **缓存**：`public/sw.js` 会把看过的图片和字体存在手机里，再打开时直接读本地；页面内容始终先从网上取最新的。需要停用时，按文件开头的说明替换它。

## 内容和图片

猫猫照片、插画和漫画归 PCL-Cats 所有。原始 Word 文档和照护群里的资料不放进仓库。
