import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import app from './app.js';
import { runMigrations } from './database/migrate.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Run database migrations and verify schema
    await runMigrations();

    // 2. Setup frontend serving
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Server] Initializing Vite middleware for dynamic development...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('[Server] Serving production static build from dist/...');
      const distPath = path.resolve(__dirname, '../dist');
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    // 3. Listen on port 3000
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[MedScan] Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup failure:', err);
    process.exit(1);
  }
}

startServer();
