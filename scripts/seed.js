const { open } = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const { randomUUID } = require('crypto')

async function main() {
  const db = await open({
    filename: path.join(process.cwd(), 'data.db'),
    driver: sqlite3.Database,
  })

  console.log('Seeding database...')

  try {
    // Clear existing data
    await db.exec('DELETE FROM viewer_access; DELETE FROM transactions; DELETE FROM users;')

    // Create entry user
    const entryUserId = randomUUID()
    const entryHash = await bcrypt.hash('Demo123456!', 10)
    
    await db.run(
      'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [entryUserId, 'entry@demo.com', entryHash, 'entry_user']
    )

    // Create viewer user
    const viewerUserId = randomUUID()
    const viewerHash = await bcrypt.hash('Demo123456!', 10)
    
    await db.run(
      'INSERT INTO users (id, email, password, role) VALUES (?, ?, ?, ?)',
      [viewerUserId, 'viewer@demo.com', viewerHash, 'viewer_user']
    )

    // Assign viewer to entry user
    const accessId = randomUUID()
    await db.run(
      'INSERT INTO viewer_access (id, viewerId, entryUserId) VALUES (?, ?, ?)',
      [accessId, viewerUserId, entryUserId]
    )

    // Create sample transaction
    const txId = randomUUID()
    await db.run(
      `INSERT INTO transactions (id, userId, bankName, payee, address, dvNumber, particulars, amount, date, controlNumber, accountCode, debit, credit, remarks, moph) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txId,
        entryUserId,
        'Land Bank of the Philippines',
        'LBP VELEZ',
        'Manila',
        '125902-01-30',
        'CASH ADVANCE FOR PAYMENT OF SALARY & PERA & ETC',
        1299398.82,
        '2025-01-14',
        'MAN25-0308',
        '10305020',
        1299398.82,
        0,
        'Sample transaction',
        'Cagayan de Oro'
      ]
    )

    console.log('Database seeded successfully!')
    console.log('Entry User: entry@demo.com / Demo123456!')
    console.log('Viewer User: viewer@demo.com / Demo123456!')
  } finally {
    await db.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
