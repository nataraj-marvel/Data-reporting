import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateRequest } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { User, ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authUser = await authenticateRequest(req);
    
    if (!authUser) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get full user details
    const user = await queryOne<User>(
      'SELECT user_id, username, role, full_name, email, created_at, updated_at, last_login, is_active FROM users WHERE user_id = ?',
      [authUser.id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}