require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const connection = process.env.DATABASE_URL;

if (!connection) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

async function main() {
  const client = new Client({ connectionString: connection });
  await client.connect();
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS public.foods (
        id BIGSERIAL PRIMARY KEY,
        name text NOT NULL,
        duration text,
        proteins numeric,
        fats numeric,
        carbs numeric,
        sugars numeric,
        vitamins text,
        calories_per_100 numeric,
        tags text[]
      );
    `;
    await client.query(sql);
    console.log('Table `foods` created or already exists.');
  } catch (err) {
    console.error('Failed to create tables:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
