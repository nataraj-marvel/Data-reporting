// Fix all API column name issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixes = [
  // Tasks API fixes
  {
    file: 'pages/api/tasks/index.ts',
    replacements: [
      { from: 'tf.task_id = t.id', to: 'tf.task_id = t.task_id' },
      { from: 'WHERE t.id = ?', to: 'WHERE t.task_id = ?' },
      { from: 'u_creator ON t.user_id = u_creator.id', to: 'u_creator ON t.user_id = u_creator.user_id' },
      { from: 'u_assigned ON t.assigned_to = u_assigned.id', to: 'u_assigned ON t.assigned_to = u_assigned.user_id' },
      { from: 'dr ON t.report_id = dr.id', to: 'dr ON t.report_id = dr.report_id' },
      { from: 'r ON t.request_id = r.id', to: 'r ON t.request_id = r.request_id' },
      { from: 'i ON t.issue_id = i.id', to: 'i ON t.issue_id = i.issue_id' },
      { from: 'p ON t.prompt_id = p.id', to: 'p ON t.prompt_id = p.prompt_id' },
      { from: 'pt ON t.parent_task_id = pt.id', to: 'pt ON t.parent_task_id = pt.task_id' }
    ]
  },
  
  // Tasks [id] API fixes
  {
    file: 'pages/api/tasks/[id].ts',
    replacements: [
      { from: 'u_creator ON t.user_id = u_creator.id', to: 'u_creator ON t.user_id = u_creator.user_id' },
      { from: 'u_assigned ON t.assigned_to = u_assigned.id', to: 'u_assigned ON t.assigned_to = u_assigned.user_id' },
      { from: 'dr ON t.report_id = dr.id', to: 'dr ON t.report_id = dr.report_id' },
      { from: 'r ON t.request_id = r.id', to: 'r ON t.request_id = r.request_id' },
      { from: 'i ON t.issue_id = i.id', to: 'i ON t.issue_id = i.issue_id' },
      { from: 'p ON t.prompt_id = p.id', to: 'p ON t.prompt_id = p.prompt_id' },
      { from: 'pt ON t.parent_task_id = pt.id', to: 'pt ON t.parent_task_id = pt.task_id' },
      { from: 'WHERE t.id = ?', to: 'WHERE t.task_id = ?' },
      { from: 'u ON fv.user_id = u.id', to: 'u ON fv.user_id = u.user_id' },
      { from: 'u ON t.user_id = u.id', to: 'u ON t.user_id = u.user_id' },
      { from: "'SELECT user_id FROM tasks WHERE id = ?'", to: "'SELECT user_id FROM tasks WHERE task_id = ?'" }
    ]
  },
  
  // Requests API fixes
  {
    file: 'pages/api/requests/index.ts',
    replacements: [
      { from: 'creator ON r.user_id = creator.id', to: 'creator ON r.user_id = creator.user_id' },
      { from: 'assignee ON r.assigned_to = assignee.id', to: 'assignee ON r.assigned_to = assignee.user_id' },
      { from: 't ON r.id = t.request_id', to: 't ON r.request_id = t.request_id' },
      { from: 'WHERE r.id = ?', to: 'WHERE r.request_id = ?' }
    ]
  },

  // Requests [id] API fixes
  {
    file: 'pages/api/requests/[id].ts',
    replacements: [
      { from: 'creator ON r.user_id = creator.id', to: 'creator ON r.user_id = creator.user_id' },
      { from: 'assignee ON r.assigned_to = assignee.id', to: 'assignee ON r.assigned_to = assignee.user_id' },
      { from: 'WHERE r.id = ?', to: 'WHERE r.request_id = ?' },
      { from: "'SELECT user_id FROM requests WHERE id = ?'", to: "'SELECT user_id FROM requests WHERE request_id = ?'" },
      { from: "'SELECT user_id, assigned_to FROM requests WHERE id = ?'", to: "'SELECT user_id, assigned_to FROM requests WHERE request_id = ?'" }
    ]
  },

  // Prompts API fixes
  {
    file: 'pages/api/prompts/index.ts',
    replacements: [
      { from: 'u ON ap.user_id = u.id', to: 'u ON ap.user_id = u.user_id' },
      { from: 'WHERE ap.id = ?', to: 'WHERE ap.prompt_id = ?' }
    ]
  },

  // Prompts [id] API fixes
  {
    file: 'pages/api/prompts/[id].ts',
    replacements: [
      { from: 'u ON ap.user_id = u.id', to: 'u ON ap.user_id = u.user_id' },
      { from: 'WHERE ap.id = ?', to: 'WHERE ap.prompt_id = ?' },
      { from: 'u ON fv.user_id = u.id', to: 'u ON fv.user_id = u.user_id' },
      { from: "'SELECT user_id FROM ai_prompts WHERE id = ?'", to: "'SELECT user_id FROM ai_prompts WHERE prompt_id = ?'" }
    ]
  },

  // Files API fixes
  {
    file: 'pages/api/files/index.ts',
    replacements: [
      { from: 'u ON fv.user_id = u.id', to: 'u ON fv.user_id = u.user_id' },
      { from: 'WHERE fv.id = ?', to: 'WHERE fv.file_version_id = ?' }
    ]
  },

  // Files [id] API fixes
  {
    file: 'pages/api/files/[id].ts',
    replacements: [
      { from: 'u ON fv.user_id = u.id', to: 'u ON fv.user_id = u.user_id' },
      { from: 'WHERE fv.id = ?', to: 'WHERE fv.file_version_id = ?' },
      { from: "'SELECT user_id FROM file_versions WHERE id = ?'", to: "'SELECT user_id FROM file_versions WHERE file_version_id = ?'" }
    ]
  }
];

let totalFixed = 0;
let filesFixed = 0;

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   🔧 FIXING ALL API COLUMN NAME ISSUES                   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

for (const fix of fixes) {
  const filePath = path.join(__dirname, '..', fix.file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fixCount = 0;

    console.log(`\n📄 ${fix.file}`);

    for (const replacement of fix.replacements) {
      const count = (content.match(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      if (count > 0) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        console.log(`  ✅ Fixed: ${replacement.from.substring(0, 40)}... (${count} occurrence${count > 1 ? 's' : ''})`);
        modified = true;
        fixCount += count;
        totalFixed += count;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ File saved with ${fixCount} fix${fixCount !== 1 ? 'es' : ''}`);
      filesFixed++;
    } else {
      console.log(`  ℹ️  No changes needed`);
    }

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
  }
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log(`║   ✅ FIXED ${totalFixed} ISSUES IN ${filesFixed} FILES${' '.repeat(Math.max(0, 28 - totalFixed.toString().length - filesFixed.toString().length))}║`);
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('🔄 Server will auto-reload with fixes...\n');

