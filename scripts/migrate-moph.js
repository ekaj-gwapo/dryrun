const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')

async function migrate() {
  const dbPath = path.join(process.cwd(), 'data.db')
  console.log('Opening database at:', dbPath)
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  const standardFunds = ['General Fund', 'Development Fund', 'Trust Fund', 'Hospital Fund']
  const placeholders = standardFunds.map(() => '?').join(',')
  
  // Update transactions where fund is NOT IN standardFunds
  const result = await db.run(
    `UPDATE transactions 
     SET moph = fund, fund = 'General Fund' 
     WHERE fund IS NOT NULL AND fund != '' AND fund NOT IN (${placeholders})`,
    standardFunds
  )
  
  console.log(`Migration complete. Migrated ${result.changes} rows.`)
}

migrate().catch(console.error)
