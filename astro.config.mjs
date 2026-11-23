import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://pcl-cats.github.io',
  devToolbar: { enabled: false },
  redirects: {
    '/timeline/': '/diary/?view=milestones',
    '/guide/': '/about/#guide',
  },
});
