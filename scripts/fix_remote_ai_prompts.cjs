const mysql = require('mysql2/promise');
require('dotenv').config();

const CREATE_AI_PROMPTS = `CREATE TABLE IF NOT EXISTS ai_prompts (
    prompt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_id INT NULL,
    prompt_text TEXT NOT NULL,
    response_text LONGTEXT,
    ai_model VARCHAR(100) DEFAULT 'unknown',
    context_data LONGTEXT,
    category ENUM('debug', 'refactor', 'feature', 'documentation', 'test', 'optimization', 'review', 'other') DEFAULT 'other',
    effectiveness_rating INT,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_ai_model (ai_model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

async function main() {
  console.log('Connecting to remote database...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Checking for ai_prompts table...');
    const [tables] = await conn.execute("SHOW TABLES LIKE 'ai_prompts'");

    if (tables.length > 0) {
      console.log(' ai_prompts table already exists.');
    } else {
      console.log('  ai_prompts table missing. Creating now...');
      await conn.execute(CREATE_AI_PROMPTS);
      console.log(' ai_prompts table created successfully!');
      console.log('   (Foreign keys skipped for compatibility)');
    }
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error(' Error fixing remote database:');
  console.error(err);
  process.exit(1);
});
