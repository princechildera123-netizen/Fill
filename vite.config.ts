import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {handleSemanticMatch, handleDocumentExtraction} from './src/server/geminiHandler';

function apiServerPlugin(): Plugin {
  return {
    name: 'fill-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok', app: 'FILL', version: '1.0.0' }));
          return;
        }

        if (req.url === '/api/revenuecat-public-config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            REVENUECAT_PUBLIC_API_KEY: process.env.REVENUECAT_PUBLIC_API_KEY || process.env.VITE_REVENUECAT_PUBLIC_API_KEY || '',
            VITE_REVENUECAT_ANDROID_PUBLIC_KEY: process.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY || '',
            VITE_REVENUECAT_IOS_PUBLIC_KEY: process.env.VITE_REVENUECAT_IOS_PUBLIC_KEY || '',
          }));
          return;
        }

        if (req.url === '/api/semantic-match' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const result = await handleSemanticMatch(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: errorMsg, matches: [] }));
            }
          });
          return;
        }

        if (req.url === '/api/extract-document' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const result = await handleDocumentExtraction(body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: errorMsg, fields: [] }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    envPrefix: ['VITE_', 'REVENUECAT_'],
    define: {
      'process.env.REVENUECAT_PUBLIC_API_KEY': JSON.stringify(process.env.REVENUECAT_PUBLIC_API_KEY || ''),
      'process.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY': JSON.stringify(process.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY || ''),
      'process.env.VITE_REVENUECAT_IOS_PUBLIC_KEY': JSON.stringify(process.env.VITE_REVENUECAT_IOS_PUBLIC_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
