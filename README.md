# coding-challenge-node
Node.js service that converts CSV rows into nested JSON (supports dot‑notation), validates required fields, and saves data to PostgreSQL. Exposes POST /import to trigger uploads, auto‑migrates the users table, and prints age‑group distribution on the server console. Uses a custom CSV parser (no CSV libraries) with clear, maintainable modules.
