// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://btchome.app',
  integrations: [react()],

  server: {
    port: 8642,
    host: true
  },

  vite: {
    plugins: [tailwindcss()]
  },

  // Optimize for production deployment
  build: {
    inlineStylesheets: 'auto',
  },

  // Enable SPA mode for client-side routing
  output: 'static',
});