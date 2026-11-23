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
- 标题用 [霞鹜文楷](https://github.com/lxgw/LxgwWenKai)（SIL OFL 1.1），按需分片加载；正文用系统字体。
- 插画来自 PCL-Cats 的文创和台历，背景已去掉。给一只猫加卡通形象，只要把图片按 `public/art/cats/<id>-1.webp` 的格式放进去，档案页会自动用上。
- 所有动画都会照顾系统的“减少动态效果”设置。

## 内容和图片

猫猫照片、插画和漫画归 PCL-Cats 所有。原始 Word 文档和照护群里的资料不放进仓库。
