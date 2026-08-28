import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';


const isDev = import.meta.env.DEV;

let base = isDev ? '/' : '/portfolio';
// https://astro.build/config
export default defineConfig({
    site: 'https://firasaen.github.io', // Use to generate your sitemap and canonical URLs in your final build.
    base,
    trailingSlash: 'ignore', // Use to always append '/' at end of url
    // 404 is a real route but not a page anyone should be sent to from search.
    integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
    // Timeline and About are now sections of the homepage narrative; the old
    // routes still resolve so existing links and bookmarks keep working.
    // Redirect targets are not base-prefixed automatically, so build them from
    // the same `base` value the rest of the site uses.
    redirects: {
        '/about': `${base.replace(/\/$/, '')}/#about`,
        '/timeline': `${base.replace(/\/$/, '')}/#timeline`,
    },
});
