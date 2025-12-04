// pages/api/files/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { FileVersion, FileVersionCreate, ApiResponse, FileFilters } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion | FileVersion[]>>
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
    console.error('File Versions API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion[]>>,
  user: any
) {
  const {
    file_path,
    user_id,
    report_id,
    task_id,
    change_type,
    commit_hash,
    start_date,
    end_date,
    page = '1',
    limit = '50'
  } = req.query as Partial<FileFilters> & { page?: string; limit?: string };

  // Build WHERE clause
  const conditions: string[] = [];
  const values: any[] = [];

  if (file_path) {
    conditions.push('fv.file_path LIKE ?');
    values.push(`%${file_path}%`);
  }

  if (user_id) {
    conditions.push('fv.user_id = ?');
    values.push(user_id);
  }

  if (report_id) {
    conditions.push('fv.report_id = ?');
    values.push(report_id);
  }

  if (task_id) {
    conditions.push('fv.task_id = ?');
    values.push(task_id);
  }

  if (change_type) {
    conditions.push('fv.change_type = ?');
    values.push(change_type);
  }

  if (commit_hash) {
    conditions.push('fv.commit_hash = ?');
    values.push(commit_hash);
  }

  if (start_date) {
    conditions.push('DATE(fv.created_at) >= ?');
    values.push(start_date);
  }

  if (end_date) {
    conditions.push('DATE(fv.created_at) <= ?');
    values.push(end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM file_versions fv ${whereClause}`,
    values
  );
  const total = countResult[0]?.total || 0;

  // Get paginated results
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  values.push(limitNum, offset);

  const fileVersions = await query(
    `
    SELECT 
      fv.*,
      u.username,
      u.full_name,
      t.title as task_title,
      ps.title as solution_title
    FROM file_versions fv
    LEFT JOIN users u ON fv.user_id = u.user_id
    LEFT JOIN tasks t ON fv.task_id = t.task_id
    LEFT JOIN problems_solved ps ON fv.solution_id = ps.solution_id
    ${whereClause}
    ORDER BY fv.created_at DESC
    LIMIT ? OFFSET ?
    `,
    values
  );

  return res.status(200).json({
    success: true,
    data: fileVersions,
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
  res: NextApiResponse<ApiResponse<FileVersion>>,
  user: any
) {
  const {
    file_path,
    version_number,
    change_type = 'modified',
    lines_added = 0,
    lines_deleted = 0,
    file_size_bytes,
    commit_hash,
    branch_name,
    change_description,
    file_content_snapshot,
    previous_version_id,
    metadata,
    report_id,
    task_id,
    solution_id
  } = req.body as FileVersionCreate;

  // Validation
  if (!file_path || file_path.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'File path is required'
    });
  }

  if (!version_number || version_number.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Version number is required'
    });
  }

  // Insert file version
  const result = await execute(
    `
    INSERT INTO file_versions (
      file_path, version_number, change_type, user_id, report_id, task_id,
      solution_id, lines_added, lines_deleted, file_size_bytes, commit_hash,
      branch_name, change_description, file_content_snapshot,
      previous_version_id, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      file_path,
      version_number,
      change_type,
      user.id,
      report_id || null,
      task_id || null,
      solution_id || null,
      lines_added,
      lines_deleted,
      file_size_bytes || null,
      commit_hash || null,
      branch_name || null,
      change_description || null,
      file_content_snapshot || null,
      previous_version_id || null,
      metadata ? JSON.stringify(metadata) : null
    ]
  );

  const fileVersionId = result.insertId;

  // Fetch the created file version with joined data
  const fileVersions = await query(
    `
    SELECT 
      fv.*,
      u.username,
      t.title as task_title,
      ps.title as solution_title
    FROM file_versions fv
    LEFT JOIN users u ON fv.user_id = u.user_id
    LEFT JOIN tasks t ON fv.task_id = t.task_id
    LEFT JOIN problems_solved ps ON fv.solution_id = ps.solution_id
    WHERE fv.file_version_id = ?
    `,
    [fileVersionId]
  );

  return res.status(201).json({
    success: true,
    data: fileVersions[0],
    message: 'File version created successfully'
  });
}