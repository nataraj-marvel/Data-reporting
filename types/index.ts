// types/index.ts
export interface User {
  user_id: number;
  username: string;
  password_hash?: string;
  role: 'admin' | 'programmer';
  full_name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface AuthUser {
  user_id: number;
  username: string;
  role: 'admin' | 'programmer';
  full_name: string;
  email: string;
}

export interface Task {
  task_id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_by: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee_name?: string;
  assigner_name?: string;
}

export interface DailyReport {
  report_id: number;
  user_id: number;
  task_id?: number | null;
  report_date: string;
  start_time?: string | null;
  end_time?: string | null;
  work_description: string;
  hours_worked: number;
  tasks_completed: string;
  blockers: string;
  notes: string;
  status: 'draft' | 'submitted' | 'reviewed';
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: number | null;
  // Joined fields
  full_name?: string; // Reporter name
  task_title?: string;
}

export interface Issue {
  issue_id: number;
  report_id: number;
  user_id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ProblemSolved {
  solution_id: number;
  report_id: number;
  user_id: number;
  issue_id: number | null;
  title: string;
  problem_description: string;
  solution_description: string;
  time_spent: number;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface DataUpload {
  upload_id: number;
  report_id: number;
  user_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_path: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface Session {
  session_id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  ip_address: string;
  user_agent: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserCreate {
  username: string;
  password: string;
  role?: 'admin' | 'programmer';
  full_name: string;
  email: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: 'admin' | 'programmer';
  is_active?: boolean;
}

export interface DailyReportUpdate {
  work_description?: string;
  hours_worked?: number;
  tasks_completed?: string;
  blockers?: string;
  notes?: string;
  status?: 'draft' | 'submitted' | 'reviewed';
  start_time?: string;
  end_time?: string;
  task_id?: number;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
}

export interface ProblemSolvedUpdate {
  title?: string;
  problem_description?: string;
  solution_description?: string;
  time_spent?: number;
  tags?: string;
}

export interface DataUploadCreate {
  report_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_path: string;
  description?: string;
  metadata?: any;
}

// ================================================================
// V2.0 Enhanced Types - AI Agent Tracking
// ================================================================

export interface AIPrompt {
  prompt_id: number;
  user_id: number;
  report_id: number | null;
  prompt_text: string;
  response_text: string | null;
  ai_model: string;
  context_data: any;
  category: 'debug' | 'refactor' | 'feature' | 'documentation' | 'test' | 'optimization' | 'review' | 'other';
  effectiveness_rating: number | null;
  tokens_used: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  username?: string;
  full_name?: string;
  report_date?: string;
  files_affected?: FileVersion[];
}

export interface AIPromptCreate {
  prompt_text: string;
  response_text?: string;
  ai_model?: string;
  context_data?: any;
  category?: 'debug' | 'refactor' | 'feature' | 'documentation' | 'test' | 'optimization' | 'review' | 'other';
  effectiveness_rating?: number;
  tokens_used?: number;
  report_id?: number;
  file_paths?: string[];
}

export interface AIPromptUpdate {
  prompt_text?: string;
  response_text?: string;
  ai_model?: string;
  context_data?: any;
  category?: 'debug' | 'refactor' | 'feature' | 'documentation' | 'test' | 'optimization' | 'review' | 'other';
  effectiveness_rating?: number;
  tokens_used?: number;
  report_id?: number;
}

export interface Request {
  request_id: number;
  user_id: number;
  report_id: number | null;
  title: string;
  description: string;
  request_type: 'feature' | 'enhancement' | 'refactor' | 'documentation' | 'infrastructure' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'on_hold';
  acceptance_criteria: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  assigned_to: number | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  created_by_name?: string;
  assigned_to_name?: string;
  task_count?: number;
  completed_tasks?: number;
}

export interface RequestCreate {
  title: string;
  description: string;
  request_type?: 'feature' | 'enhancement' | 'refactor' | 'documentation' | 'infrastructure' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'submitted' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'on_hold';
  acceptance_criteria?: string;
  estimated_hours?: number;
  assigned_to?: number;
  due_date?: string;
  report_id?: number;
}

export interface RequestUpdate {
  title?: string;
  description?: string;
  request_type?: 'feature' | 'enhancement' | 'refactor' | 'documentation' | 'infrastructure' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'submitted' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected' | 'on_hold';
  acceptance_criteria?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: number;
  due_date?: string;
}

// Enhanced Task interface (replaces old Task)
export interface TaskEnhanced {
  task_id: number;
  user_id: number;
  assigned_to: number | null;
  report_id: number | null;
  request_id: number | null;
  issue_id: number | null;
  prompt_id: number | null;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'blocked' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  task_type: 'development' | 'bugfix' | 'testing' | 'documentation' | 'review' | 'research' | 'deployment' | 'other';
  estimated_hours: number | null;
  actual_hours: number | null;
  completion_percentage: number;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  blocked_reason: string | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator_username?: string;
  creator_name?: string;
  assigned_user?: string;
  assigned_user_name?: string;
  report_date?: string;
  request_title?: string;
  issue_title?: string;
  related_prompt?: string;
  files_affected_count?: number;
  parent_task_title?: string;
  subtasks?: TaskEnhanced[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'blocked' | 'review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  task_type?: 'development' | 'bugfix' | 'testing' | 'documentation' | 'review' | 'research' | 'deployment' | 'other';
  estimated_hours?: number;
  due_date?: string;
  assigned_to?: number;
  report_id?: number;
  request_id?: number;
  issue_id?: number;
  prompt_id?: number;
  parent_task_id?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'blocked' | 'review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  task_type?: 'development' | 'bugfix' | 'testing' | 'documentation' | 'review' | 'research' | 'deployment' | 'other';
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  due_date?: string;
  assigned_to?: number;
  blocked_reason?: string;
  parent_task_id?: number;
}

export interface FileVersion {
  file_id: number;
  file_path: string;
  version_number: string;
  change_type: 'created' | 'modified' | 'deleted' | 'renamed' | 'moved';
  user_id: number;
  report_id: number | null;
  task_id: number | null;
  solution_id: number | null;
  lines_added: number;
  lines_deleted: number;
  file_size_bytes: number | null;
  commit_hash: string | null;
  branch_name: string | null;
  change_description: string | null;
  file_content_snapshot: string | null;
  previous_version_id: number | null;
  metadata: any;
  created_at: string;
  // Joined fields
  username?: string;
  task_title?: string;
  solution_title?: string;
  previous_version?: FileVersion;
}

export interface FileVersionCreate {
  file_path: string;
  version_number: string;
  change_type?: 'created' | 'modified' | 'deleted' | 'renamed' | 'moved';
  lines_added?: number;
  lines_deleted?: number;
  file_size_bytes?: number;
  commit_hash?: string;
  branch_name?: string;
  change_description?: string;
  file_content_snapshot?: string;
  previous_version_id?: number;
  metadata?: any;
  report_id?: number;
  task_id?: number;
  solution_id?: number;
}

export interface FileVersionUpdate {
  version_number?: string;
  change_description?: string;
  metadata?: any;
}

// Enhanced Issue interface (extends original)
export interface IssueEnhanced extends Issue {
  issue_source: 'manual' | 'ai_agent' | 'automated_test' | 'code_review' | 'user_report' | 'monitoring';
  file_path: string | null;
  line_number: number | null;
  code_snippet: string | null;
  prompt_id: number | null;
  related_commit: string | null;
  // Joined fields
  prompt_text?: string;
  file_version?: FileVersion;
}

export interface IssueCreateEnhanced {
  report_id: number;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
  issue_source?: 'manual' | 'ai_agent' | 'automated_test' | 'code_review' | 'user_report' | 'monitoring';
  file_path?: string;
  line_number?: number;
  code_snippet?: string;
  prompt_id?: number;
  related_commit?: string;
}

// Enhanced ProblemSolved interface (extends original)
export interface ProblemSolvedEnhanced extends ProblemSolved {
  approach_description: string | null;
  alternatives_considered: string | null;
  lessons_learned: string | null;
  effectiveness_rating: number | null;
  related_prompt_id: number | null;
  // Joined fields
  related_prompt?: AIPrompt;
  file_versions?: FileVersion[];
}

export interface ProblemSolvedCreateEnhanced {
  report_id: number;
  issue_id?: number;
  title: string;
  problem_description: string;
  solution_description: string;
  approach_description?: string;
  alternatives_considered?: string;
  lessons_learned?: string;
  time_spent?: number;
  tags?: string;
  effectiveness_rating?: number;
  related_prompt_id?: number;
}

export interface ActivityLog {
  log_id: number;
  user_id: number;
  activity_type: 'create' | 'update' | 'delete' | 'view' | 'export';
  entity_type: 'report' | 'issue' | 'solution' | 'task' | 'request' | 'prompt' | 'file' | 'user';
  entity_id: number;
  changes: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined fields
  username?: string;
  full_name?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  prompts: {
    total: number;
    today: number;
    by_category: Record<string, number>;
    avg_effectiveness: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    blocked: number;
    by_priority: Record<string, number>;
  };
  requests: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    by_type: Record<string, number>;
  };
  files: {
    total_versions: number;
    files_modified_today: number;
    total_lines_added: number;
    total_lines_deleted: number;
  };
  issues: {
    total: number;
    open: number;
    resolved: number;
    by_severity: Record<string, number>;
  };
}

// Filter interfaces for API queries
export interface PromptFilters {
  user_id?: number;
  report_id?: number;
  category?: string;
  ai_model?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  min_rating?: number;
}

export interface RequestFilters {
  user_id?: number;
  assigned_to?: number;
  status?: string;
  priority?: string;
  request_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface TaskFilters {
  user_id?: number;
  report_id?: number;
  request_id?: number;
  issue_id?: number;
  status?: string;
  priority?: string;
  task_type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  parent_task_id?: number;
}

export interface FileFilters {
  file_path?: string;
  user_id?: number;
  report_id?: number;
  task_id?: number;
  change_type?: string;
  commit_hash?: string;
  start_date?: string;
  end_date?: string;
}