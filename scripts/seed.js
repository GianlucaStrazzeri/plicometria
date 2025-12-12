// Simple Node seed script that reads `.env.local` and inserts sample foods into Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing required env vars. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  const foods = [
    {
      name: 'Manzana',
      duration: '',
      proteins: 0.3,
      fats: 0.2,
      carbs: 14,
      sugars: 10,
      vitamins: 'A,C',
      calories_per_100: 52,
      tags: ['fruta', 'snack'],
    },
    {
      name: 'Pechuga de pollo (100g)',
      duration: '',
      proteins: 31,
      fats: 3.6,
      carbs: 0,
      sugars: 0,
      vitamins: 'B6',
      calories_per_100: 165,
      tags: ['proteína', 'carne'],
    },
  ];

  try {
    const { data, error } = await supabase.from('foods').insert(foods).select();
    if (error) {
      console.error('Seed failed:', error);
      process.exit(1);
    }
    console.log('Inserted rows:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
