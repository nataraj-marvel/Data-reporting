import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Issue, IssueCreate, ApiResponse, AuthUser } from '@/types';

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
    const { report_id, status, severity } = req.query;

    let sql = 'SELECT * FROM issues WHERE 1=1';
    const params: any[] = [];

    if (user.role === 'programmer') {
      sql += ' AND user_id = ?';
      params.push(user.id);
    }

    if (report_id) {
      sql += ' AND report_id = ?';
      params.push(report_id);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (severity) {
      sql += ' AND severity = ?';
      params.push(severity);
    }

    sql += ' ORDER BY created_at DESC';

    const issues = await query<Issue>(sql, params);

    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Get issues error:', error);
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
    const data: IssueCreate = req.body;

    if (!data.report_id || !data.title || !data.description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: report_id, title, description',
      });
    }

    const result = await execute(
      `INSERT INTO issues (report_id, user_id, title, description, severity, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.report_id,
        user.id,
        data.title,
        data.description,
        data.severity || 'medium',
        data.category || null,
      ]
    );

    const newIssue = await query<Issue>(
      'SELECT * FROM issues WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newIssue[0],
      message: 'Issue created successfully',
    });
  } catch (error) {
    console.error('Create issue error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);