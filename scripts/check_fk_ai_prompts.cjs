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
      `SELECT CONSTRAINT_NAME, TABLE_NAME FROM REFERENTIAL_CONSTRAINTS WHERE REFERENCED_TABLE_NAME='ai_prompts' AND CONSTRAINT_SCHEMA=?`,
      [process.env.DB_NAME]
    );
    console.log(rows);
  } finally {
    await conn.end();
  }
})();
