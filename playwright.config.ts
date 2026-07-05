import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: "http://localhost:3280",

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry"
    },

    /*
     * Raise the default assertion timeout from Playwright's 5s. Several real-time
     * UI assertions (toasts and live item/list updates delivered over SSE) are
     * timing-sensitive, and 5s is too tight when the app runs against a slower
     * backend - the Postgres e2e lane is ~2.5x slower than SQLite because every
     * query is a TCP round-trip rather than an in-process call. Helpers that
     * intentionally use a short timeout for negative assertions pass their own
     * explicit timeout, so they are unaffected by this default.
     */
    expect: {
        timeout: 15000
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "setup",
            testMatch: /global\.setup\.ts/
        },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
            dependencies: ["setup"]
        }
        // {
        //     name: "firefox",
        //     use: { ...devices["Desktop Firefox"] },
        //     dependencies: ["setup"]
        // },
        // {
        //     name: "webkit",
        //     use: { ...devices["Desktop Safari"] },
        //     dependencies: ["setup"]
        // }

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        // Defaults to the SQLite compose file. Set PLAYWRIGHT_DOCKER_COMPOSE_FILE
        // to tests/docker/docker-compose.postgres.yaml to run the same suite
        // against Postgres instead (see the "test-postgres" CI job).
        command: `docker compose -f ${process.env.PLAYWRIGHT_DOCKER_COMPOSE_FILE ?? "tests/docker/docker-compose.yaml"} up --remove-orphans --renew-anon-volumes --force-recreate`,
        url: "http://localhost:3280",
        gracefulShutdown: {
            signal: "SIGTERM",
            timeout: 15000
        },
        timeout: 60000 * 5,
        stdout: "pipe",
        stderr: "pipe",
        reuseExistingServer: false
    }
});
