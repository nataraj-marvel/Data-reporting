import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { ProblemSolved, ProblemSolvedUpdate, ApiResponse, AuthUser } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const user = (req as any).user as AuthUser;
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid solution ID' });
  }

  const solutionId = parseInt(id);

  if (req.method === 'GET') {
    return handleGet(res, user, solutionId);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, user, solutionId);
  } else if (req.method === 'DELETE') {
    return handleDelete(res, user, solutionId);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  solutionId: number
) {
  try {
    const solution = await queryOne<ProblemSolved>(
      'SELECT * FROM problems_solved WHERE id = ?',
      [solutionId]
    );

    if (!solution) {
      return res.status(404).json({ success: false, error: 'Solution not found' });
    }

    if (user.role === 'programmer' && solution.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    return res.status(200).json({ success: true, data: solution });
  } catch (error) {
    console.error('Get solution error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  solutionId: number
) {
  try {
    const solution = await queryOne<ProblemSolved>(
      'SELECT * FROM problems_solved WHERE id = ?',
      [solutionId]
    );

    if (!solution) {
      return res.status(404).json({ success: false, error: 'Solution not found' });
    }

    if (user.role === 'programmer' && solution.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const data: ProblemSolvedUpdate = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.problem_description !== undefined) {
      updates.push('problem_description = ?');
      params.push(data.problem_description);
    }
    if (data.solution_description !== undefined) {
      updates.push('solution_description = ?');
      params.push(data.solution_description);
    }
    if (data.time_spent !== undefined) {
      updates.push('time_spent = ?');
      params.push(data.time_spent);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      params.push(data.tags);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(solutionId);
    await execute(`UPDATE problems_solved SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedSolution = await queryOne<ProblemSolved>(
      'SELECT * FROM problems_solved WHERE id = ?',
      [solutionId]
    );

    return res.status(200).json({
      success: true,
      data: updatedSolution,
      message: 'Solution updated successfully',
    });
  } catch (error) {
    console.error('Update solution error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDelete(
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  solutionId: number
) {
  try {
    const solution = await queryOne<ProblemSolved>(
      'SELECT * FROM problems_solved WHERE id = ?',
      [solutionId]
    );

    if (!solution) {
      return res.status(404).json({ success: false, error: 'Solution not found' });
    }

    if (user.role === 'programmer' && solution.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await execute('DELETE FROM problems_solved WHERE id = ?', [solutionId]);

    return res.status(200).json({
      success: true,
      message: 'Solution deleted successfully',
    });
  } catch (error) {
    console.error('Delete solution error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireAuth(handler);