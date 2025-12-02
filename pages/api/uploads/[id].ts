import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOne, execute } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { DataUpload, ApiResponse, AuthUser } from '@/types';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const user = (req as any).user as AuthUser;
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ success: false, error: 'Invalid upload ID' });
  }

  const uploadId = parseInt(id);

  if (req.method === 'GET') {
    return handleGet(res, user, uploadId);
  } else if (req.method === 'DELETE') {
    return handleDelete(res, user, uploadId);
  } else {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

async function handleGet(
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  uploadId: number
) {
  try {
    const upload = await queryOne<DataUpload>(
      'SELECT * FROM data_uploads WHERE id = ?',
      [uploadId]
    );

    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    if (user.role === 'programmer' && upload.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    return res.status(200).json({ success: true, data: upload });
  } catch (error) {
    console.error('Get upload error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDelete(
  res: NextApiResponse<ApiResponse>,
  user: AuthUser,
  uploadId: number
) {
  try {
    const upload = await queryOne<DataUpload>(
      'SELECT * FROM data_uploads WHERE id = ?',
      [uploadId]
    );

    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    if (user.role === 'programmer' && upload.user_id !== user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await execute('DELETE FROM data_uploads WHERE id = ?', [uploadId]);

    return res.status(200).json({
      success: true,
      message: 'Upload deleted successfully',
    });
  } catch (error) {
    console.error('Delete upload error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireAuth(handler);