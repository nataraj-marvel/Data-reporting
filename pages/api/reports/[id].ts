import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { DailyReport, DailyReportUpdate, ApiResponse, AuthUser } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const user = (req as any).user as AuthUser;
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid report ID' });
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
  reportId: number
) {
  try {
    const report = await queryOne<DailyReport>(
      'SELECT * FROM daily_reports WHERE report_id = ?',
      [reportId]
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    // Check permissions
    if (user.role === 'programmer' && report.user_id !== user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    // Get related data
    const [issues, solutions, uploads] = await Promise.all([
      query('SELECT * FROM issues WHERE report_id = ?', [reportId]),
      query('SELECT * FROM problems_solved WHERE report_id = ?', [reportId]),
      query('SELECT * FROM data_uploads WHERE report_id = ?', [reportId]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...report,
        issues,
        solutions,
        uploads,
      },
    });
  } catch (error) {
    console.error('Get report error:', error);
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
  reportId: number
) {
  try {
    const report = await queryOne<DailyReport>(
      'SELECT * FROM daily_reports WHERE report_id = ?',
      [reportId]
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    // Check permissions
    if (user.role === 'programmer' && report.user_id !== user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    const data: DailyReportUpdate = req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (data.work_description !== undefined) {
      updates.push('work_description = ?');
      params.push(data.work_description);
    }
    if (data.hours_worked !== undefined) {
      updates.push('hours_worked = ?');
      params.push(data.hours_worked);
    }
    if (data.tasks_completed !== undefined) {
      updates.push('tasks_completed = ?');
      params.push(data.tasks_completed);
    }
    if (data.blockers !== undefined) {
      updates.push('blockers = ?');
      params.push(data.blockers);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }
    if (data.start_time !== undefined) {
      updates.push('start_time = ?');
      params.push(data.start_time);
    }
    if (data.end_time !== undefined) {
      updates.push('end_time = ?');
      params.push(data.end_time);
    }
    if (data.task_id !== undefined) {
      updates.push('task_id = ?');
      params.push(data.task_id);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);

      // Update submitted_at if status changed to submitted
      if (data.status === 'submitted' && report.status !== 'submitted') {
        updates.push('submitted_at = NOW()');
      }

      // Update reviewed_at if status changed to reviewed (admin only)
      if (data.status === 'reviewed' && user.role === 'admin') {
        updates.push('reviewed_at = NOW()');
        updates.push('reviewed_by = ?');
        params.push(user.user_id);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    params.push(reportId);
    await execute(
      `UPDATE daily_reports SET ${updates.join(', ')} WHERE report_id = ?`,
      params
    );

    const updatedReport = await queryOne<DailyReport>(
      'SELECT * FROM daily_reports WHERE report_id = ?',
      [reportId]
    );

    return res.status(200).json({
      success: true,
      data: updatedReport,
      message: 'Report updated successfully',
    });
  } catch (error) {
    console.error('Update report error:', error);
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
  reportId: number
) {
  try {
    const report = await queryOne<DailyReport>(
      'SELECT * FROM daily_reports WHERE report_id = ?',
      [reportId]
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    // Check permissions
    if (user.role === 'programmer' && report.user_id !== user.user_id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    // Only allow deletion of draft reports or by admin
    if (report.status !== 'draft' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only draft reports can be deleted',
      });
    }

    await execute('DELETE FROM daily_reports WHERE report_id = ?', [reportId]);

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);