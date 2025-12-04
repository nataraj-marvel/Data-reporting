const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'information_schema'
  });

  try {
    const [rows] = await conn.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM KEY_COLUMN_USAGE
       WHERE REFERENCED_TABLE_NAME = 'ai_prompts'
         AND TABLE_SCHEMA = ?`,
      [process.env.DB_NAME]
    );
    console.log(rows);
  } finally {
    await conn.end();
  }
})();
