const mysql = require('mysql2/promise');
require('dotenv').config();

async function showColumns(tables) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nautilus_reporting'
  });

  try {
    for (const table of tables) {
      const [rows] = await conn.execute(`SHOW COLUMNS FROM ${table}`);
      console.log(`\nTable: ${table}`);
      rows.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} [${col.Key || ''}]`);
      });
    }
  } finally {
    await conn.end();
  }
}

const tables = process.argv.slice(2);
if (tables.length === 0) {
  console.log('Usage: node scripts/show_remote_columns.cjs <table1> <table2> ...');
  process.exit(1);
}

showColumns(tables).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
