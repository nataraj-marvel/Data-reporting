import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Issue, IssueUpdate, ApiResponse, AuthUser } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const user = (req as any).user as AuthUser;
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid issue ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, user, parseInt(id));
  } else if (req.method === 'PUT') {
    return handlePut(req, res, user, parseInt(id));
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, user, parseInt(id));
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  issueId: number
) {
  try {
    const issue = await queryOne<Issue>(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found',
      });
    }

    if (user.role === 'programmer' && issue.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    return res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error('Get issue error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  issueId: number
) {
  try {
    const issue = await queryOne<Issue>(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found',
      });
    }

    if (user.role === 'programmer' && issue.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    const data: IssueUpdate = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.severity !== undefined) {
      updates.push('severity = ?');
      params.push(data.severity);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
      
      if (data.status === 'resolved' || data.status === 'closed') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    params.push(issueId);
    await execute(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedIssue = await queryOne<Issue>(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    return res.status(200).json({
      success: true,
      data: updatedIssue,
      message: 'Issue updated successfully',
    });
  } catch (error) {
    console.error('Update issue error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  issueId: number
) {
  try {
    const issue = await queryOne<Issue>(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found',
      });
    }

    if (user.role === 'programmer' && issue.user_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    await execute('DELETE FROM issues WHERE id = ?', [issueId]);

    return res.status(200).json({
      success: true,
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);