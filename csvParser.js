import fs from 'fs';

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        const next = line[i + 1];
        if (next === '"') {
          current += '"';
          i += 1; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === ',') {
        values.push(current);
        current = '';
      } else if (char === '"') {
        inQuotes = true;
      } else {
        current += char;
      }
    }
  }
  values.push(current);
  return values.map(v => v.trim());
}

export function* readCsvRows(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Normalize Windows and Unix line endings, keep empty trailing lines out
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return;
  const header = parseCsvLine(lines[0]);
  yield header;
  for (let i = 1; i < lines.length; i += 1) {
    yield parseCsvLine(lines[i]);
  }
}

export function buildNestedObject(flatObj) {
  const nested = {};
  for (const [rawKey, value] of Object.entries(flatObj)) {
    if (rawKey.length === 0) continue;
    const path = rawKey.split('.');
    let cursor = nested;
    for (let i = 0; i < path.length; i += 1) {
      const key = path[i];
      const isLeaf = i === path.length - 1;
      if (isLeaf) {
        cursor[key] = value;
      } else {
        if (cursor[key] == null || typeof cursor[key] !== 'object') {
          cursor[key] = {};
        }
        cursor = cursor[key];
      }
    }
  }
  return nested;
}

export function parseCsvFileToObjects(filePath) {
  const iterator = readCsvRows(filePath);
  const header = iterator.next().value;
  if (!header) return [];
  const objects = [];
  for (const row of iterator) {
    const flat = {};
    for (let i = 0; i < header.length; i += 1) {
      const key = header[i];
      const cell = row[i] ?? '';
      flat[key] = cell;
    }
    const nested = buildNestedObject(flat);
    objects.push(nested);
  }
  return objects;
}


