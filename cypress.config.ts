import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        supportFile: 'cypress/support/e2e.ts',
        experimentalWebKitSupport: true,
        defaultCommandTimeout: 10000,
        viewportWidth: 1280,
        viewportHeight: 720
    },
})