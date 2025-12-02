import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { DailyReport, DailyReportCreate, ApiResponse, AuthUser } from '@/types';

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

    let sql = 'SELECT * FROM daily_reports WHERE 1=1';
    const params: any[] = [];

    // Filter by user (programmers can only see their own reports)
    if (user.role === 'programmer') {
      sql += ' AND user_id = ?';
      params.push(user.id);
    } else if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    // Date range filter
    if (start_date) {
      sql += ' AND report_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND report_date <= ?';
      params.push(end_date);
    }

    // Status filter
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Count total
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query<{ total: number }>(countSql, params);
    const total = countResult[0]?.total || 0;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    sql += ' ORDER BY report_date DESC, created_at DESC LIMIT ? OFFSET ?';
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
    const data: DailyReportCreate = req.body;

    // Validate required fields
    if (!data.report_date || !data.work_description || !data.hours_worked) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: report_date, work_description, hours_worked',
      });
    }

    // Check if report already exists for this date
    const existing = await query<DailyReport>(
      'SELECT id FROM daily_reports WHERE user_id = ? AND report_date = ?',
      [user.id, data.report_date]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Report already exists for this date',
      });
    }

    const result = await execute(
      `INSERT INTO daily_reports 
       (user_id, report_date, work_description, hours_worked, tasks_completed, blockers, notes, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        data.report_date,
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