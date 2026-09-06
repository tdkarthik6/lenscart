require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('🔄 Running migrations...');

  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`  📄 ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await connection.execute('SET foreign_key_checks = 0');
    await connection.query(sql);
    await connection.execute('SET foreign_key_checks = 1');
    console.log(`  ✅ ${file} applied`);
  }

  await connection.end();
  console.log('✅ All migrations completed successfully!');
}

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
