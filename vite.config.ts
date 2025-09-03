import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js'),
        block: resolve(__dirname, 'src/block.html')
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: (assetInfo) => {
          // Keep original file names for css and other assets
          if (assetInfo.name.endsWith('.css')) {
            return '[name][extname]';
          }
          if (assetInfo.name === 'block.html') {
             return '[name][extname]';
          }
          return `assets/[name]-[hash][extname]`;
        },
      }
    }
  }
});
