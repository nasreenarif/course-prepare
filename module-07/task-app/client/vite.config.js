import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  server: { fs: { allow: [fileURLToPath(new URL('../',import.meta.url))] }, port: 5173, strictPort: true, proxy: { '/api': { target: 'http://127.0.0.1:3000' } } },
  build: { rollupOptions: { input: {
    app: fileURLToPath(new URL('./index.html',import.meta.url)),
    lab: fileURLToPath(new URL('./lab.html',import.meta.url))
  } } }
});
