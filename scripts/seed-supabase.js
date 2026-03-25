const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
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

async function main() {
  console.log('Seeding Supabase database...');

  try {
    // 1. Create entry user
    const entryHash = await bcrypt.hash('Demo123456!', 10);
    const { data: entryUser, error: entryError } = await supabase
      .from('users')
      .upsert({ email: 'entry@demo.com', password: entryHash, role: 'entry_user' }, { onConflict: 'email' })
      .select()
      .single();

    if (entryError) throw entryError;

    // 2. Create viewer user
    const viewerHash = await bcrypt.hash('Demo123456!', 10);
    const { data: viewerUser, error: viewerError } = await supabase
      .from('users')
      .upsert({ email: 'viewer@demo.com', password: viewerHash, role: 'viewer_user' }, { onConflict: 'email' })
      .select()
      .single();

    if (viewerError) throw viewerError;

    // 3. Assign viewer to entry user
    const { error: accessError } = await supabase
      .from('viewer_access')
      .upsert({ viewerid: viewerUser.id, entryuserid: entryUser.id }, { onConflict: 'viewerid,entryuserid' });

    if (accessError) throw accessError;

    // 4. Create sample transaction
    const { error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          userid: entryUser.id,
          bankname: 'Land Bank of the Philippines',
          payee: 'LBP VELEZ',
          address: 'Manila',
          dvnumber: '125902-01-30',
          particulars: 'CASH ADVANCE FOR PAYMENT OF SALARY & PERA & ETC',
          amount: 1299398.82,
          date: '2025-01-14',
          controlnumber: 'MAN25-0308',
          accountcode: '10305020',
          debit: 1299398.82,
          credit: 0,
          remarks: 'Sample transaction',
          moph: 'Cagayan de Oro'
        }
      ]);

    if (txError) throw txError;

    console.log('Supabase database seeded successfully!');
    console.log('Entry User: entry@demo.com / Demo123456!');
    console.log('Viewer User: viewer@demo.com / Demo123456!');
  } catch (error) {
    console.error('Error seeding Supabase:', error.message || error);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    if (error.code) console.error('Code:', error.code);
  }
}

main().catch(console.error);
