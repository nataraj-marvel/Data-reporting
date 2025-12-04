const mysql = require('mysql2/promise');
require('dotenv').config();

const ALTER_SQL = `ALTER TABLE ai_prompts
  ALGORITHM=INPLACE,
  CHANGE id prompt_id INT NOT NULL AUTO_INCREMENT,
  ADD user_id INT NOT NULL AFTER prompt_id,
  ADD report_id INT NULL AFTER user_id,
  ADD prompt_text TEXT NOT NULL AFTER report_id,
  ADD response_text LONGTEXT AFTER prompt_text,
  ADD ai_model VARCHAR(100) DEFAULT 'unknown' AFTER response_text,
  ADD context_data LONGTEXT AFTER ai_model,
  ADD category ENUM('debug', 'refactor', 'feature', 'documentation', 'test', 'optimization', 'review', 'other') DEFAULT 'other' AFTER context_data,
  ADD effectiveness_rating INT AFTER category,
  ADD tokens_used INT DEFAULT 0 AFTER effectiveness_rating,
  ADD created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER tokens_used,
  ADD updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
  ADD INDEX idx_user_id (user_id),
  ADD INDEX idx_report_id (report_id),
  ADD INDEX idx_category (category),
  ADD INDEX idx_created_at (created_at),
  ADD INDEX idx_ai_model (ai_model);`;

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Altering ai_prompts table (INPLACE)...');
    await conn.execute(ALTER_SQL);
    console.log(' ai_prompts table altered successfully');
  } finally {
    await conn.end();
  }
})();
