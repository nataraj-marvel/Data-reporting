require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  const newPassword = 'admin123';
  const hash = await bcrypt.hash(newPassword, 10);
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  await connection.execute(
    'UPDATE users SET password_hash = ? WHERE username = ?',
    [hash, 'admin']
  );
  console.log('Password for admin reset to admin123');
  await connection.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
