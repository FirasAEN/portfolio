import { defineConfig } from 'astro/config';


const isDev = import.meta.env.DEV;

let base = isDev ? '/' : '/portfolio';
// https://astro.build/config
export default defineConfig({
    site: 'https://firasaen.github.io', // Use to generate your sitemap and canonical URLs in your final build.
    base,
    trailingSlash: 'ignore', // Use to always append '/' at end of url
    // Timeline and About are now sections of the homepage narrative; the old
    // routes still resolve so existing links and bookmarks keep working.
    // Redirect targets are not base-prefixed automatically, so build them from
    // the same `base` value the rest of the site uses.
    redirects: {
        '/about': `${base.replace(/\/$/, '')}/#about`,
        '/timeline': `${base.replace(/\/$/, '')}/#timeline`,
    },
});
