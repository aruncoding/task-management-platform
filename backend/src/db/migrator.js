const path = require('path')
const fs = require('fs')
const { Sequelize, QueryTypes } = require('sequelize')
const sequelize = require('../config/database')

const MIGRATIONS_DIR = path.join(__dirname, '../migrations')

async function ensureMigrationsTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`migrations\` (
      \`id\`        INT          NOT NULL AUTO_INCREMENT,
      \`timestamp\` BIGINT       NOT NULL,
      \`name\`      VARCHAR(255) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `)
}

async function getCompletedMigrations() {
  const rows = await sequelize.query('SELECT name FROM migrations', { type: QueryTypes.SELECT })
  return new Set(rows.map(r => r.name))
}

async function runMigrations() {
  await ensureMigrationsTable()

  const completed = await getCompletedMigrations()

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort()

  const queryInterface = sequelize.getQueryInterface()
  let pending = 0

  for (const file of files) {
    const name = file.replace(/\.js$/, '')

    if (completed.has(name)) {
      continue
    }

    const migration = require(path.join(MIGRATIONS_DIR, file))
    await migration.up(queryInterface, Sequelize)

    const timestamp = parseInt(name.split('-')[0], 10)
    await sequelize.query(
      'INSERT INTO migrations (timestamp, name) VALUES (?, ?)',
      { replacements: [timestamp, name], type: QueryTypes.INSERT }
    )

    console.log(`[migration name] ran: ${name}`)
    pending++
  }

  if (pending === 0) {
    console.log('[migration] nothing to migrate')
  } else {
    console.log(`${pending} migration(s) completed`)
  }
}

module.exports = { runMigrations }
