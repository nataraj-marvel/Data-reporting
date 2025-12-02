require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('Updating schema...');

        // 1. Create tasks table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        assigned_to INT NOT NULL,
        assigned_by INT NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'blocked') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        due_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('Created tasks table.');

        // 2. Modify daily_reports for hourly reporting and task linkage
        // We need to check if columns/indexes exist to avoid errors, or just use try-catch for specific alter statements

        try {
            await connection.query('ALTER TABLE daily_reports DROP INDEX unique_user_date');
            console.log('Dropped unique_user_date constraint.');
        } catch (e) {
            if (e.code !== 'ER_CANT_DROP_FIELD_OR_KEY') console.log('Index unique_user_date might not exist or already dropped.');
        }

        try {
            await connection.query('ALTER TABLE daily_reports ADD COLUMN start_time TIME');
            console.log('Added start_time column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
        }

        try {
            await connection.query('ALTER TABLE daily_reports ADD COLUMN end_time TIME');
            console.log('Added end_time column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
        }

        try {
            await connection.query('ALTER TABLE daily_reports ADD COLUMN task_id INT NULL');
            await connection.query('ALTER TABLE daily_reports ADD CONSTRAINT fk_report_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL');
            console.log('Added task_id column and foreign key.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error(e);
        }

        console.log('Schema update completed successfully.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await connection.end();
    }
}

main();
