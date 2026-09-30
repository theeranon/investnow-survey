import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DIST_DIR = path.resolve(__dirname, 'dist');

// Enable trust proxy for Cloud Run reverse proxy
app.set('trust proxy', 1);

// Serve static assets from dist
app.use(express.static(DIST_DIR, { index: false }));

// Health check endpoint for Cloud Run
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA fallback: return index.html for all other routes
app.get('*', (_req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><title>Starting</title></head>
<body><p>Initializing...</p></body>
</html>`);
  }
});

// Listen on default app port (3000) for internal proxy / dev
const portA = Number(process.env.DEFAULT_APP_PORT || 3000);
const serverA = app.listen(portA, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${portA}`);
});
serverA.on('error', (err: any) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`Port ${portA} already bound, continuing`);
  } else {
    console.error(`Server error on port ${portA}:`, err);
  }
});

// Also listen on Cloud Run PORT (e.g. 8080) if specified and different from portA
const portB = process.env.PORT ? Number(process.env.PORT) : 8080;
if (portB !== portA) {
  const serverB = app.listen(portB, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${portB}`);
  });
  serverB.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.log(`Port ${portB} in use by platform reverse proxy, serving traffic via port ${portA}`);
    } else {
      console.error(`Server error on port ${portB}:`, err);
    }
  });
}

process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});
