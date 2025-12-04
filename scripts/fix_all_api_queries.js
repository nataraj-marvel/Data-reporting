// Script to fix all SQL queries in API files
// Changes 'id' to proper primary key columns (report_id, task_id, etc.)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixes = [
  {
    file: 'pages/api/tasks/[id].ts',
    replacements: [
      { from: /WHERE t\.id = \?/g, to: 'WHERE t.task_id = ?' },
      { from: /WHERE tasks\.id = \?/g, to: 'WHERE tasks.task_id = ?' },
      { from: /'SELECT \* FROM tasks WHERE id = \?'/g, to: "'SELECT * FROM tasks WHERE task_id = ?'" },
      { from: /'SELECT user_id FROM tasks WHERE id = \?'/g, to: "'SELECT user_id FROM tasks WHERE task_id = ?'" },
      { from: /UPDATE tasks SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE task_id = ?') },
      { from: /'DELETE FROM tasks WHERE id = \?'/g, to: "'DELETE FROM tasks WHERE task_id = ?'" }
    ]
  },
  {
    file: 'pages/api/users/[id].ts',
    replacements: [
      { from: /WHERE id = \?/g, to: 'WHERE user_id = ?' }
    ]
  },
  {
    file: 'pages/api/users/index.ts',
    replacements: [
      { from: /'SELECT id FROM users WHERE/g, to: "'SELECT user_id FROM users WHERE" },
      { from: /'SELECT id, username, role/g, to: "'SELECT user_id, username, role" }
    ]
  },
  {
    file: 'pages/api/requests/[id].ts',
    replacements: [
      { from: /WHERE r\.id = \?/g, to: 'WHERE r.request_id = ?' },
      { from: /'SELECT \* FROM requests WHERE id = \?'/g, to: "'SELECT * FROM requests WHERE request_id = ?'" },
      { from: /'SELECT user_id FROM requests WHERE id = \?'/g, to: "'SELECT user_id FROM requests WHERE request_id = ?'" },
      { from: /UPDATE requests SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE request_id = ?') },
      { from: /'DELETE FROM requests WHERE id = \?'/g, to: "'DELETE FROM requests WHERE request_id = ?'" }
    ]
  },
  {
    file: 'pages/api/issues/[id].ts',
    replacements: [
      { from: /'SELECT \* FROM issues WHERE id = \?'/g, to: "'SELECT * FROM issues WHERE issue_id = ?'" },
      { from: /'SELECT user_id FROM issues WHERE id = \?'/g, to: "'SELECT user_id FROM issues WHERE issue_id = ?'" },
      { from: /UPDATE issues SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE issue_id = ?') },
      { from: /'DELETE FROM issues WHERE id = \?'/g, to: "'DELETE FROM issues WHERE issue_id = ?'" }
    ]
  },
  {
    file: 'pages/api/solutions/[id].ts',
    replacements: [
      { from: /'SELECT \* FROM problems_solved WHERE id = \?'/g, to: "'SELECT * FROM problems_solved WHERE solution_id = ?'" },
      { from: /'SELECT user_id FROM problems_solved WHERE id = \?'/g, to: "'SELECT user_id FROM problems_solved WHERE solution_id = ?'" },
      { from: /UPDATE problems_solved SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE solution_id = ?') },
      { from: /'DELETE FROM problems_solved WHERE id = \?'/g, to: "'DELETE FROM problems_solved WHERE solution_id = ?'" }
    ]
  },
  {
    file: 'pages/api/prompts/[id].ts',
    replacements: [
      { from: /'SELECT \* FROM ai_prompts WHERE id = \?'/g, to: "'SELECT * FROM ai_prompts WHERE prompt_id = ?'" },
      { from: /'SELECT user_id FROM ai_prompts WHERE id = \?'/g, to: "'SELECT user_id FROM ai_prompts WHERE prompt_id = ?'" },
      { from: /UPDATE ai_prompts SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE prompt_id = ?') },
      { from: /'DELETE FROM ai_prompts WHERE id = \?'/g, to: "'DELETE FROM ai_prompts WHERE prompt_id = ?'" }
    ]
  },
  {
    file: 'pages/api/files/[id].ts',
    replacements: [
      { from: /'SELECT \* FROM file_versions WHERE id = \?'/g, to: "'SELECT * FROM file_versions WHERE file_id = ?'" },
      { from: /'SELECT user_id FROM file_versions WHERE id = \?'/g, to: "'SELECT user_id FROM file_versions WHERE file_id = ?'" },
      { from: /UPDATE file_versions SET .* WHERE id = \?/g, to: (match) => match.replace('WHERE id = ?', 'WHERE file_id = ?') },
      { from: /'DELETE FROM file_versions WHERE id = \?'/g, to: "'DELETE FROM file_versions WHERE file_id = ?'" }
    ]
  }
];

console.log('\n========================================');
console.log('🔧 Fixing SQL Queries in API Files');
console.log('========================================\n');

const rootDir = path.join(__dirname, '..');
let totalFiles = 0;
let totalReplacements = 0;

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(rootDir, file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} - file not found`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;

    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        fileReplacements += matches.length;
        content = content.replace(from, to);
      }
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
      console.log(`   Replacements: ${fileReplacements}`);
      totalFiles++;
      totalReplacements += fileReplacements;
    } else {
      console.log(`ℹ️  No changes needed in ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n========================================');
console.log(`✅ Complete!`);
console.log(`   Files Modified: ${totalFiles}`);
console.log(`   Total Replacements: ${totalReplacements}`);
console.log('========================================\n');

