import { defineConfig } from 'vite';

export default defineConfig({
  base: '/2fridge/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
