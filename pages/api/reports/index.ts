import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { DailyReport, ApiResponse, AuthUser } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const user = (req as any).user as AuthUser;

  if (req.method === 'GET') {
    return handleGet(req, res, user);
  } else if (req.method === 'POST') {
    return handlePost(req, res, user);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser
) {
  try {
    const {
      user_id,
      start_date,
      end_date,
      status,
      page = '1',
      limit = '10',
    } = req.query;

    let sql = `
      SELECT r.*, t.title as task_title, u.full_name 
      FROM daily_reports r
      LEFT JOIN tasks t ON r.task_id = t.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by user (programmers can only see their own reports)
    if (user.role === 'programmer') {
      sql += ' AND r.user_id = ?';
      params.push(user.id);
    } else if (user_id) {
      sql += ' AND r.user_id = ?';
      params.push(user_id);
    }

    // Date range filter
    if (start_date) {
      sql += ' AND r.report_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND r.report_date <= ?';
      params.push(end_date);
    }

    // Status filter
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    // Count total
    const countSql = sql.replace('SELECT r.*, t.title as task_title, u.full_name', 'SELECT COUNT(*) as total');
    const countResult = await query<{ total: number }>(countSql, params);
    const total = countResult[0]?.total || 0;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    sql += ' ORDER BY r.report_date DESC, r.start_time DESC, r.created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const reports = await query<DailyReport>(sql, params);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser
) {
  try {
    const data = req.body;

    // Validate required fields
    if (!data.report_date || !data.work_description || !data.hours_worked) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: report_date, work_description, hours_worked',
      });
    }

    // Removed the "Report already exists for this date" check to allow multiple reports per day (hourly)

    const result = await execute(
      `INSERT INTO daily_reports 
       (user_id, report_date, start_time, end_time, task_id, work_description, hours_worked, tasks_completed, blockers, notes, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        data.report_date,
        data.start_time || null,
        data.end_time || null,
        data.task_id || null,
        data.work_description,
        data.hours_worked,
        data.tasks_completed || null,
        data.blockers || null,
        data.notes || null,
        data.status || 'draft',
        data.status === 'submitted' ? new Date() : null,
      ]
    );

    const newReport = await query<DailyReport>(
      'SELECT * FROM daily_reports WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newReport[0],
      message: 'Report created successfully',
    });
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);