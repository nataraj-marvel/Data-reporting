import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function checkFileVersions() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nautilus_reporting',
    });

    console.log('\n📋 FILE_VERSIONS TABLE STRUCTURE:\n');
    
    const [cols] = await connection.execute(`DESCRIBE file_versions`);
    cols.forEach(c => {
      console.log(`  ${c.Field.padEnd(30)} ${c.Type.padEnd(30)} ${c.Key}`);
    });
    
    console.log('\n');
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    if (connection) await connection.end();
  }
}

checkFileVersions();

