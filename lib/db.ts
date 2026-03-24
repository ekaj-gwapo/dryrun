import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db: any = null;

export async function getDb() {
  if (db) return db;

  db = await open({
    filename: path.join(process.cwd(), 'data.db'),
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

// Initialize database tables
export async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bankName TEXT NOT NULL,
      payee TEXT NOT NULL,
      address TEXT,
      dvNumber TEXT,
      particulars TEXT,
      amount REAL NOT NULL,
      date DATETIME NOT NULL,
      checkNumber TEXT,
      controlNumber TEXT,
      accountCode TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      remarks TEXT,
      fund TEXT DEFAULT 'General Fund',
      responsibilityCenter TEXT,
      moph TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS viewer_access (
      id TEXT PRIMARY KEY,
      viewerId TEXT NOT NULL,
      entryUserId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(viewerId, entryUserId),
      FOREIGN KEY (viewerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (entryUserId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transaction_batches (
      id TEXT PRIMARY KEY,
      viewerId TEXT NOT NULL,
      entryUserId TEXT NOT NULL,
      batchName TEXT,
      transactionCount INTEGER DEFAULT 0,
      totalAmount REAL DEFAULT 0,
      appliedFilters TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (viewerId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (entryUserId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS batch_transactions (
      id TEXT PRIMARY KEY,
      batchId TEXT NOT NULL,
      transactionId TEXT NOT NULL,
      transactionData TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batchId) REFERENCES transaction_batches(id) ON DELETE CASCADE
    );
  `);

  // Add fund column if it doesn't exist (migration for existing databases)
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN fund TEXT DEFAULT "General Fund"');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add responsibilityCenter column if it doesn't exist (migration for existing databases)
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN responsibilityCenter TEXT');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add checkNumber column if it doesn't exist (migration for existing databases)
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN checkNumber TEXT');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add moph column if it doesn't exist (migration for existing databases)
  try {
    await db.run('ALTER TABLE transactions ADD COLUMN moph TEXT');
  } catch (error) {
    // Column already exists, ignore error
  }
}
