import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function clearBatches() {
  try {
    const db = await open({
      filename: path.join(process.cwd(), 'data.db'),
      driver: sqlite3.Database,
    });

    console.log('Connected to database...');

    // Delete all batches from transaction_batches table
    const result = await db.run('DELETE FROM transaction_batches');
    console.log(`✓ Deleted ${result.changes} batch records`);

    // Verify transactions are still there
    const txCount = await db.get('SELECT COUNT(*) as count FROM transactions');
    console.log(`✓ Success! Your transactions are preserved. Transaction count: ${txCount.count}`);
    console.log('Next batch created will be numbered 01');

    await db.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearBatches();
