# coding-challenge-node
Node.js service that converts CSV rows into nested JSON (supports dot‑notation), validates required fields, and saves data to PostgreSQL. Exposes POST /import to trigger uploads, auto‑migrates the users table, and prints age‑group distribution on the server console. Uses a custom CSV parser (no CSV libraries) with clear, maintainable modules.
2## Kelp CSV ➜ JSON Converter API

This Node.js service exposes an API that reads a CSV file, converts each row into a nested JSON object (supporting dot-notation for deep properties), uploads data to PostgreSQL, and prints the age distribution report to the console.

### Requirements
- Node 18+
- PostgreSQL 13+

### Install
```bash
npm install
```

### Configure
Create a `.env` file in the project root (see keys below). You may also set these via your shell environment.

Required keys:
- `PORT` (default `3000`)
- Either `DATABASE_URL` or discrete `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSL`
- `CSV_PATH` absolute path to the CSV file (can be overridden per request with `?path=`)

Example on Windows PowerShell:
```powershell
$env:PORT=3000
$env:PGHOST="localhost"; $env:PGPORT=5432; $env:PGUSER="postgres"; $env:PGPASSWORD="postgres"; $env:PGDATABASE="kelp"; $env:PGSSL="false"
$env:CSV_PATH="C:\\kelp\\sample.csv"
```

Example on Windows Command Prompt (cmd):
```cmd
set PORT=3000
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGPASSWORD=postgres
set PGDATABASE=kelp
set PGSSL=false
set CSV_PATH=C:\kelp\sample.csv
```

Quick .env sample:
```
PORT=3000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=kelp
PGSSL=false
CSV_PATH=C:\\kelp\\sample.csv
```

### Run
```bash
npm run start
# or during development
npm run dev
```

### API
- `POST /import?path=ABSOLUTE_CSV_PATH` — triggers import. If `path` is not provided, the service uses `CSV_PATH` from environment.

Response:
```json
{ "imported": 10, "skipped": 0 }
```

During the run, the app prints the age-group percentage distribution using `console.table`.

Curl examples:
```cmd
:: Command Prompt (cmd)
curl -X POST "http://localhost:3000/import"
curl -X POST "http://localhost:3000/import?path=C:\kelp\sample.csv"
```
```powershell
# PowerShell (use the real curl executable)
curl.exe -X POST "http://localhost:3000/import"
curl.exe -X POST "http://localhost:3000/import?path=C:/kelp/sample.csv"
```

### CSV Format
- First line is the header with property keys
- Nested properties use dot-notation, e.g. `name.firstName,name.lastName,age,address.line1,address.city,gender`
- Mandatory fields per row: `name.firstName`, `name.lastName`, `age`
- Complex properties such as `address.*` are stored in `address` JSONB; all other extra properties are stored in `additional_info`

### Database
The app will auto-create the table if it does not exist:

```sql
CREATE TABLE public.users (
  id serial NOT NULL,
  name varchar NOT NULL,
  age int NOT NULL,
  address jsonb NULL,
  additional_info jsonb NULL
);
```

### Notes
- CSV parsing is implemented without third‑party CSV libraries. It supports quoted fields, commas inside quotes, and escaped quotes using `""`.
- Very large CSVs can be processed as long as they fit in memory. For truly massive files, swap `parseCsvFileToObjects` with a streaming importer.

OUTPUTS:
<img width="752" height="690" alt="Image" src="https://github.com/user-attachments/assets/cd2528a0-0fff-40ba-85f9-87b3804414bd" />
<img width="932" height="52" alt="Image" src="https://github.com/user-attachments/assets/52241323-82d8-4e28-a490-112d29f61f85" />
<img width="573" height="332" alt="Image" src="https://github.com/user-attachments/assets/6235447f-d27c-47e2-9279-0e7bcba6880c" />


