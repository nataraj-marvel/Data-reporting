import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkSessionsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('\n🔍 SESSIONS TABLE STRUCTURE:\n');
    
    const [cols] = await connection.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sessions' 
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME || 'nautilus_reporting']
    );

    cols.forEach(c => {
      console.log(`  ${c.COLUMN_NAME.padEnd(20)} ${c.COLUMN_TYPE.padEnd(20)} ${c.COLUMN_KEY}`);
    });
    
    console.log('');
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (connection) await connection.end();
  }
}

checkSessionsTable();

