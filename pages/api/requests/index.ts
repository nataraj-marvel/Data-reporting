// pages/api/requests/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { Request, RequestCreate, ApiResponse, RequestFilters } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request | Request[]>>
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
    console.error('Requests API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Request[]>>,
  user: any
) {
  const {
    user_id,
    assigned_to,
    status,
    priority,
    request_type,
    start_date,
    end_date,
    search,
    page = '1',
    limit = '20'
  } = req.query as Partial<RequestFilters> & { page?: string; limit?: string };

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];

  if (user_id) {
    conditions.push('r.user_id = ?');
    values.push(user_id);
  }

  if (assigned_to) {
    conditions.push('r.assigned_to = ?');
    values.push(assigned_to);
  }

  if (status) {
    conditions.push('r.status = ?');
    values.push(status);
  }

  if (priority) {
    conditions.push('r.priority = ?');
    values.push(priority);
  }

  if (request_type) {
    conditions.push('r.request_type = ?');
    values.push(request_type);
  }

  if (start_date) {
    conditions.push('DATE(r.created_at) >= ?');
    values.push(start_date);
  }

  if (end_date) {
    conditions.push('DATE(r.created_at) <= ?');
    values.push(end_date);
  }

  if (search) {
    conditions.push('(r.title LIKE ? OR r.description LIKE ?)');
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM requests r ${whereClause}`,
    values
  );
  const total = countResult[0]?.total || 0;

  // Get paginated results
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  values.push(limitNum, offset);

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
    ${whereClause}
    GROUP BY r.request_id
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
    `,
    values
  );

  return res.status(200).json({
    success: true,
    data: requests,
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
  res: NextApiResponse<ApiResponse<Request>>,
  user: any
) {
  const {
    title,
    description,
    request_type = 'feature',
    priority = 'medium',
    status = 'submitted',
    acceptance_criteria,
    estimated_hours,
    assigned_to,
    due_date,
    report_id
  } = req.body as RequestCreate;

  // Validation
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }

  if (!description || description.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Description is required'
    });
  }

  // Insert request
  const result = await execute(
    `
    INSERT INTO requests (
      user_id, report_id, title, description, request_type,
      priority, status, acceptance_criteria, estimated_hours,
      assigned_to, due_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      user.id,
      report_id || null,
      title,
      description,
      request_type,
      priority,
      status,
      acceptance_criteria || null,
      estimated_hours || null,
      assigned_to || null,
      due_date || null
    ]
  );

  const requestId = result.insertId;

  // Fetch the created request with joined data
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
    [requestId]
  );

  return res.status(201).json({
    success: true,
    data: requests[0],
    message: 'Request created successfully'
  });
}