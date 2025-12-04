const mysql = require('mysql2/promise');
require('dotenv').config();

const CREATE_AI_PROMPTS = `CREATE TABLE ai_prompts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    user_id INT NOT NULL,
    report_id INT NULL,
    prompt_text TEXT NOT NULL,
    response_text LONGTEXT,
    ai_model VARCHAR(100) DEFAULT 'unknown',
    context_data LONGTEXT,
    category VARCHAR(50) DEFAULT 'other',
    effectiveness_rating TINYINT,
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_prompt_id (prompt_id),
    INDEX idx_user_id (user_id),
    INDEX idx_report_id (report_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

const CREATE_PROMPT_FILES = `CREATE TABLE prompt_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prompt_id INT NOT NULL,
    file_version_id INT NOT NULL,
    relevance_score DECIMAL(3,2) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_prompt_file (prompt_id, file_version_id),
    INDEX idx_prompt_id (prompt_id),
    INDEX idx_file_version_id (file_version_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

const CREATE_TRIGGER = `
CREATE TRIGGER bi_ai_prompts
BEFORE INSERT ON ai_prompts
FOR EACH ROW
BEGIN
  IF NEW.prompt_id IS NULL THEN
    SET NEW.prompt_id = NEW.id;
  END IF;
END;`;

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Disabling foreign key checks...');
    await conn.query('SET FOREIGN_KEY_CHECKS=0');

    console.log('Dropping prompt_files (if exists)...');
    await conn.query('DROP TABLE IF EXISTS prompt_files');

    console.log('Dropping ai_prompts (if exists)...');
    await conn.query('DROP TABLE IF EXISTS ai_prompts');

    console.log('Creating ai_prompts...');
    await conn.query(CREATE_AI_PROMPTS);

    console.log('Creating prompt_files...');
    await conn.query(CREATE_PROMPT_FILES);

    console.log('Creating trigger to sync prompt_id...');
    await conn.query('DROP TRIGGER IF EXISTS bi_ai_prompts');
    await conn.query(CREATE_TRIGGER);

    console.log('Re-enabling foreign key checks...');
    await conn.query('SET FOREIGN_KEY_CHECKS=1');

    console.log(' ai_prompts and prompt_files recreated successfully!');
  } catch (err) {
    console.error(' Error updating remote database:', err.message);
  } finally {
    await conn.end();
  }
})();
