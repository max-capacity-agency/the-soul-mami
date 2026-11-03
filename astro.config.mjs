import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SHOW_JOURNAL } from './src/lib/site.ts';

export default defineConfig({
  site: 'https://thesoulmami.com',
  integrations: [
    react(),
    // Leaves out the 404 page, and the journal while it's hidden.
    sitemap({ filter: (page) => !page.includes('/404') && (SHOW_JOURNAL || !/\/journal\//.test(page)) }),
  ],
});
