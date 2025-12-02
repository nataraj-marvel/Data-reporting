// types/index.ts
export interface User {
  id: number;
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
  id: number;
  username: string;
  role: 'admin' | 'programmer';
  full_name: string;
  email: string;
}

export interface Task {
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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