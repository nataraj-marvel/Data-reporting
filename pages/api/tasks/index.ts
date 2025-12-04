// pages/api/tasks/index.ts - Updated for v2.0 schema
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { TaskEnhanced, TaskCreate, ApiResponse, TaskFilters } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced | TaskEnhanced[]>>
) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      return await handleGet(req, res, user);
    } else if (req.method === 'POST') {
      return await handlePost(req, res, user);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Tasks API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced[]>>,
  user: any
) {
  const {
    user_id,
    report_id,
    request_id,
    issue_id,
    status,
    priority,
    task_type,
    start_date,
    end_date,
    search,
    parent_task_id,
    page = '1',
    limit = '20'
  } = req.query as Partial<TaskFilters> & { page?: string; limit?: string };

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];

  // Non-admin users can only see their own tasks
  if (user.role !== 'admin') {
    conditions.push('t.user_id = ?');
    values.push(user.user_id);
  } else if (user_id) {
    conditions.push('t.user_id = ?');
    values.push(user_id);
  }

  if (report_id) {
    conditions.push('t.report_id = ?');
    values.push(report_id);
  }

  if (request_id) {
    conditions.push('t.request_id = ?');
    values.push(request_id);
  }

  if (issue_id) {
    conditions.push('t.issue_id = ?');
    values.push(issue_id);
  }

  if (status) {
    conditions.push('t.status = ?');
    values.push(status);
  }

  if (priority) {
    conditions.push('t.priority = ?');
    values.push(priority);
  }

  if (task_type) {
    conditions.push('t.task_type = ?');
    values.push(task_type);
  }

  if (start_date) {
    conditions.push('DATE(t.created_at) >= ?');
    values.push(start_date);
  }

  if (end_date) {
    conditions.push('DATE(t.created_at) <= ?');
    values.push(end_date);
  }

  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern);
  }

  if (parent_task_id !== undefined) {
    const parentIdStr = String(parent_task_id);
    if (parentIdStr === 'null' || parentIdStr === '') {
      conditions.push('t.parent_task_id IS NULL');
    } else {
      conditions.push('t.parent_task_id = ?');
      values.push(parseInt(parentIdStr, 10));
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM tasks t ${whereClause}`,
    values
  );
  const total = countResult[0]?.total || 0;

  // Get paginated results
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  values.push(limitNum, offset);

  const tasks = await query(
    `
    SELECT 
      t.*,
      u_creator.username as creator_username,
      u_creator.full_name as creator_name,
      u_assigned.username as assigned_user,
      u_assigned.full_name as assignee_name,
      dr.report_date,
      r.title as request_title,
      i.title as issue_title,
      p.prompt_text as related_prompt,
      pt.title as parent_task_title,
      (SELECT COUNT(*) FROM task_files tf WHERE tf.task_id = t.task_id) as files_affected_count
    FROM tasks t
    LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
    LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
    LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
    LEFT JOIN requests r ON t.request_id = r.request_id
    LEFT JOIN issues i ON t.issue_id = i.issue_id
    LEFT JOIN ai_prompts p ON t.prompt_id = p.prompt_id
    LEFT JOIN tasks pt ON t.parent_task_id = pt.task_id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
    `,
    values
  );

  return res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced>>,
  user: any
) {
  const {
    title,
    description,
    status = 'pending',
    priority = 'medium',
    task_type = 'development',
    estimated_hours,
    due_date,
    assigned_to,
    report_id,
    request_id,
    issue_id,
    prompt_id,
    parent_task_id
  } = req.body as TaskCreate;

  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }

  try {
    // Insert task
    const result = await execute(
      `
      INSERT INTO tasks (
        user_id, assigned_to, report_id, request_id, issue_id, prompt_id, parent_task_id,
        title, description, status, priority, task_type, estimated_hours, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user.user_id,
        assigned_to || user.user_id, // Default to creator if not specified
        report_id || null,
        request_id || null,
        issue_id || null,
        prompt_id || null,
        parent_task_id || null,
        title,
        description || null,
        status,
        priority,
        task_type,
        estimated_hours || null,
        due_date || null
      ]
    );

    const taskId = result.insertId;

    // Fetch the created task with joined data
    const tasks = await query(
      `
      SELECT 
        t.*,
        u_creator.username as creator_username,
        u_creator.full_name as creator_name,
        u_assigned.username as assigned_user,
        u_assigned.full_name as assignee_name,
        dr.report_date,
        r.title as request_title,
        i.title as issue_title
      FROM tasks t
      LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
      LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
      LEFT JOIN requests r ON t.request_id = r.request_id
      LEFT JOIN issues i ON t.issue_id = i.issue_id
      WHERE t.task_id = ?
      `,
      [taskId]
    );

    return res.status(201).json({
      success: true,
      data: tasks[0],
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create task: ' + (error as Error).message
    });
  }
}
