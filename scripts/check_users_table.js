import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function checkUsersTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nautilus_reporting',
  });

  try {
    console.log('\n=== USERS Table Structure ===\n');
    const [columns] = await connection.query('DESCRIBE users');
    console.table(columns);

    console.log('\n=== Sample Users ===\n');
    const [users] = await connection.query('SELECT * FROM users LIMIT 5');
    console.table(users);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsersTable();

