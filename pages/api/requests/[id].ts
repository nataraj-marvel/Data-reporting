// pages/api/requests/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { Request, RequestUpdate, ApiResponse } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request>>
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
    console.error('Request API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request>>,
  user: any,
  id: string
) {
  const requests = await query(
    `
    SELECT 
      r.*,
      creator.username as created_by_name,
      creator.full_name as created_by_fullname,
      assignee.username as assigned_to_username,
      assignee.full_name as assigned_to_name,
      COUNT(DISTINCT t.task_id) as task_count,
      SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
    FROM requests r
    LEFT JOIN users creator ON r.user_id = creator.user_id
    LEFT JOIN users assignee ON r.assigned_to = assignee.user_id
    LEFT JOIN tasks t ON r.request_id = t.request_id
    WHERE r.request_id = ?
    GROUP BY r.request_id
    `,
    [id]
  );

  if (requests.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Request not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: requests[0]
  });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request>>,
  user: any,
  id: string
) {
  // Check if request exists
  const existing = await query(
    'SELECT user_id, assigned_to FROM requests WHERE request_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Request not found'
    });
  }

  // Check permission (creator, assignee, or admin)
  const canEdit = user.role === 'admin' || 
                  existing[0].user_id === user.id || 
                  existing[0].assigned_to === user.id;

  if (!canEdit) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const {
    title,
    description,
    request_type,
    priority,
    status,
    acceptance_criteria,
    estimated_hours,
    actual_hours,
    assigned_to,
    due_date
  } = req.body as RequestUpdate;

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
  if (request_type !== undefined) {
    updates.push('request_type = ?');
    values.push(request_type);
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
  }
  if (acceptance_criteria !== undefined) {
    updates.push('acceptance_criteria = ?');
    values.push(acceptance_criteria);
  }
  if (estimated_hours !== undefined) {
    updates.push('estimated_hours = ?');
    values.push(estimated_hours);
  }
  if (actual_hours !== undefined) {
    updates.push('actual_hours = ?');
    values.push(actual_hours);
  }
  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    values.push(assigned_to);
  }
  if (due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(due_date);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  await query(
    `UPDATE requests SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Fetch updated request
  const requests = await query(
    `
    SELECT 
      r.*,
      creator.username as created_by_name,
      assignee.full_name as assigned_to_name
    FROM requests r
    LEFT JOIN users creator ON r.user_id = creator.user_id
    LEFT JOIN users assignee ON r.assigned_to = assignee.user_id
    WHERE r.request_id = ?
    `,
    [id]
  );

  return res.status(200).json({
    success: true,
    data: requests[0],
    message: 'Request updated successfully'
  });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request>>,
  user: any,
  id: string
) {
  // Check if request exists
  const existing = await query(
    'SELECT user_id FROM requests WHERE request_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Request not found'
    });
  }

  // Only creator or admin can delete
  if (user.role !== 'admin' && existing[0].user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await query('DELETE FROM requests WHERE id = ?', [id]);

  return res.status(200).json({
    success: true,
    message: 'Request deleted successfully'
  });
}


