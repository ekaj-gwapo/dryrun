const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

async function initDb() {
  const db = await open({
    filename: path.join(process.cwd(), 'data.db'),
    driver: sqlite3.Database,
  })

  console.log('Creating database tables...')

  try {
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
        particulars TEXT NOT NULL,
        amount REAL NOT NULL,
        date DATETIME NOT NULL,
        controlNumber TEXT,
        accountCode TEXT,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        remarks TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS viewer_access (
        id TEXT PRIMARY KEY,
        viewerId TEXT NOT NULL,
        entryUserId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(viewerId, entryUserId),
        FOREIGN KEY (viewerId) REFERENCES users(id),
        FOREIGN KEY (entryUserId) REFERENCES users(id)
      );
    `)

    console.log('Tables created successfully!')
  } finally {
    await db.close()
  }
}

initDb().catch((e) => {
  console.error(e)
  process.exit(1)
})
