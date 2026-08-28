/*
 * A blocking static server for dist/, used by the Playwright suite.
 *
 * Two reasons this exists rather than `astro preview`:
 *
 *   1. Astro 7's preview always daemonises — the foreground process exits
 *      immediately — so Playwright's webServer treats it as a crash.
 *
 *   2. More usefully, this mirrors the route resolution in nginx.conf
 *      (try_files $uri $uri.html $uri/index.html =404, with a real 404 status
 *      on the custom page). The tests therefore exercise the same URL
 *      semantics as production, which preview does not.
 *
 * No dependencies, so CI needs nothing beyond node.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.pdf': 'application/pdf',
	'.woff2': 'font/woff2',
};

async function readIfFile(path) {
	try {
		if (!(await stat(path)).isFile()) return null;
		return await readFile(path);
	} catch {
		return null;
	}
}

createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	// normalize collapses any ../ before it can escape the root.
	const rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
	const base = join(ROOT, rel);

	for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
		const body = await readIfFile(candidate);
		if (body) {
			res.writeHead(200, { 'Content-Type': TYPES[extname(candidate)] ?? 'application/octet-stream' });
			res.end(req.method === 'HEAD' ? undefined : body);
			return;
		}
	}

	// The custom page, with a real 404 — not a 200, which would invite crawlers
	// to index every broken URL as a real page.
	const notFound = await readIfFile(join(ROOT, '404.html'));
	res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
	res.end(req.method === 'HEAD' ? undefined : (notFound ?? 'Not found'));
}).listen(PORT, () => console.log(`serving dist/ on http://localhost:${PORT}`));
