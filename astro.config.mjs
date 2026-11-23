import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import siteAssets, { responsiveImages } from './integrations/site-assets.mjs';

export default defineConfig({
  site: 'https://pcl-cats.github.io',
  integrations: [siteAssets()],
  markdown: {
    processor: satteri({ hastPlugins: [responsiveImages] }),
  },
  build: {
    // 样式直接写进页面，少一次会挡住显示的请求
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
  redirects: {
    '/timeline/': '/diary/?view=milestones',
    '/guide/': '/about/#guide',
  },
});
