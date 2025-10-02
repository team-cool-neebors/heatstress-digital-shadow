import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  assetsInclude: ['**/*.glb'],
  plugins: [react()],
  server: {
    proxy: {
      '/3dbag': {
        target: 'https://api.3dbag.nl',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/3dbag/, '')
      },
      '/qgis': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/qgis/, '')
      }
    }
  }
});
