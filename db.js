import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function migrate() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS public.users (
      id serial NOT NULL,
      name varchar NOT NULL,
      age int NOT NULL,
      address jsonb NULL,
      additional_info jsonb NULL
    );
  `;
  await pool.query(createSql);
}

export async function insertUser({ name, age, address, additionalInfo }) {
  const text = `INSERT INTO public.users(name, age, address, additional_info)
               VALUES ($1, $2, $3, $4)`;
  const values = [name, age, address ?? null, additionalInfo ?? null];
  await pool.query(text, values);
}

export async function getAgeDistribution() {
  const res = await pool.query('SELECT age FROM public.users');
  const ages = res.rows.map(r => Number(r.age)).filter(n => Number.isFinite(n));
  const buckets = {
    lt20: 0,
    b20_40: 0,
    b40_60: 0,
    gte60: 0,
  };
  for (const a of ages) {
    if (a < 20) buckets.lt20 += 1;
    else if (a < 40) buckets.b20_40 += 1;
    else if (a < 60) buckets.b40_60 += 1;
    else buckets.gte60 += 1;
  }
  const total = ages.length || 1;
  return {
    '< 20': Math.round((buckets.lt20 / total) * 100),
    '20 to 40': Math.round((buckets.b20_40 / total) * 100),
    '40 to 60': Math.round((buckets.b40_60 / total) * 100),
    '>= 60': Math.round((buckets.gte60 / total) * 100),
  };
}


