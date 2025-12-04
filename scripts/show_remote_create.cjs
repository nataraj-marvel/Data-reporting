const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const tables = process.argv.slice(2);
  if (!tables.length) {
    console.log('Usage: node scripts/show_remote_create.cjs <table1> <table2> ...');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    for (const table of tables) {
      const [rows] = await conn.execute(`SHOW CREATE TABLE ${table}`);
      console.log(`\nSHOW CREATE TABLE ${table}:`);
      console.log(rows[0]['Create Table']);
    }
  } finally {
    await conn.end();
  }
})();
