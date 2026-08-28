import { defineConfig, devices } from '@playwright/test';

/*
 * The suite runs against a real build served by `astro preview`, not the dev
 * server. Several of the things it asserts — hashed asset paths, the base
 * prefix, whether anything external is fetched — only exist in a production
 * build, so testing the dev server would test the wrong artefact.
 */
export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4321',
		trace: 'retain-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		/*
		 * Not `astro preview`: as of Astro 7 it always daemonises, so the
		 * foreground process exits at once and Playwright reads that as a crash.
		 * scripts/serve-dist.mjs blocks, and resolves routes the way nginx.conf
		 * does, so these tests exercise production's URL semantics.
		 */
		command: 'npm run build && node scripts/serve-dist.mjs',
		url: 'http://localhost:4321',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
