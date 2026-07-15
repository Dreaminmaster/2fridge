import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/2fridge/' : '/',
  build: {
    target: 'es2020',
    sourcemap: false,
  },
}));
