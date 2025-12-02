import type { NextApiRequest, NextApiResponse } from 'next';
import { query, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { DataUpload, DataUploadCreate, ApiResponse, AuthUser } from '@/types';

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
    const { report_id } = req.query;

    let sql = 'SELECT * FROM data_uploads WHERE 1=1';
    const params: any[] = [];

    if (user.role === 'programmer') {
      sql += ' AND user_id = ?';
      params.push(user.id);
    }

    if (report_id) {
      sql += ' AND report_id = ?';
      params.push(report_id);
    }

    sql += ' ORDER BY created_at DESC';

    const uploads = await query<DataUpload>(sql, params);

    return res.status(200).json({
      success: true,
      data: uploads,
    });
  } catch (error) {
    console.error('Get uploads error:', error);
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
    const data: DataUploadCreate = req.body;

    if (!data.report_id || !data.file_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: report_id, file_name',
      });
    }

    const result = await execute(
      `INSERT INTO data_uploads 
       (report_id, user_id, file_name, file_type, file_size, upload_path, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.report_id,
        user.id,
        data.file_name,
        data.file_type || null,
        data.file_size || null,
        data.upload_path || null,
        data.description || null,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );

    const newUpload = await query<DataUpload>(
      'SELECT * FROM data_uploads WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newUpload[0],
      message: 'Upload record created successfully',
    });
  } catch (error) {
    console.error('Create upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default requireAuth(handler);