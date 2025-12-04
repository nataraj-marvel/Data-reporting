# Forms Usage Guide - AI Agent Tracking System

## Overview

This guide provides detailed instructions on how to use the manual edit forms for the AI Agent Tracking & Enhanced Reporting System. All forms are accessible through the web interface and provide full CRUD (Create, Read, Update, Delete) capabilities.

---

## 📝 AI Prompts Form

### Purpose
Log and track all interactions with AI coding assistants, including prompts sent and responses received.

### Access
- **List View**: `/prompts`
- **Create New**: `/prompts/new`
- **Edit Existing**: `/prompts/[id]`

### Form Fields

#### Required Fields
- **Prompt Text**: The actual question or instruction sent to the AI
  - Type: Textarea (multi-line)
  - Example: "How can I optimize this SQL query for better performance?"

#### Optional Fields
- **AI Response**: The response received from the AI
  - Type: Textarea (multi-line)
  - Can be filled automatically or manually

- **AI Model**: Which AI model was used
  - Type: Dropdown
  - Options: Cursor AI, Claude Sonnet 4.5, GPT-4, GPT-3.5 Turbo, GitHub Copilot, Other
  - Default: Cursor AI

- **Category**: Type of task the prompt relates to
  - Type: Dropdown
  - Options: Debug, Refactor, Feature, Documentation, Test, Optimization, Review, Other
  - Default: Other

- **Effectiveness Rating**: How helpful was the AI response (1-5 stars)
  - Type: Dropdown
  - Range: 1 (Not helpful) to 5 (Extremely helpful)

- **Tokens Used**: Number of tokens consumed
  - Type: Number input
  - Default: 0

- **Context Data**: Additional context in JSON format
  - Type: Textarea (JSON)
  - Example: `{"file": "lib/db.ts", "line": 45, "function": "query"}`

### Usage Example

1. **Creating a New Prompt**
   ```
   Navigate to: /prompts/new
   
   Fill in:
   - Prompt Text: "Review this authentication function for security issues"
   - AI Model: Claude Sonnet 4.5
   - Category: Review
   - Context Data: {"file": "lib/auth.ts", "function": "verifyAuth"}
   
   Click: "Create Prompt"
   ```

2. **Editing an Existing Prompt**
   ```
   Navigate to: /prompts/123 (where 123 is the prompt ID)
   
   Update:
   - Effectiveness Rating: 5 (Extremely helpful)
   - AI Response: [Copy the AI's response]
   
   Click: "Update Prompt"
   ```

3. **Viewing Prompts List**
   ```
   Navigate to: /prompts
   
   Filter by:
   - Search: Enter keywords
   - Category: Select specific category
   - Min Rating: Filter by effectiveness
   ```

### API Integration
For automated logging from AI tools:

```javascript
// Log prompt automatically
fetch('/api/prompts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt_text: promptText,
    response_text: aiResponse,
    ai_model: 'cursor-ai',
    category: 'debug',
    context_data: { file: currentFile, line: currentLine }
  })
});
```

---

## 📋 Requests Form

### Purpose
Track feature requests, enhancement requests, and development tasks that need approval or prioritization.

### Access
- **List View**: `/requests`
- **Create New**: `/requests/new`
- **Edit Existing**: `/requests/[id]`

### Form Fields

#### Required Fields
- **Title**: Short, descriptive name for the request
  - Type: Text input
  - Example: "Add dark mode support"

- **Description**: Detailed explanation of the request
  - Type: Textarea
  - Include what, why, and expected outcome

#### Optional Fields
- **Request Type**: Category of request
  - Type: Dropdown
  - Options: Feature, Enhancement, Refactor, Documentation, Infrastructure, Other
  - Default: Feature

- **Priority**: Urgency level
  - Type: Dropdown with color indicator
  - Options: Low (blue), Medium (yellow), High (orange), Critical (red)
  - Default: Medium

- **Status**: Current state of the request
  - Type: Dropdown with color indicator
  - Options: Submitted, Under Review, Approved, In Progress, Completed, Rejected, On Hold
  - Default: Submitted

- **Acceptance Criteria**: Conditions that must be met for completion
  - Type: Textarea
  - Format as bullet points

- **Estimated Hours**: Expected time to complete
  - Type: Number (decimal)
  - Example: 8.5

- **Actual Hours**: Actual time spent
  - Type: Number (decimal)
  - Filled as work progresses

- **Assign To**: User responsible for the request
  - Type: Dropdown (populated from users table)
  - Can be unassigned

- **Due Date**: Target completion date
  - Type: Date picker

### Usage Example

1. **Creating a New Request**
   ```
   Navigate to: /requests/new
   
   Fill in:
   - Title: "Implement two-factor authentication"
   - Description: "Add 2FA support using TOTP for enhanced security"
   - Request Type: Feature
   - Priority: High
   - Acceptance Criteria:
     • Users can enable 2FA in settings
     • Support for authenticator apps
     • Backup codes generation
     • Admin can enforce 2FA
   - Estimated Hours: 24
   - Due Date: 2025-12-20
   
   Click: "Create Request"
   ```

2. **Updating Request Status**
   ```
   Navigate to: /requests/456
   
   Update:
   - Status: In Progress
   - Assigned To: John Doe
   - Actual Hours: 8 (as you log time)
   
   Click: "Update Request"
   ```

### Status Workflow
```
Submitted → Under Review → Approved → In Progress → Completed
                                    ↓
                                Rejected / On Hold
```

### API Integration

```bash
# Create request via API
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add export to PDF feature",
    "description": "Users need ability to export reports as PDF",
    "request_type": "feature",
    "priority": "high",
    "estimated_hours": 12
  }'
```

---

## 📄 File Versions Form

### Purpose
Track file changes, versions, and modifications with detailed metadata for audit and rollback purposes.

### Access
- **List View**: `/files`
- **Create New**: `/files/new`
- **View/Edit**: `/files/[id]`

### Form Fields

#### Required Fields
- **File Path**: Full path to the file
  - Type: Text input
  - Example: "src/pages/api/auth/login.ts"
  - **Note**: Cannot be changed after creation

- **Version Number**: Version identifier
  - Type: Text input
  - Example: "1.2.3" or "2024-12-03-001"

#### Optional Fields
- **Change Type**: Type of modification
  - Type: Dropdown with color indicator
  - Options: Created (green), Modified (blue), Deleted (red), Renamed (orange), Moved (purple)
  - Default: Modified
  - **Note**: Cannot be changed after creation

- **Lines Added**: Number of lines added
  - Type: Number
  - Default: 0

- **Lines Deleted**: Number of lines removed
  - Type: Number
  - Default: 0

- **Commit Hash**: Git commit identifier
  - Type: Text input
  - Example: "a1b2c3d4e5f6"

- **Branch Name**: Git branch
  - Type: Text input
  - Example: "feature/dark-mode"

- **Change Description**: Summary of what changed
  - Type: Textarea
  - Describe the modifications made

- **Metadata**: Additional information in JSON format
  - Type: Textarea (JSON)
  - Example: `{"language": "typescript", "complexity": "medium"}`

### Usage Example

1. **Logging a File Change**
   ```
   Navigate to: /files/new
   
   Fill in:
   - File Path: pages/api/users/[id].ts
   - Version Number: 1.3.0
   - Change Type: Modified
   - Lines Added: 45
   - Lines Deleted: 12
   - Commit Hash: 7f8a9b2c
   - Branch Name: main
   - Change Description: "Added role-based access control to user endpoints"
   - Metadata: {"impact": "high", "tested": true}
   
   Click: "Create Version"
   ```

2. **Viewing File Statistics**
   ```
   Navigate to: /files/789
   
   View:
   - Lines Added: +45 (green)
   - Lines Deleted: -12 (red)
   - Net Change: 33
   - File Size: 15.23 KB
   ```

### Statistics Display
The form automatically calculates and displays:
- **Net Change**: Lines Added - Lines Deleted
- **File Size**: Displayed in KB
- Color-coded additions (green) and deletions (red)

### API Integration

```javascript
// Log file change from Git hook
const exec = require('child_process').exec;

exec('git diff HEAD~1 HEAD --numstat', (error, stdout) => {
  const changes = parseGitDiff(stdout);
  
  fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_path: changes.filePath,
      version_number: getCurrentVersion(),
      change_type: changes.type,
      lines_added: changes.additions,
      lines_deleted: changes.deletions,
      commit_hash: getCurrentCommitHash(),
      branch_name: getCurrentBranch()
    })
  });
});
```

---

## 🎨 Common Form Features

### All Forms Include

1. **Validation**
   - Required fields marked with red asterisk (*)
   - Real-time validation on submit
   - Clear error messages

2. **Actions**
   - **Save Button**: Creates (green) or Updates (blue) the record
   - **Cancel Button**: Returns to previous page without saving
   - **Delete Button**: Removes the record (only on edit forms)
     - Requires confirmation

3. **Visual Feedback**
   - Success messages (green)
   - Error messages (red)
   - Loading states while saving
   - Disabled state for non-editable fields

4. **Responsive Design**
   - Mobile-friendly layout
   - Touch-optimized controls
   - Adaptive grid layouts

### Keyboard Shortcuts
- **Ctrl/Cmd + Enter**: Submit form
- **Escape**: Cancel/Go back

---

## 🔐 Permissions

### User Roles

#### Programmer (Standard User)
- Can create, view, edit, and delete their own records
- Can view other users' records
- Cannot edit others' records (except when assigned)

#### Admin
- Full access to all records
- Can edit and delete any record
- Can manage all users

---

## 💡 Best Practices

### When Creating AI Prompts
1. ✅ **Be specific** with prompt text
2. ✅ **Include context** in the context_data field
3. ✅ **Rate effectiveness** after using the response
4. ✅ **Tag with correct category** for better organization

### When Creating Requests
1. ✅ **Write clear acceptance criteria**
2. ✅ **Set realistic estimates**
3. ✅ **Update status regularly**
4. ✅ **Log actual hours** for future planning

### When Logging File Versions
1. ✅ **Be consistent** with version numbering
2. ✅ **Write descriptive** change descriptions
3. ✅ **Include commit hash** when available
4. ✅ **Track all significant** file changes

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Unauthorized" error when saving
- **Solution**: Your session may have expired. Please log in again.

**Issue**: "Failed to save" error
- **Solution**: Check that all required fields are filled. Ensure JSON fields contain valid JSON.

**Issue**: Cannot edit file path
- **Solution**: File paths are immutable after creation to maintain version integrity. Create a new version if the file was moved.

**Issue**: User list not loading in dropdown
- **Solution**: Refresh the page. If persists, contact admin.

---

## 📞 Support

For additional help or feature requests:
- **Documentation**: See main README.md
- **API Reference**: See docs/API_REFERENCE_V2.md
- **Project Document**: See docs/AI_AGENT_UPGRADE_PROJECT.md

---

## 🔄 Updates & Versioning

This guide corresponds to **System Version 2.0.0**

Last Updated: December 3, 2025


