// pages/api/files/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';
import { verifyAuth } from '../../../lib/auth';
import type { FileVersion, FileVersionUpdate, ApiResponse } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion>>
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
    console.error('File Version API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion>>,
  user: any,
  id: string
) {
  const fileVersions = await query(
    `
    SELECT 
      fv.*,
      u.username,
      u.full_name,
      t.title as task_title,
      ps.title as solution_title,
      prev.version_number as previous_version_number
    FROM file_versions fv
    LEFT JOIN users u ON fv.user_id = u.user_id
    LEFT JOIN tasks t ON fv.task_id = t.task_id
    LEFT JOIN problems_solved ps ON fv.solution_id = ps.solution_id
    LEFT JOIN file_versions prev ON fv.previous_version_id = prev.file_id
    WHERE fv.file_version_id = ?
    `,
    [id]
  );

  if (fileVersions.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'File version not found'
    });
  }

  return res.status(200).json({
    success: true,
    data: fileVersions[0]
  });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion>>,
  user: any,
  id: string
) {
  // Check if file version exists
  const existing = await query(
    'SELECT user_id FROM file_versions WHERE file_version_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'File version not found'
    });
  }

  // Only creator or admin can edit
  if (user.role !== 'admin' && existing[0].user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const {
    version_number,
    change_description,
    metadata
  } = req.body as FileVersionUpdate;

  // Build update query dynamically
  const updates: string[] = [];
  const values: any[] = [];

  if (version_number !== undefined) {
    updates.push('version_number = ?');
    values.push(version_number);
  }
  if (change_description !== undefined) {
    updates.push('change_description = ?');
    values.push(change_description);
  }
  if (metadata !== undefined) {
    updates.push('metadata = ?');
    values.push(JSON.stringify(metadata));
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    });
  }

  values.push(id);

  await query(
    `UPDATE file_versions SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Fetch updated file version
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
    [id]
  );

  return res.status(200).json({
    success: true,
    data: fileVersions[0],
    message: 'File version updated successfully'
  });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FileVersion>>,
  user: any,
  id: string
) {
  // Check if file version exists
  const existing = await query(
    'SELECT user_id FROM file_versions WHERE file_version_id = ?',
    [id]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'File version not found'
    });
  }

  // Only creator or admin can delete
  if (user.role !== 'admin' && existing[0].user_id !== user.id) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  await query('DELETE FROM file_versions WHERE id = ?', [id]);

  return res.status(200).json({
    success: true,
    message: 'File version deleted successfully'
  });
}


