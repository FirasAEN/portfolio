import { defineConfig } from 'astro/config';


const isDev = import.meta.env.DEV;

let base = isDev ? '.' : '/portfolio';
// https://astro.build/config
export default defineConfig({
    site: 'https://firasaen.github.io', // Use to generate your sitemap and canonical URLs in your final build.
    base,
    trailingSlash: 'ignore', // Use to always append '/' at end of url
});
