import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ProblemSolved, ProblemSolvedCreate, ApiResponse, AuthUser } from '@/types';

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
    const { report_id, issue_id } = req.query;

    let sql = 'SELECT * FROM problems_solved WHERE 1=1';
    const params: any[] = [];

    if (user.role === 'programmer') {
      sql += ' AND user_id = ?';
      params.push(user.id);
    }

    if (report_id) {
      sql += ' AND report_id = ?';
      params.push(report_id);
    }

    if (issue_id) {
      sql += ' AND issue_id = ?';
      params.push(issue_id);
    }

    sql += ' ORDER BY created_at DESC';

    const solutions = await query<ProblemSolved>(sql, params);

    return res.status(200).json({
      success: true,
      data: solutions,
    });
  } catch (error) {
    console.error('Get solutions error:', error);
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
    const data: ProblemSolvedCreate = req.body;

    if (!data.report_id || !data.title || !data.problem_description || !data.solution_description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const result = await execute(
      `INSERT INTO problems_solved 
       (report_id, user_id, issue_id, title, problem_description, solution_description, time_spent, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.report_id,
        user.id,
        data.issue_id || null,
        data.title,
        data.problem_description,
        data.solution_description,
        data.time_spent || null,
        data.tags || null,
      ]
    );

    const newSolution = await query<ProblemSolved>(
      'SELECT * FROM problems_solved WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newSolution[0],
      message: 'Solution created successfully',
    });
  } catch (error) {
    console.error('Create solution error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);