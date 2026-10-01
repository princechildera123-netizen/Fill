import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleSemanticMatch, handleDocumentExtraction } from './src/server/geminiHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

// API health route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'FILL', timestamp: Date.now() });
});

// Public RevenueCat configuration (Only returns non-secret public keys)
app.get('/api/revenuecat-public-config', (_req, res) => {
  res.json({
    REVENUECAT_PUBLIC_API_KEY: process.env.REVENUECAT_PUBLIC_API_KEY || process.env.VITE_REVENUECAT_PUBLIC_API_KEY || '',
    VITE_REVENUECAT_ANDROID_PUBLIC_KEY: process.env.VITE_REVENUECAT_ANDROID_PUBLIC_KEY || '',
    VITE_REVENUECAT_IOS_PUBLIC_KEY: process.env.VITE_REVENUECAT_IOS_PUBLIC_KEY || '',
  });
});

// Semantic Match Route using Gemini 3.8 Flash
app.post('/api/semantic-match', async (req, res) => {
  try {
    const result = await handleSemanticMatch(req.body);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg, matches: [] });
  }
});

// Multimodal Document Extraction Route
app.post('/api/extract-document', async (req, res) => {
  try {
    const result = await handleDocumentExtraction(req.body);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: errorMsg, fields: [] });
  }
});

// Serve production static assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all SPA routes to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`FILL server listening on port ${port}`);
});
