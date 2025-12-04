// pages/api/tasks/[id].ts - Updated for v2.0 schema
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { TaskEnhanced, TaskUpdate, ApiResponse } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced>>
) {
  try {
    // Verify authentication
    const user = await verifyAuth(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
      return await handleGet(req, res, user, id as string);
    } else if (req.method === 'PUT') {
      return await handlePut(req, res, user, id as string);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, user, id as string);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Task API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced>>,
  user: any,
  id: string
) {
  const tasks = await query(
    `
    SELECT 
      t.*,
      u_creator.username as creator_username,
      u_creator.full_name as creator_name,
      u_assigned.username as assigned_user,
      u_assigned.full_name as assigned_user_name,
      dr.report_date,
      r.title as request_title,
      i.title as issue_title,
      p.prompt_text as related_prompt,
      pt.title as parent_task_title
    FROM tasks t
    LEFT JOIN users u_creator ON t.user_id = u_creator.user_id
    LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.user_id
    LEFT JOIN daily_reports dr ON t.report_id = dr.report_id
    LEFT JOIN requests r ON t.request_id = r.request_id
    LEFT JOIN issues i ON t.issue_id = i.issue_id
    LEFT JOIN ai_prompts p ON t.prompt_id = p.prompt_id
    LEFT JOIN tasks pt ON t.parent_task_id = pt.task_id
    WHERE t.task_id = ?
    `,
    [id]
  );

  if (tasks.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  const task = tasks[0];

  // Check access permission
  if (user.role !== 'admin' && task.user_id !== user.user_id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Get associated files
  const files = await query(
    `
    SELECT 
      fv.*,
      u.username
    FROM file_versions fv
    INNER JOIN task_files tf ON fv.file_version_id = tf.file_version_id
    LEFT JOIN users u ON fv.user_id = u.user_id
    WHERE tf.task_id = ?
    ORDER BY fv.created_at DESC
    `,
    [id]
  );

  task.files_affected = files;

  // Get subtasks
  const subtasks = await query(
    `
    SELECT t.*, u.full_name as assigned_user_name
    FROM tasks t
    LEFT JOIN users u ON t.user_id = u.user_id
    WHERE t.parent_task_id = ?
    ORDER BY t.created_at ASC
    `,
    [id]
  );

  task.subtasks = subtasks;

  return res.status(200).json({
    success: true,
    data: task
  });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced>>,
  user: any,
  id: string
) {
  // Check if task exists and user has permission
  const existing = await query(
    'SELECT user_id FROM tasks WHERE task_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  if (user.role !== 'admin' && existing[0].user_id !== user.user_id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const {
    title,
    description,
    status,
    priority,
    task_type,
    estimated_hours,
    actual_hours,
    completion_percentage,
    due_date,
    assigned_to,
    blocked_reason,
    parent_task_id
  } = req.body as TaskUpdate;

  // Build update query dynamically
  const updates: string[] = [];
  const values: any[] = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    
    // Auto-set timestamps based on status
    if (status === 'in_progress') {
      updates.push('started_at = COALESCE(started_at, CURRENT_TIMESTAMP)');
    } else if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
      updates.push('completion_percentage = 100');
    }
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (task_type !== undefined) {
    updates.push('task_type = ?');
    values.push(task_type);
  }
  if (estimated_hours !== undefined) {
    updates.push('estimated_hours = ?');
    values.push(estimated_hours);
  }
  if (actual_hours !== undefined) {
    updates.push('actual_hours = ?');
    values.push(actual_hours);
  }
  if (completion_percentage !== undefined) {
    updates.push('completion_percentage = ?');
    values.push(completion_percentage);
  }
  if (due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(due_date);
  }
  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    values.push(assigned_to);
  }
  if (blocked_reason !== undefined) {
    updates.push('blocked_reason = ?');
    values.push(blocked_reason);
  }
  if (parent_task_id !== undefined) {
    updates.push('parent_task_id = ?');
    values.push(parent_task_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  await query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = ?`,
    values
  );

  // Fetch updated task
  const tasks = await query(
    `
    SELECT 
      t.*,
      u_creator.username as creator_username,
      u_creator.full_name as creator_name,
      u_assigned.username as assigned_user,
      u_assigned.full_name as assigned_user_name,
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
    [id]
  );

  return res.status(200).json({
    success: true,
    data: tasks[0],
    message: 'Task updated successfully'
  });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<TaskEnhanced>>,
  user: any,
  id: string
) {
  // Check if task exists and user has permission
  const existing = await query(
    'SELECT user_id FROM tasks WHERE task_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  // Only creator or admin can delete
  if (user.role !== 'admin' && existing[0].user_id !== user.user_id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await query('DELETE FROM tasks WHERE task_id = ?', [id]);

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
}
