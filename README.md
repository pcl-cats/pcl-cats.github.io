# PCL 猫猫图鉴

基于园区猫咪档案与照护日记制作的静态网站。桌面与手机都有独立适配的布局；内容由 Markdown 文件维护，网站构建时生成页面。

## 本地预览

```bash
npm install
npm run dev
```

访问终端显示的本地地址。发布前可运行：

```bash
npm run check:content
npm run build
```

## 更新内容

猫咪档案、日记、大事记标记、漫画和图片的维护方式见 [content/README.md](content/README.md)。大事记与日记共用正文，在日记文件里设置 `milestone: true` 即可。

原始 Word 文件未纳入公开仓库。网站只使用已筛选、压缩过的图片。

## 发布

仓库名为 `pcl-cats.github.io`，推送到 `main` 后由 GitHub Actions 构建。首次发布需要在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
