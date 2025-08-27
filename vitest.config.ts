import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/layouts': '/src/layouts',
      '@/stores': '/src/stores',
      '@/utils': '/src/utils',
      '@/types': '/src/types',
      '@/services': '/src/services',
      '@/styles': '/src/styles',
    },
  },
});
