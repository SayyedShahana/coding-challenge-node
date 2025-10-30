import express from 'express';
import 'dotenv/config';
import { importCsvAndUpload } from './importer.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Trigger import: GET /import?path=absoluteCsvPath (falls back to ENV CSV_PATH)
app.post('/import', async (req, res) => {
  const csvPath = (req.query.path && String(req.query.path)) || process.env.CSV_PATH;
  if (!csvPath) {
    res.status(400).json({ error: 'CSV path not provided. Use env CSV_PATH or query ?path=' });
    return;
  }
  try {
    const result = await importCsvAndUpload(csvPath);
    res.json({ imported: result.numImported, skipped: result.numSkipped });
  } catch (error) {
    // Avoid leaking internals; return concise error and log full details to console
    console.error('Import failed:', error);
    res.status(500).json({ error: 'Import failed. Check server logs.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});


