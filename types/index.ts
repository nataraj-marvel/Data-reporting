// User types
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

export interface UserCreate {
  username: string;
  password: string;
  role: 'admin' | 'programmer';
  full_name: string;
  email: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  role?: 'admin' | 'programmer';
  is_active?: boolean;
}

// Session types
export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  ip_address?: string;
  user_agent?: string;
}

// Daily report types
export interface DailyReport {
  id: number;
  user_id: number;
  report_date: string;
  work_description: string;
  hours_worked: number;
  tasks_completed?: string;
  blockers?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: number;
}

export interface DailyReportCreate {
  report_date: string;
  work_description: string;
  hours_worked: number;
  tasks_completed?: string;
  blockers?: string;
  notes?: string;
  status?: 'draft' | 'submitted';
}

export interface DailyReportUpdate {
  work_description?: string;
  hours_worked?: number;
  tasks_completed?: string;
  blockers?: string;
  notes?: string;
  status?: 'draft' | 'submitted' | 'reviewed';
}

// Issue types
export interface Issue {
  id: number;
  report_id: number;
  user_id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

export interface IssueCreate {
  report_id: number;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
}

export interface IssueUpdate {
  title?: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
}

// Problem solved types
export interface ProblemSolved {
  id: number;
  report_id: number;
  user_id: number;
  issue_id?: number;
  title: string;
  problem_description: string;
  solution_description: string;
  time_spent?: number;
  tags?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProblemSolvedCreate {
  report_id: number;
  issue_id?: number;
  title: string;
  problem_description: string;
  solution_description: string;
  time_spent?: number;
  tags?: string;
}

export interface ProblemSolvedUpdate {
  title?: string;
  problem_description?: string;
  solution_description?: string;
  time_spent?: number;
  tags?: string;
}

// Data upload types
export interface DataUpload {
  id: number;
  report_id: number;
  user_id: number;
  file_name: string;
  file_type?: string;
  file_size?: number;
  upload_path?: string;
  description?: string;
  metadata?: any;
  created_at: Date;
}

export interface DataUploadCreate {
  report_id: number;
  file_name: string;
  file_type?: string;
  file_size?: number;
  upload_path?: string;
  description?: string;
  metadata?: any;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'programmer';
  full_name: string;
  email: string;
}