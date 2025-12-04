#!/bin/bash
# Fix all SQL queries to use new v2.0 column names

echo "Fixing SQL queries in API files..."

cd "$(dirname "$0")/.."

# Files to fix
files=(
  "pages/api/tasks/index.ts"
  "pages/api/tasks/[id].ts"
  "pages/api/prompts/index.ts"
  "pages/api/prompts/[id].ts"
  "pages/api/requests/index.ts"
  "pages/api/requests/[id].ts"
  "pages/api/files/index.ts"
  "pages/api/files/[id].ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # users table: u.id -> u.user_id
    sed -i 's/u\.id\b/u.user_id/g' "$file"
    sed -i 's/u_creator\.id\b/u_creator.user_id/g' "$file"
    sed -i 's/u_assigned\.id\b/u_assigned.user_id/g' "$file"
    sed -i 's/creator\.id\b/creator.user_id/g' "$file"
    sed -i 's/assignee\.id\b/assignee.user_id/g' "$file"
    
    # tasks table: t.id -> t.task_id
    sed -i 's/t\.id\b/t.task_id/g' "$file"
    sed -i 's/pt\.id\b/pt.task_id/g' "$file"
    
    # daily_reports table: dr.id -> dr.report_id
    sed -i 's/dr\.id\b/dr.report_id/g' "$file"
    
    # requests table: r.id -> r.request_id (careful with JOIN clauses)
    sed -i 's/ON r\.id = /ON r.request_id = /g' "$file"
    
    # issues table: i.id -> i.issue_id
    sed -i 's/i\.id\b/i.issue_id/g' "$file"
    
    # ai_prompts table: p.id -> p.prompt_id
    sed -i 's/p\.id\b/p.prompt_id/g' "$file"
    sed -i 's/ap\.id\b/ap.prompt_id/g' "$file"
    
    # problems_solved table: ps.id -> ps.solution_id
    sed -i 's/ps\.id\b/ps.solution_id/g' "$file"
    
    # file_versions table: fv.id -> fv.file_version_id
    sed -i 's/fv\.id\b/fv.file_version_id/g' "$file"
    sed -i 's/prev\.id\b/prev.file_version_id/g' "$file"
    
    echo "  ✓ Fixed $file"
  fi
done

echo ""
echo "All SQL queries fixed!"

