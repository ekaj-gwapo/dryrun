const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(60000) })
  }
});

function lowercaseKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const newObj = {};
  for (const key in obj) {
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
}

async function migrate() {
  const db = await open({
    filename: path.join(process.cwd(), 'data.db'),
    driver: sqlite3.Database,
  });

  console.log('Starting migration...');

  // 1. Migrate Users
  console.log('Migrating users...');
  const users = await db.all('SELECT * FROM users');
  if (users.length > 0) {
    const { error: userError } = await supabase.from('users').upsert(users.map(lowercaseKeys));
    if (userError) console.error('Error migrating users:', userError);
    else console.log(`Migrated ${users.length} users.`);
  }

  // 2. Migrate Transactions
  console.log('Migrating transactions...');
  const transactions = await db.all('SELECT * FROM transactions');
  if (transactions.length > 0) {
    const { error: txError } = await supabase.from('transactions').upsert(transactions.map(lowercaseKeys));
    if (txError) console.error('Error migrating transactions:', txError);
    else console.log(`Migrated ${transactions.length} transactions.`);
  }

  // 3. Migrate Viewer Access
  console.log('Migrating viewer access...');
  const access = await db.all('SELECT * FROM viewer_access');
  if (access.length > 0) {
    const { error: accessError } = await supabase.from('viewer_access').upsert(access.map(lowercaseKeys));
    if (accessError) console.error('Error migrating viewer access:', accessError);
    else console.log(`Migrated ${access.length} access records.`);
  }

  // 4. Migrate Transaction Batches
  console.log('Migrating transaction batches...');
  const batches = await db.all('SELECT * FROM transaction_batches');
  if (batches.length > 0) {
    const formattedBatches = batches.map(b => {
      const lowered = lowercaseKeys(b);
      lowered.appliedfilters = typeof lowered.appliedfilters === 'string' ? JSON.parse(lowered.appliedfilters) : lowered.appliedfilters;
      return lowered;
    });
    const { error: batchError } = await supabase.from('transaction_batches').upsert(formattedBatches);
    if (batchError) console.error('Error migrating batches:', batchError);
    else console.log(`Migrated ${batches.length} batches.`);
  }

  // 5. Migrate Batch Transactions
  console.log('Migrating batch transactions...');
  const batchTransactions = await db.all('SELECT * FROM batch_transactions');
  if (batchTransactions.length > 0) {
    const formattedBTs = batchTransactions.map(bt => {
      const lowered = lowercaseKeys(bt);
      lowered.transactiondata = typeof lowered.transactiondata === 'string' ? JSON.parse(lowered.transactiondata) : lowered.transactiondata;
      return lowered;
    });
    const { error: btError } = await supabase.from('batch_transactions').upsert(formattedBTs);
    if (btError) console.error('Error migrating batch transactions:', btError);
    else console.log(`Migrated ${batchTransactions.length} batch transaction records.`);
  }

  console.log('Migration completed!');
  await db.close();
}

migrate().catch(console.error);
