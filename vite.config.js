import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/about.html'),
        work: resolve(__dirname, 'src/work.html'),
        projectDetail: resolve(__dirname, 'src/project-detail.html'),
      },
    },
  },
});
