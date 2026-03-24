import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function deleteBatches() {
  try {
    const db = await open({
      filename: path.join(process.cwd(), 'data.db'),
      driver: sqlite3.Database,
    });

    // Delete all batch transactions first (due to foreign key constraint)
    await db.run('DELETE FROM batch_transactions');
    console.log('Deleted all batch transactions');

    // Delete all transaction batches
    await db.run('DELETE FROM transaction_batches');
    console.log('Deleted all transaction batches');

    await db.close();
    console.log('Batch deletion complete! You can now start creating batches from 01.');
  } catch (error) {
    console.error('Error deleting batches:', error);
    process.exit(1);
  }
}

deleteBatches();
