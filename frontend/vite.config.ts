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
      '/nginx': {
        target: 'http://nginx:80',
        changeOrigin: true,
        // strip the /qgis prefix so QGIS still sees ?SERVICE=...
        rewrite: (path) => path.replace(/^\/nginx/, ''),
        configure: (proxy) => {
          // add permissive CORS headers on the fly (dev only)
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Headers'] = '*';
          });
        }
      }
    }
  }
});
